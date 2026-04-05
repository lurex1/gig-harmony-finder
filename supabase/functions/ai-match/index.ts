import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MusicianProfile {
  user_id?: string;
  stage_name?: string | null;
  genres?: string[];
  instruments?: string[];
  style?: string | null;
  repertoire?: string | null;
  performance_type?: string | null;
  hourly_rate?: number | null;
}

interface VenueProfile {
  user_id?: string;
  venue_name?: string;
  venue_type?: string | null;
  atmosphere?: string | null;
  occasion?: string | null;
  expectations?: string | null;
  budget_per_gig?: number | null;
}

interface BatchResult {
  user_id: string;
  score: number;
  justification: string;
}

function describeMusicianShort(m: MusicianProfile): string {
  return [
    m.stage_name ? `Nazwa: ${m.stage_name}` : null,
    m.genres?.length ? `Gatunki: ${m.genres.join(", ")}` : null,
    m.instruments?.length ? `Instrumenty: ${m.instruments.join(", ")}` : null,
    m.style ? `Styl: ${m.style}` : null,
    m.repertoire ? `Repertuar: ${m.repertoire}` : null,
    m.performance_type ? `Charakter: ${m.performance_type}` : null,
    m.hourly_rate != null ? `Stawka: ${m.hourly_rate} zł/h` : null,
  ].filter(Boolean).join(", ");
}

function describeVenueShort(v: VenueProfile): string {
  return [
    v.venue_name ? `Nazwa: ${v.venue_name}` : null,
    v.venue_type ? `Typ: ${v.venue_type}` : null,
    v.atmosphere ? `Atmosfera: ${v.atmosphere}` : null,
    v.occasion ? `Okazja: ${v.occasion}` : null,
    v.expectations ? `Oczekiwania: ${v.expectations}` : null,
    v.budget_per_gig != null ? `Budżet: ${v.budget_per_gig} zł` : null,
  ].filter(Boolean).join(", ");
}

function buildBatchMusicianPrompt(musician: MusicianProfile, venues: VenueProfile[]): string {
  const musicianDesc = describeMusicianShort(musician) || "Brak danych muzyka";
  const venueList = venues
    .map((v, i) => `[${i}] user_id="${v.user_id}" | ${describeVenueShort(v) || "Brak danych lokalu"}`)
    .join("\n");

  return `Jesteś ekspertem od doboru muzyki na żywo do lokali gastronomicznych i eventowych.

PROFIL MUZYKA:
${musicianDesc}

LOKALE DO OCENY (oceń każdy):
${venueList}

ZASADY OCENIANIA (ważne!):
1. Skala 0–100. Próg dopasowania = 50.
2. DRASTYCZNA rozbieżność (np. stawka muzyka >3× budżet lokalu, zupełnie sprzeczne style muzyczne) → wynik 0–25, WYKLUCZA dopasowanie.
3. Pole puste po OBU stronach → pomiń ten element, nie karaj.
4. Pole wypełnione tylko PO JEDNEJ stronie → małe obniżenie (−5 do −10 pkt), NIE wyklucza.
5. Uzasadnienie: 1–2 zdania po polsku, konkretnie dlaczego taki wynik.

Zwróć WYŁĄCZNIE tablicę JSON (bez markdown, bez komentarzy, bez dodatkowego tekstu):
[{"user_id":"...","score":75,"justification":"..."},...]`;
}

function buildBatchVenuePrompt(venue: VenueProfile, musicians: MusicianProfile[]): string {
  const venueDesc = describeVenueShort(venue) || "Brak danych lokalu";
  const musicianList = musicians
    .map((m, i) => `[${i}] user_id="${m.user_id}" | ${describeMusicianShort(m) || "Brak danych muzyka"}`)
    .join("\n");

  return `Jesteś ekspertem od doboru muzyki na żywo do lokali gastronomicznych i eventowych.

PROFIL LOKALU:
${venueDesc}

MUZYCY DO OCENY (oceń każdego):
${musicianList}

ZASADY OCENIANIA (ważne!):
1. Skala 0–100. Próg dopasowania = 50.
2. DRASTYCZNA rozbieżność (np. stawka muzyka >3× budżet lokalu, zupełnie sprzeczne style muzyczne) → wynik 0–25, WYKLUCZA dopasowanie.
3. Pole puste po OBU stronach → pomiń ten element, nie karaj.
4. Pole wypełnione tylko PO JEDNEJ stronie → małe obniżenie (−5 do −10 pkt), NIE wyklucza.
5. Uzasadnienie: 1–2 zdania po polsku, konkretnie dlaczego taki wynik.

Zwróć WYŁĄCZNIE tablicę JSON (bez markdown, bez komentarzy, bez dodatkowego tekstu):
[{"user_id":"...","score":75,"justification":"..."},...]`;
}

// Legacy single-match prompt (backward compat)
function buildSinglePrompt(musician: MusicianProfile, venue: VenueProfile): string {
  const m = describeMusicianShort(musician) || "Brak danych";
  const v = describeVenueShort(venue) || "Brak danych";
  return `Oceń dopasowanie muzyka do lokalu. Zwróć JSON bez markdown:
{"score":<0-100>,"justification":"<2 zdania po polsku>"}

Muzyk: ${m}
Lokal: ${v}`;
}

async function callAnthropic(prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic error: ${await res.text()}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

function parseJSON(raw: string) {
  const clean = raw.replace(/```json?/g, "").replace(/```/g, "").trim();
  return JSON.parse(clean);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const body = await req.json();
    const { musician_profile, venue_profile, venues, musicians } = body;

    let responseBody: unknown;

    if (musician_profile && Array.isArray(venues) && venues.length > 0) {
      // Batch: one musician vs many venues
      const prompt = buildBatchMusicianPrompt(musician_profile, venues);
      const raw = await callAnthropic(prompt);
      const results: BatchResult[] = parseJSON(raw);
      responseBody = { results };

    } else if (venue_profile && Array.isArray(musicians) && musicians.length > 0) {
      // Batch: one venue vs many musicians
      const prompt = buildBatchVenuePrompt(venue_profile, musicians);
      const raw = await callAnthropic(prompt);
      const results: BatchResult[] = parseJSON(raw);
      responseBody = { results };

    } else if (musician_profile && venue_profile) {
      // Legacy single match
      const prompt = buildSinglePrompt(musician_profile, venue_profile);
      const raw = await callAnthropic(prompt);
      responseBody = parseJSON(raw);

    } else {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(responseBody), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error(err);
    // Return empty results rather than error so UI degrades gracefully
    return new Response(
      JSON.stringify({ results: [], score: 0, justification: "Nie udało się ocenić dopasowania." }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
