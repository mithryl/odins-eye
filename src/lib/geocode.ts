/**
 * Geocode a city name to lat/long using the free Nominatim API.
 */
export interface GeoResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

export async function geocodeCity(
  city: string,
  country: string,
  state?: string
): Promise<GeoResult> {
  const query = [city, state, country].filter(Boolean).join(", ");
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "OdinsEye/1.0 (natal chart app)",
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.statusText}`);
  }

  const results = await response.json();
  if (!results || results.length === 0) {
    throw new Error(`Could not find location: ${query}`);
  }

  return {
    latitude: parseFloat(results[0].lat),
    longitude: parseFloat(results[0].lon),
    displayName: results[0].display_name,
  };
}
