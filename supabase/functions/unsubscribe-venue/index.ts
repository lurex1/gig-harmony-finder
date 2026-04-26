// Edge Function: unsubscribe-venue
// ----------------------------------------------------------------------------
// One-click unsubscribe for unclaimed venues. Triggered from email's
// "List-Unsubscribe" header AND footer link. Marks the venue as opted-out
// so they will never receive another outreach email.
//
// Endpoint: GET / POST  ?token=CLAIM_TOKEN[&reason=...]
//
// Returns a friendly HTML page (not JSON) since this is hit by humans
// clicking the email link.
// ----------------------------------------------------------------------------

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const reason = url.searchParams.get("reason") ?? null;

  if (!token) {
    return htmlResponse(
      400,
      "Brakuje tokenu",
      "<p>Link wypisu jest niepełny. Skopiuj go z emaila i spróbuj ponownie.</p>",
    );
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await sb
    .from("unclaimed_venues")
    .update({
      unsubscribed_at: new Date().toISOString(),
      unsubscribe_reason: reason,
    })
    .eq("claim_token", token)
    .is("unsubscribed_at", null)
    .select("id, venue_name")
    .maybeSingle();

  if (error) {
    console.error("unsubscribe error:", error);
    return htmlResponse(
      500,
      "Błąd serwera",
      "<p>Coś poszło nie tak. Napisz do nas na hello@gigmatch.com — załatwimy ręcznie.</p>",
    );
  }

  if (!data) {
    // Either invalid token, or already unsubscribed — both lead to the same UX
    return htmlResponse(
      200,
      "Już wypisany",
      "<p>Ten lokal jest już wypisany albo link jest nieprawidłowy. Nie wyślemy więcej wiadomości.</p>",
    );
  }

  return htmlResponse(
    200,
    "Wypisano",
    `<p>Wypisaliśmy <strong>${escapeHtml(data.venue_name)}</strong> z dalszych zaproszeń.</p>
     <p style="color:#6b7280">Jeśli to był błąd — odpisz na maila i przywrócimy.</p>`,
  );
});

function htmlResponse(status: number, title: string, body: string) {
  const html = `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8">
  <title>${title} — GigMatch</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 480px; margin: 80px auto; padding: 24px; color: #111; text-align: center; }
    h1 { font-size: 24px; margin-bottom: 16px; }
    a { color: #6366f1; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${body}
  <p style="margin-top:32px"><a href="https://gigmatch-omega.vercel.app">Wróć do GigMatch</a></p>
</body></html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
