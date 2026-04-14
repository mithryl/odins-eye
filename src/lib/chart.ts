import * as sweph from "sweph";
import tzlookup from "tz-lookup";
import { fromZonedTime } from "date-fns-tz";
import path from "path";

const { calc_ut, houses_ex2, utc_to_jd, set_ephe_path, constants: C } = sweph;

// Point Swiss Ephemeris at the bundled .se1 files (seas/semo/sepl, 1800–2399).
// outputFileTracingIncludes in next.config.ts ensures these ship with the function.
set_ephe_path(path.join(process.cwd(), "vendor/ephe"));

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const FLAGS = C.SEFLG_SWIEPH | C.SEFLG_SPEED;

interface BodySpec {
  name: string;
  id: number;
}

const BODIES: BodySpec[] = [
  { name: "Sun", id: C.SE_SUN },
  { name: "Moon", id: C.SE_MOON },
  { name: "Mercury", id: C.SE_MERCURY },
  { name: "Venus", id: C.SE_VENUS },
  { name: "Mars", id: C.SE_MARS },
  { name: "Jupiter", id: C.SE_JUPITER },
  { name: "Saturn", id: C.SE_SATURN },
  { name: "Uranus", id: C.SE_URANUS },
  { name: "Neptune", id: C.SE_NEPTUNE },
  { name: "Pluto", id: C.SE_PLUTO },
  { name: "North Node", id: C.SE_TRUE_NODE },
  { name: "Chiron", id: C.SE_CHIRON },
  { name: "Lilith", id: C.SE_MEAN_APOG },
];

export interface PlanetPlacement {
  planet: string;
  longitude: number;
  sign: string;
  degree: number;
  house?: number;
}

export interface HouseCusp {
  house: number;
  longitude: number;
  sign: string;
  degree: number;
}

export interface NatalChart {
  placements: PlanetPlacement[];
  risingSign: string | null;
  risingDegree: number | null;
  ascendantLongitude: number | null;
  midheavenSign: string | null;
  midheavenDegree: number | null;
  houses: HouseCusp[] | null;
  birthDateTime: string;
}

function longitudeToSign(longitude: number): { sign: string; degree: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / 30);
  const degree = normalized % 30;
  return { sign: ZODIAC_SIGNS[index], degree: Math.round(degree * 100) / 100 };
}

