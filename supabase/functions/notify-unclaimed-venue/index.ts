// Edge Function: notify-unclaimed-venue
// ----------------------------------------------------------------------------
// Triggered when a musician sends a proposal to an unclaimed venue (one that
// was indexed from OSM but hasn't registered yet). Sends an email to the
// venue with a one-click registration link prefilled with their data.
//
// Flow:
//   1. Validate caller is authenticated musician
//   2. Look up unclaimed venue + check rate limit (max 1 email/week)
//   3. Send email via Resend (https://resend.com)
//   4. Log to venue_outreach
//
// Env vars (set in Supabase Dashboard → Edge Functions → Secrets):
//   RESEND_API_KEY       — from resend.com/api-keys (free 100 emails/day)
//   APP_BASE_URL         — e.g. https://gigmatch-omega.vercel.app
//   FROM_EMAIL           — verified sender, e.g. hello@gigmatch.com
//
// Deploy:
//   npx supabase functions deploy notify-unclaimed-venue
// ----------------------------------------------------------------------------

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RATE_LIMIT_DAYS = 7;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestBody {
  unclaimed_venue_id: string;
  message: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── 1. Validate caller (musician) ─────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return json({ error: "Invalid auth token" }, 401);
    }

    // ── 2. Parse + validate body ──────────────────────────────────────────
    const body = (await req.json()) as RequestBody;
    if (!body.unclaimed_venue_id || !body.message) {
      return json(
        { error: "Body must include unclaimed_venue_id and message" },
        400,
      );
    }
    if (body.message.length > 2000) {
      return json({ error: "Message too long (max 2000 chars)" }, 400);
    }

    // ── 3. Service-role client for bypassing RLS on writes ────────────────
    const sbAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── 4. Fetch unclaimed venue + rate-limit check ───────────────────────
    const { data: venue, error: vErr } = await sbAdmin
      .from("unclaimed_venues")
      .select(
        "id, venue_name, email, claim_token, claimed_at, unsubscribed_at, last_outreach_at, outreach_count",
      )
      .eq("id", body.unclaimed_venue_id)
      .maybeSingle();

    if (vErr || !venue) {
      return json({ error: "Venue not found" }, 404);
    }
    if (venue.claimed_at) {
      return json(
        { error: "Venue already registered — use the regular chat" },
        409,
      );
    }
    if (venue.unsubscribed_at) {
      return json(
        { error: "Venue opted out and cannot be contacted" },
        403,
      );
    }
    if (!venue.email) {
      return json(
        { error: "No email on record for this venue (phone/SMS not yet supported)" },
        422,
      );
    }
    if (venue.last_outreach_at) {
      const ageDays =
        (Date.now() - new Date(venue.last_outreach_at).getTime()) /
        86_400_000;
      if (ageDays < RATE_LIMIT_DAYS) {
        return json(
          {
            error: `Rate limited — last outreach ${Math.round(
              ageDays,
            )}d ago, wait ${Math.ceil(RATE_LIMIT_DAYS - ageDays)}d`,
          },
          429,
        );
      }
    }

    // ── 5. Get musician display name ──────────────────────────────────────
    const { data: musicianProfile } = await sbAdmin
      .from("musician_profiles")
      .select("stage_name")
      .eq("user_id", user.id)
      .maybeSingle();
    const { data: profile } = await sbAdmin
      .from("profiles")
      .select("name")
      .eq("user_id", user.id)
      .maybeSingle();
    const musicianName =
      musicianProfile?.stage_name ?? profile?.name ?? "Muzyk z GigMatch";

    // ── 6. Send email via Resend ──────────────────────────────────────────
    const appUrl = Deno.env.get("APP_BASE_URL") ?? "https://gigmatch-omega.vercel.app";
    const claimUrl = `${appUrl}/register?claim=${venue.claim_token}`;
    const unsubUrl = `${appUrl}/api/unsubscribe-venue?token=${venue.claim_token}`;
    const fromEmail = Deno.env.get("FROM_EMAIL") ?? "hello@gigmatch.com";

    const html = renderEmail({
      venueName: venue.venue_name,
      musicianName,
      message: body.message,
      claimUrl,
      unsubUrl,
    });
    const text = renderEmailText({
      venueName: venue.venue_name,
      musicianName,
      message: body.message,
      claimUrl,
      unsubUrl,
    });

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return json({ error: "Email service not configured (RESEND_API_KEY)" }, 500);
    }

    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `GigMatch <${fromEmail}>`,
        to: [venue.email],
        subject: `${musicianName} chce u Was zagrać — GigMatch`,
        html,
        text,
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    });

    const resendBody = await resendResp.json();
    const emailStatus = resendResp.ok ? "sent" : "failed";
    const emailId = resendBody.id ?? null;
    const errorMessage = resendResp.ok ? null : JSON.stringify(resendBody);

    // ── 7. Log + bump rate-limit counters ─────────────────────────────────
    await sbAdmin.from("venue_outreach").insert({
      unclaimed_venue_id: venue.id,
      musician_user_id: user.id,
      message: body.message,
      email_to: venue.email,
      email_id: emailId,
      email_status: emailStatus,
      error_message: errorMessage,
    });

    if (resendResp.ok) {
      await sbAdmin
        .from("unclaimed_venues")
        .update({
          last_outreach_at: new Date().toISOString(),
          outreach_count: (venue.outreach_count ?? 0) + 1,
        })
        .eq("id", venue.id);
      return json({ ok: true, email_id: emailId }, 200);
    }

    return json({ error: "Email send failed", details: resendBody }, 502);
  } catch (err) {
    console.error("notify-unclaimed-venue error:", err);
    return json({ error: String(err) }, 500);
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function renderEmail(p: {
  venueName: string;
  musicianName: string;
  message: string;
  claimUrl: string;
  unsubUrl: string;
}): string {
  const safeMsg = escapeHtml(p.message).replace(/\n/g, "<br>");
  return `<!DOCTYPE html>
<html><body style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111;">
  <h2 style="font-size: 20px; margin: 0 0 16px;">Cześć ${escapeHtml(p.venueName)} 👋</h2>
  <p>Muzyk <strong>${escapeHtml(p.musicianName)}</strong> chce u Was zagrać:</p>
  <blockquote style="border-left: 3px solid #6366f1; margin: 16px 0; padding: 8px 16px; background: #f9fafb; color: #374151;">
    ${safeMsg}
  </blockquote>
  <p>Załóż darmowe konto na <strong>GigMatch</strong> (30 sekund) żeby odpowiedzieć — Twój profil już jest wypełniony danymi z Waszej strony:</p>
  <p style="text-align: center; margin: 32px 0;">
    <a href="${p.claimUrl}" style="background: #111; color: white; text-decoration: none; padding: 12px 24px; border-radius: 24px; font-weight: 600; display: inline-block;">
      Odpowiedz muzykowi →
    </a>
  </p>
  <p style="font-size: 13px; color: #6b7280;">GigMatch łączy muzyków z lokalami w okolicy. AI dopasowuje styl, gatunek i preferencje. Pełna kontrola — sami decydujecie z kim współpracować.</p>
  <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="font-size: 12px; color: #9ca3af;">
    Nie chcesz dostawać takich wiadomości? <a href="${p.unsubUrl}" style="color: #6b7280;">Wypisz się jednym kliknięciem</a>.
  </p>
</body></html>`;
}

function renderEmailText(p: {
  venueName: string;
  musicianName: string;
  message: string;
  claimUrl: string;
  unsubUrl: string;
}): string {
  return `Cześć ${p.venueName},

Muzyk ${p.musicianName} chce u Was zagrać:

${p.message}

Załóż darmowe konto na GigMatch (30 sekund) i odpowiedz mu:
${p.claimUrl}

Wasz profil już jest wypełniony — wystarczy potwierdzić.

---
Nie chcesz dostawać takich wiadomości? Wypisz się: ${p.unsubUrl}
`;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
