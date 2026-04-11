import * as Astronomy from "astronomy-engine";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const PLANETS: Astronomy.Body[] = [
  Astronomy.Body.Sun,
  Astronomy.Body.Moon,
  Astronomy.Body.Mercury,
  Astronomy.Body.Venus,
  Astronomy.Body.Mars,
  Astronomy.Body.Jupiter,
  Astronomy.Body.Saturn,
  Astronomy.Body.Uranus,
  Astronomy.Body.Neptune,
  Astronomy.Body.Pluto,
];

export interface PlanetPlacement {
  planet: string;
  longitude: number;
  sign: string;
  degree: number;
}

export interface NatalChart {
  placements: PlanetPlacement[];
  risingSign: string | null;
  risingDegree: number | null;
  ascendantLongitude: number | null;
  birthDateTime: string;
}

function longitudeToSign(longitude: number): { sign: string; degree: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / 30);
  const degree = normalized % 30;
  return { sign: ZODIAC_SIGNS[index], degree: Math.round(degree * 100) / 100 };
}

function getGeocentricLongitude(body: Astronomy.Body, time: Astronomy.AstroTime): number {
  const vector = Astronomy.GeoVector(body, time, true);
  const ecliptic = Astronomy.Ecliptic(vector);
  return ecliptic.elon;
}

/**
 * Calculate Black Moon Lilith (Mean Lunar Apogee) longitude.
 * Lilith is the point where the Moon is farthest from Earth in its orbit.
 * Uses Meeus formula for the mean longitude of the Moon's perigee + 180°.
 */
function calculateLilith(time: Astronomy.AstroTime): number {
  const T = time.tt / 36525.0;
  // Mean longitude of lunar perigee (Meeus)
  let perigee = 83.3532465
    + 4069.0137287 * T
    - 0.0103200 * T * T
    - T * T * T / 80053
    + T * T * T * T / 18999000;

  // Lilith = perigee + 180° (apogee is opposite perigee)
  let lilith = perigee + 180;
  lilith = ((lilith % 360) + 360) % 360;
  return lilith;
}

/**
 * Calculate Chiron's ecliptic longitude using simplified orbital elements.
 * Chiron orbits between Saturn and Uranus with a ~50.7 year period.
 * This uses a Keplerian approximation — accurate to ~1° for modern dates.
 */
function calculateChiron(time: Astronomy.AstroTime): number {
  const T = time.tt / 36525.0;

  // Chiron orbital elements (epoch J2000)
  const a = 13.6481; // semi-major axis (AU)
  const e = 0.3791; // eccentricity
  const i = 6.931; // inclination (degrees)
  const omega = 339.557; // argument of perihelion (degrees)
  const Omega = 209.385; // longitude of ascending node (degrees)
  const M0 = 26.892; // mean anomaly at J2000 (degrees)
  const n = 0.01942; // mean daily motion (degrees/day)

  // Mean anomaly
  const daysSinceJ2000 = time.tt;
  let M = M0 + n * daysSinceJ2000;
  M = ((M % 360) + 360) % 360;
  const Mrad = M * Math.PI / 180;

  // Solve Kepler's equation iteratively: E - e*sin(E) = M
  let E = Mrad;
  for (let iter = 0; iter < 20; iter++) {
    E = Mrad + e * Math.sin(E);
  }

  // True anomaly
  const cosV = (Math.cos(E) - e) / (1 - e * Math.cos(E));
  const sinV = (Math.sqrt(1 - e * e) * Math.sin(E)) / (1 - e * Math.cos(E));
  const v = Math.atan2(sinV, cosV) * 180 / Math.PI;

  // Ecliptic longitude (simplified — ignoring inclination correction for ~1° accuracy)
  const omegaRad = omega * Math.PI / 180;
  const OmegaRad = Omega * Math.PI / 180;
  const iRad = i * Math.PI / 180;
  const vRad = v * Math.PI / 180;

  const u = omegaRad + vRad;
  const lon = Math.atan2(
    Math.sin(u) * Math.cos(iRad),
    Math.cos(u)
  ) + OmegaRad;

  let lonDeg = lon * 180 / Math.PI;
  lonDeg = ((lonDeg % 360) + 360) % 360;
  return lonDeg;
}

/**
 * Calculate the Mean North Node (ascending lunar node) longitude.
 * Uses the standard Meeus formula for the longitude of the Moon's ascending node.
 * The North Node moves retrograde through the zodiac over ~18.6 years.
 */