function assignHouse(longitude: number, cusps: number[]): number {
  // cusps is length-12, indexed 0..11 for houses 1..12
  const norm = ((longitude % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end = cusps[(i + 1) % 12];
    // Handle zodiac wrap-around
    if (start <= end) {
      if (norm >= start && norm < end) return i + 1;
    } else {
      if (norm >= start || norm < end) return i + 1;
    }
  }
  return 1;
}

export function calculateChart(
  birthDate: string,
  birthTime: string | null,
  latitude: number,
  longitude: number,
): NatalChart {
  const timezone = tzlookup(latitude, longitude);

  let localDateStr = birthDate;
  if (birthTime) {
    localDateStr += `T${birthTime}:00`;
  } else {
    localDateStr += "T12:00:00";
  }

  const utcDate = fromZonedTime(localDateStr, timezone);

  // utc_to_jd wants split UTC components + decimal seconds
  const year = utcDate.getUTCFullYear();
  const month = utcDate.getUTCMonth() + 1;
  const day = utcDate.getUTCDate();
  const hour = utcDate.getUTCHours();
  const minute = utcDate.getUTCMinutes();
  const second = utcDate.getUTCSeconds() + utcDate.getUTCMilliseconds() / 1000;

  const jd = utc_to_jd(year, month, day, hour, minute, second, C.SE_GREG_CAL);
  if (jd.flag !== C.OK) {
    throw new Error(`Julian Day conversion failed: ${jd.error}`);
  }
  const jdUt = jd.data[1];

  // Houses + Ascendant + MC (only meaningful with a real birth time)
  let houses: HouseCusp[] | null = null;
  let cuspArray: number[] | null = null;
  let risingSign: string | null = null;
  let risingDegree: number | null = null;
  let ascendantLongitude: number | null = null;
  let midheavenSign: string | null = null;
  let midheavenDegree: number | null = null;

  if (birthTime) {
    const h = houses_ex2(jdUt, 0, latitude, longitude, "P"); // Placidus
    if (h.flag !== C.OK && h.error) {
      throw new Error(`House calculation failed: ${h.error}`);
    }
    cuspArray = h.data.houses.slice(0, 12);
    houses = cuspArray.map((lon, i) => {
      const { sign, degree } = longitudeToSign(lon);
      return { house: i + 1, longitude: Math.round(lon * 100) / 100, sign, degree };
    });

    const ascLon = h.data.points[0]; // SE_ASC = 0
    const mcLon = h.data.points[1];  // SE_MC = 1
    const asc = longitudeToSign(ascLon);
    const mc = longitudeToSign(mcLon);
    risingSign = asc.sign;
    risingDegree = asc.degree;
    ascendantLongitude = Math.round(ascLon * 100) / 100;
    midheavenSign = mc.sign;
    midheavenDegree = mc.degree;
  }

  // Bodies
  const placements: PlanetPlacement[] = [];
  for (const body of BODIES) {
    const result = calc_ut(jdUt, body.id, FLAGS);
    if (result.flag < 0 || result.error) {
      // Skip any body Moshier can't handle — log but don't kill the whole chart
      console.warn(`sweph calc failed for ${body.name}: ${result.error}`);
      continue;
    }
    const lon = result.data[0];
    const { sign, degree } = longitudeToSign(lon);
    const placement: PlanetPlacement = {
      planet: body.name,
      longitude: Math.round(lon * 100) / 100,
      sign,
      degree,
    };
    if (cuspArray) placement.house = assignHouse(lon, cuspArray);
    placements.push(placement);
  }

  // South Node = opposite True North Node
  const northNode = placements.find((p) => p.planet === "North Node");
  if (northNode) {
    const snLon = (northNode.longitude + 180) % 360;
    const { sign, degree } = longitudeToSign(snLon);
    const sn: PlanetPlacement = {
      planet: "South Node",
      longitude: Math.round(snLon * 100) / 100,
      sign,
      degree,
    };
    if (cuspArray) sn.house = assignHouse(snLon, cuspArray);
    placements.push(sn);
  }

  return {
    placements,
    risingSign,
    risingDegree,
    ascendantLongitude,
    midheavenSign,
    midheavenDegree,
    houses,
    birthDateTime: utcDate.toISOString(),
  };
}

/**
 * Calculate aspects between planets (major aspects only).
 */
export function calculateAspects(placements: PlanetPlacement[]): string[] {
  const aspects: string[] = [];
  const aspectTypes = [
    { name: "conjunction", angle: 0, orb: 8 },
    { name: "sextile", angle: 60, orb: 6 },
    { name: "square", angle: 90, orb: 8 },
    { name: "trine", angle: 120, orb: 8 },
    { name: "opposition", angle: 180, orb: 8 },
  ];

  for (let i = 0; i < placements.length; i++) {
    for (let j = i + 1; j < placements.length; j++) {
      const p1 = placements[i];
      const p2 = placements[j];
      let diff = Math.abs(p1.longitude - p2.longitude);
      if (diff > 180) diff = 360 - diff;

      for (const aspect of aspectTypes) {
        if (Math.abs(diff - aspect.angle) <= aspect.orb) {
          aspects.push(
            `${p1.planet} ${aspect.name} ${p2.planet} (${Math.round(diff)}°)`
          );
          break;
        }
      }
    }
  }

  return aspects;
}

export function resolveApproximateTime(approx: string): string | null {
  switch (approx) {
    case "morning": return "09:00";
    case "afternoon": return "15:00";
    case "evening": return "21:00";
    case "night": return "03:00";
    default: return null;
  }
}
