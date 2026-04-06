/**
 * Nominatim (OpenStreetMap) reverse geocoding — no API key required.
 * Returns "Miasto, Kraj" or fallback to raw coordinates.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pl`,
      { headers: { 'Accept': 'application/json' } }
    )
    const data = await res.json()
    const addr = data.address ?? {}
    const city = addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? addr.county ?? ''
    const country = addr.country ?? ''
    return [city, country].filter(Boolean).join(', ')
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }
}