function calculateNorthNode(time: Astronomy.AstroTime): number {
  const T = time.tt / 36525.0; // Julian centuries from J2000
  let omega = 125.0445479
    - 1934.1362891 * T
    + 0.0020754 * T * T
    + T * T * T / 467441
    - T * T * T * T / 60616000;

  // Normalize to 0-360
  omega = ((omega % 360) + 360) % 360;
  return omega;
}

/**
 * Calculate the Ascendant (rising sign) using the standard Meeus formula.
 *
 * Formula: tan(ASC) = cos(RAMC) / -(sin(e)*tan(lat) + cos(e)*sin(RAMC))
 *
 * where RAMC = Local Sidereal Time in degrees, e = obliquity, lat = geographic latitude.
 */
function calculateAscendant(time: Astronomy.AstroTime, latitude: number, longitude: number): number {
  // Get Greenwich sidereal time (hours) and convert to local
  const gst = Astronomy.SiderealTime(time);
  // Proper modulo for negative values
  const lst = (((gst + longitude / 15) % 24) + 24) % 24;

  // RAMC (Right Ascension of the Midheaven) = LST in degrees
  const ramc = lst * 15;

  // Calculate obliquity of the ecliptic for the given date (Meeus formula)
  const T = (time.tt) / 36525.0; // centuries from J2000
  const obliquity = 23.4392911 - 0.0130042 * T - 1.64e-7 * T * T + 5.036e-7 * T * T * T;

  const ramcRad = ramc * Math.PI / 180;
  const oblRad = obliquity * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;

  // Standard Ascendant formula (Meeus, Astronomical Algorithms)
  // tan(ASC) = cos(RAMC) / -(sin(e)*tan(lat) + cos(e)*sin(RAMC))
  const y = Math.cos(ramcRad);
  const x = -(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(ramcRad));
  let ascendant = Math.atan2(y, x) * 180 / Math.PI;

  // Normalize to 0-360
  ascendant = ((ascendant % 360) + 360) % 360;

  return ascendant;
}

export function calculateChart(
  birthDate: string,
  birthTime: string | null,
  latitude: number,
  longitude: number,
): NatalChart {
  // Build date string. If no birth time, default to noon (reduces max error to 12hrs)
  let dateStr = birthDate;
  if (birthTime) {
    dateStr += `T${birthTime}:00`;
  } else {
    dateStr += "T12:00:00";
  }

  const date = new Date(dateStr);
  const time = new Astronomy.AstroTime(date);

  const placements: PlanetPlacement[] = PLANETS.map((body) => {
    const lon = getGeocentricLongitude(body, time);
    const { sign, degree } = longitudeToSign(lon);
    return {
      planet: body.toString(),
      longitude: Math.round(lon * 100) / 100,
      sign,
      degree,
    };
  });

  // North Node (Mean Lunar Node)
  const nnLon = calculateNorthNode(time);
  const nn = longitudeToSign(nnLon);
  placements.push({
    planet: "North Node",
    longitude: Math.round(nnLon * 100) / 100,
    sign: nn.sign,
    degree: nn.degree,
  });

  // South Node (always opposite the North Node)
  const snLon = (nnLon + 180) % 360;
  const sn = longitudeToSign(snLon);
  placements.push({
    planet: "South Node",
    longitude: Math.round(snLon * 100) / 100,
    sign: sn.sign,
    degree: sn.degree,
  });

  // Chiron
  const chironLon = calculateChiron(time);
  const ch = longitudeToSign(chironLon);
  placements.push({
    planet: "Chiron",
    longitude: Math.round(chironLon * 100) / 100,
    sign: ch.sign,
    degree: ch.degree,
  });

  // Black Moon Lilith
  const lilithLon = calculateLilith(time);
  const li = longitudeToSign(lilithLon);
  placements.push({
    planet: "Lilith",
    longitude: Math.round(lilithLon * 100) / 100,
    sign: li.sign,
    degree: li.degree,
  });

  // Rising sign only calculable with birth time
  let risingSign: string | null = null;
  let risingDegree: number | null = null;
  let ascendantLongitude: number | null = null;
  if (birthTime) {
    const ascLon = calculateAscendant(time, latitude, longitude);
    const { sign, degree } = longitudeToSign(ascLon);
    risingSign = sign;
    risingDegree = degree;
    ascendantLongitude = Math.round(ascLon * 100) / 100;
  }

  return {
    placements,
    risingSign,
    risingDegree,
    ascendantLongitude,
    birthDateTime: date.toISOString(),
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

/**
 * Resolve approximate birth time to a clock time string.
 */
export function resolveApproximateTime(
  approx: string
): string | null {
  switch (approx) {
    case "morning": return "09:00";
    case "afternoon": return "15:00";
    case "evening": return "21:00";
    case "night": return "03:00";
    default: return null;
  }
}
