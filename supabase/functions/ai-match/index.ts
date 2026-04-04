import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MusicianProfile {
  stage_name?: string | null;
  genres?: string[];
  instruments?: string[];
  style?: string | null;
  repertoire?: string | null;
  performance_type?: string | null;
}

interface VenueProfile {
  venue_name?: string;
  venue_type?: string | null;
  atmosphere?: string | null;
  occasion?: string | null;
  expectations?: string | null;
}

interface GigInfo {
  title?: string;
  genre?: string | null;
}

interface MatchRequest {
  musician_profile: MusicianProfile;
  venue_profile: VenueProfile;
  gig?: GigInfo;
}

interface MatchResult {
  score: number;
  justification: string;
}

function buildPrompt(musician: MusicianProfile, venue: VenueProfile, gig?: GigInfo): string {
  const musicianDesc = [
    musician.stage_name ? `Nazwa: ${musician.stage_name}` : null,
    musician.genres?.length ? `Gatunki: ${musician.genres.join(", ")}` : null,
    musician.instruments?.length ? `Instrumenty: ${musician.instruments.join(", ")}` : null,
    musician.style ? `Styl: ${musician.style}` : null,
    musician.repertoire ? `Repertuar: ${musician.repertoire}` : null,
    musician.performance_type ? `Charakter występu: ${musician.performance_type}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const venueDesc = [
    venue.venue_name ? `Nazwa lokalu: ${venue.venue_name}` : null,
    venue.venue_type ? `Typ: ${venue.venue_type}` : null,
    venue.atmosphere ? `Atmosfera: ${venue.atmosphere}` : null,
    venue.occasion ? `Typ okazji: ${venue.occasion}` : null,
    venue.expectations ? `Oczekiwania: ${venue.expectations}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const gigDesc = gig
    ? `\nSzczegóły giga:\nTytuł: ${gig.title ?? "—"}\nGatunek: ${gig.genre ?? "—"}`
    : "";

  return `Jesteś ekspertem od doboru muzyki na żywo do lokali gastronomicznych i eventowych.

Oceń dopasowanie muzyka do lokalu i zwróć wyłącznie obiekt JSON (bez markdown, bez komentarzy):

PROFIL MUZYKA:
${musicianDesc || "Brak danych"}

PROFIL LOKALU:
${venueDesc || "Brak danych"}${gigDesc}

Oceń dopasowanie w skali 0-100 biorąc pod uwagę: zgodność stylu z atmosferą miejsca, charakter występu vs oczekiwania, gatunek muzyczny. Zwróć JSON:
{"score": <liczba 0-100>, "justification": "<2 zdania uzasadnienia po polsku>"}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const body: MatchRequest = await req.json();
    const { musician_profile, venue_profile, gig } = body;

    const prompt = buildPrompt(musician_profile, venue_profile, gig);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 256,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      throw new Error(`Anthropic API error: ${err}`);
    }

    const anthropicData = await anthropicRes.json();
    const raw = anthropicData.content?.[0]?.text ?? "";

    // Strip any accidental markdown fences
    const jsonStr = raw.replace(/```json?/g, "").replace(/```/g, "").trim();
    const result: MatchResult = JSON.parse(jsonStr);

    return new Response(JSON.stringify(result), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ score: 0, justification: "Nie udało się ocenić dopasowania." }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
