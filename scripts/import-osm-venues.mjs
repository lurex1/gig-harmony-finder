#!/usr/bin/env node
/**
 * Import venues from OpenStreetMap into Supabase `unclaimed_venues`.
 *
 * Usage (PowerShell):
 *   $env:SUPABASE_URL = "https://xxx.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY = "eyJ..."
 *   node scripts/import-osm-venues.mjs --bbox=50.4,21.6,50.8,22.2 --country=PL --city="Stalowa Wola"
 *
 * Or wider region (Podkarpacie south-east approximation):
 *   node scripts/import-osm-venues.mjs --bbox=49.5,21.0,51.0,23.5 --country=PL
 *
 * Bbox format: south,west,north,east  (lat_min, lng_min, lat_max, lng_max)
 *
 * Requires Node 18+ (uses global fetch).
 */

import { createClient } from "@supabase/supabase-js";

// ─── Config ─────────────────────────────────────────────────────────────────

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const BATCH_SIZE = 500; // upsert in chunks to avoid PG payload limits

const VENUE_AMENITIES = [
  "restaurant",
  "bar",
  "pub",
  "cafe",
  "nightclub",
  "biergarten",
  "fast_food",
  "food_court",
  "events_venue",
  "community_centre",
  "music_venue",
  "theatre",
  "arts_centre",
  "conference_centre",
  "cinema",
];

// ─── Args ───────────────────────────────────────────────────────────────────

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, ...rest] = a.replace(/^--/, "").split("=");
      return [k, rest.join("=")];
    }),
);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.\n" +
      "Find the service_role key in Supabase Dashboard → Settings → API → service_role.\n" +
      "Do NOT commit this key — it bypasses RLS.",
  );
  process.exit(1);
}

if (!args.bbox) {
  console.error(
    "ERROR: --bbox=south,west,north,east required.\n" +
      "Example for Stalowa Wola + 80km: --bbox=49.7,21.0,51.0,23.0",
  );
  process.exit(1);
}

const [south, west, north, east] = args.bbox.split(",").map(Number);
const countryCode = args.country ?? null;
const cityFilter = args.city ?? null;
const dryRun = args["dry-run"] === "true" || args["dry-run"] === "";

if ([south, west, north, east].some(Number.isNaN)) {
  console.error("ERROR: bbox must be 4 numbers: south,west,north,east");
  process.exit(1);
}

console.log(`OSM Import — bbox=[${south},${west},${north},${east}]`);
console.log(`Country: ${countryCode ?? "(none)"} | City filter: ${cityFilter ?? "(none)"} | Dry run: ${dryRun}`);

// ─── Build Overpass QL query ────────────────────────────────────────────────

const amenityRegex = VENUE_AMENITIES.join("|");
const overpassQuery = `
[out:json][timeout:120];
(
  node["amenity"~"^(${amenityRegex})$"](${south},${west},${north},${east});
  way["amenity"~"^(${amenityRegex})$"](${south},${west},${north},${east});
  relation["amenity"~"^(${amenityRegex})$"](${south},${west},${north},${east});
);
out center tags;
`.trim();

// ─── Fetch from Overpass ────────────────────────────────────────────────────

console.log("Fetching from Overpass API… (may take 30–120s for large bboxes)");
const startedAt = Date.now();

const resp = await fetch(OVERPASS_URL, {
  method: "POST",
  headers: { "Content-Type": "text/plain" },
  body: overpassQuery,
});

if (!resp.ok) {
  console.error(`Overpass error ${resp.status}: ${await resp.text()}`);
  process.exit(1);
}

const overpass = await resp.json();
const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
console.log(`Got ${overpass.elements.length} OSM elements in ${elapsed}s`);

// ─── Map OSM → unclaimed_venues row ─────────────────────────────────────────

function pickName(tags) {
  return (
    tags["name"] ||
    tags["name:en"] ||
    tags["operator"] ||
    tags["brand"] ||
    null
  );
}

function pickAddress(tags) {
  const street = tags["addr:street"] ?? "";
  const number = tags["addr:housenumber"] ?? "";
  const city = tags["addr:city"] ?? "";
  const post = tags["addr:postcode"] ?? "";
  const parts = [
    [street, number].filter(Boolean).join(" "),
    [post, city].filter(Boolean).join(" "),
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function pickEmail(tags) {
  // OSM uses inconsistent casing
  return tags["email"] || tags["contact:email"] || null;
}

function pickPhone(tags) {
  return tags["phone"] || tags["contact:phone"] || tags["telephone"] || null;
}

function pickWebsite(tags) {
  return tags["website"] || tags["contact:website"] || tags["url"] || null;
}

const rows = [];
for (const el of overpass.elements) {
  const tags = el.tags ?? {};
  const name = pickName(tags);
  if (!name) continue;

  // Coordinates: nodes have lat/lon; ways/relations have center
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat == null || lng == null) continue;

  // Skip out-of-bbox just in case
  if (lat < south || lat > north || lng < west || lng > east) continue;

  const city = tags["addr:city"] ?? null;
  if (cityFilter && city && city.toLowerCase() !== cityFilter.toLowerCase()) {
    continue;
  }

  rows.push({
    osm_id: String(el.id),
    osm_type: el.type, // 'node' | 'way' | 'relation'
    venue_name: name.slice(0, 200),
    venue_type: tags.amenity ?? null,
    location: pickAddress(tags),
    lat,
    lng,
    email: pickEmail(tags),
    phone: pickPhone(tags),
    website: pickWebsite(tags),
    country_code: countryCode,
    city,
  });
}

console.log(`Mapped ${rows.length} venues with names + coordinates`);
console.log(`  with email: ${rows.filter((r) => r.email).length}`);
console.log(`  with phone: ${rows.filter((r) => r.phone).length}`);
console.log(`  with website: ${rows.filter((r) => r.website).length}`);

if (rows.length === 0) {
  console.log("Nothing to import. Exit.");
  process.exit(0);
}

if (dryRun) {
  console.log("Dry run — sample rows:");
  console.log(JSON.stringify(rows.slice(0, 3), null, 2));
  process.exit(0);
}

// ─── Upsert into Supabase in batches ────────────────────────────────────────

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

let inserted = 0;
let failed = 0;

for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);
  const { error, count } = await sb
    .from("unclaimed_venues")
    .upsert(batch, { onConflict: "osm_type,osm_id", count: "exact" });

  if (error) {
    failed += batch.length;
    console.error(`Batch ${i}-${i + batch.length} FAILED:`, error.message);
  } else {
    inserted += count ?? batch.length;
    process.stdout.write(`  upserted ${inserted}/${rows.length}\r`);
  }
}

console.log("\nDone.");
console.log(`  upserted: ${inserted}`);
console.log(`  failed:   ${failed}`);
