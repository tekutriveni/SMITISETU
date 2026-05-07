/**
 * Panchangam calculations for SmritiSetu
 * Uses proper astronomical algorithms (Jean Meeus, "Astronomical Algorithms")
 * to calculate accurate Tithi, Nakshatram, Masam and other Panchangam elements.
 */

export const TITHIS_SHUKLA = [
  "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
];

export const TITHIS_KRISHNA = [
  "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya",
];

export const TITHIS = [...TITHIS_SHUKLA, ...TITHIS_KRISHNA];

export const NAKSHATRAMS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
  "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
  "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
  "Vishakha", "Anuradha", "Jyeshtha", "Moola", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati",
];

// Solar Masam based on Sun's rashi (zodiac sign)
export const MASAMS = [
  "Chaitra",     // Mesha (Aries) 0°–30°
  "Vaishakha",   // Vrishabha (Taurus) 30°–60°
  "Jyeshtha",    // Mithuna (Gemini) 60°–90°
  "Ashadha",     // Karka (Cancer) 90°–120°
  "Shravana",    // Simha (Leo) 120°–150°
  "Bhadrapada",  // Kanya (Virgo) 150°–180°
  "Ashwayuja",   // Tula (Libra) 180°–210°
  "Kartika",     // Vrischika (Scorpio) 210°–240°
  "Margashira",  // Dhanus (Sagittarius) 240°–270°
  "Pushya",      // Makara (Capricorn) 270°–300°
  "Magha",       // Kumbha (Aquarius) 300°–330°
  "Phalguna",    // Meena (Pisces) 330°–360°
];

export const VARAS = [
  "Ravivara",    // Sunday
  "Somavara",    // Monday
  "Mangalavara", // Tuesday
  "Budhavara",   // Wednesday
  "Guruvara",    // Thursday
  "Shukravara",  // Friday
  "Shanivara",   // Saturday
];

export const SAMVATSARAS = [
  "Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapathi",
  "Angirasa", "Shrimukha", "Bhava", "Yuva", "Dhathu",
  "Ishvara", "Bahudhanya", "Pramathi", "Vikrama", "Vrisha",
  "Chitrabhanu", "Svabhanu", "Tarana", "Parthiva", "Vyaya",
  "Sarvajitu", "Sarvadhari", "Virodhi", "Vikruti", "Khara",
  "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukhi",
  "Hevilambi", "Vilambi", "Vikari", "Sharvari", "Plava",
  "Shubhakruti", "Sobhakruti", "Krodhi", "Vishvavasu", "Parabhava",
  "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhikruth",
  "Paridhavin", "Pramadicha", "Ananda", "Rakshasa", "Nala",
  "Pingala", "Kalayukta", "Siddharthi", "Raudra", "Durmathi",
  "Dundubhi", "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya",
];

export const AUSPICIOUS_TIMINGS = [
  "Abhijit Muhurta (11:45 AM – 12:30 PM)",
  "Brahma Muhurta (5:00 AM – 6:00 AM)",
  "Vijaya Muhurta (2:00 PM – 2:48 PM)",
];

export const INAUSPICIOUS_TIMINGS = [
  "Rahu Kalam (varies by weekday)",
  "Gulika Kalam (varies by weekday)",
  "Yamagandam (varies by weekday)",
];

// ---------------------------------------------------------------------------
// Astronomical utility functions (Jean Meeus, Astronomical Algorithms)
// ---------------------------------------------------------------------------

/** Convert Gregorian date + UTC time to Julian Day Number */
function julianDayNumber(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day =
    date.getUTCDate() +
    date.getUTCHours() / 24 +
    date.getUTCMinutes() / 1440 +
    date.getUTCSeconds() / 86400;

  let Y = year;
  let M = month;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }

  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);

  return (
    Math.floor(365.25 * (Y + 4716)) +
    Math.floor(30.6001 * (M + 1)) +
    day +
    B -
    1524.5
  );
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/** Sun's apparent geocentric ecliptic longitude (degrees) — Meeus Ch. 25 */
function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;

  // Geometric mean longitude of the Sun (degrees)
  let L0 = normalizeDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);

  // Mean anomaly of the Sun (degrees)
  let M = normalizeDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = toRad(M);

  // Sun's equation of center
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);

  // Sun's true longitude
  const sunTrue = L0 + C;

  // Apparent longitude (subtract aberration + nutation approximation)
  const omega = normalizeDeg(125.04 - 1934.136 * T);
  const apparent = sunTrue - 0.00569 - 0.00478 * Math.sin(toRad(omega));

  return normalizeDeg(apparent);
}

/** Moon's geocentric ecliptic longitude (degrees) — Meeus Ch. 47, key terms */
function moonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;

  // Moon's mean longitude
  const L0 = normalizeDeg(
    218.3164477 +
      481267.88123421 * T -
      0.0015786 * T * T +
      (T * T * T) / 538841 -
      (T * T * T * T) / 65194000,
  );

  // Moon's mean anomaly (M')
  const M = normalizeDeg(
    134.9633964 +
      477198.8675055 * T +
      0.0087414 * T * T +
      (T * T * T) / 69699 -
      (T * T * T * T) / 14712000,
  );

  // Sun's mean anomaly (M)
  const Ms = normalizeDeg(
    357.5291092 +
      35999.0502909 * T -
      0.0001536 * T * T +
      (T * T * T) / 24490000,
  );

  // Moon's argument of latitude (F)
  const F = normalizeDeg(
    93.272095 +
      483202.0175233 * T -
      0.0036539 * T * T -
      (T * T * T) / 3526000 +
      (T * T * T * T) / 863310000,
  );

  // Moon's mean elongation (D)
  const D = normalizeDeg(
    297.8501921 +
      445267.1114034 * T -
      0.0018819 * T * T +
      (T * T * T) / 545868 -
      (T * T * T * T) / 113065000,
  );

  const Mrad = toRad(M);
  const Msrad = toRad(Ms);
  const Frad = toRad(F);
  const Drad = toRad(D);

  // Longitude correction — principal terms (degrees)
  const dL =
    6.288774 * Math.sin(Mrad) +
    1.274027 * Math.sin(2 * Drad - Mrad) +
    0.658314 * Math.sin(2 * Drad) +
    0.213618 * Math.sin(2 * Mrad) -
    0.185116 * Math.sin(Msrad) -
    0.114332 * Math.sin(2 * Frad) +
    0.058793 * Math.sin(2 * Drad - 2 * Mrad) +
    0.057066 * Math.sin(2 * Drad - Msrad - Mrad) +
    0.053322 * Math.sin(2 * Drad + Mrad) +
    0.045758 * Math.sin(2 * Drad - Msrad) -
    0.040923 * Math.sin(Msrad - Mrad) -
    0.034720 * Math.sin(Drad) -
    0.030383 * Math.sin(Msrad + Mrad) +
    0.015327 * Math.sin(2 * Drad - 2 * Frad) -
    0.012528 * Math.sin(Mrad + 2 * Frad) +
    0.01098 * Math.sin(Mrad - 2 * Frad) +
    0.010675 * Math.sin(4 * Drad - Mrad) +
    0.010034 * Math.sin(3 * Mrad) +
    0.008548 * Math.sin(4 * Drad - 2 * Mrad) -
    0.007888 * Math.sin(2 * Drad + Msrad - Mrad) -
    0.006766 * Math.sin(2 * Drad + Msrad) -
    0.005163 * Math.sin(Drad - Mrad) +
    0.004987 * Math.sin(Drad + Msrad) +
    0.004036 * Math.sin(2 * Drad - Msrad + Mrad) +
    0.003994 * Math.sin(2 * Drad + 2 * Mrad) +
    0.003861 * Math.sin(4 * Drad) +
    0.003665 * Math.sin(2 * Drad - 3 * Mrad) -
    0.002689 * Math.sin(Msrad - 2 * Mrad) -
    0.002602 * Math.sin(2 * Drad - Mrad + 2 * Frad) +
    0.002390 * Math.sin(2 * Drad - Msrad - 2 * Mrad) -
    0.002348 * Math.sin(Drad + Mrad) +
    0.002236 * Math.sin(2 * Drad - 2 * Msrad) -
    0.002120 * Math.sin(Msrad + 2 * Mrad) -
    0.002069 * Math.sin(2 * Msrad) +
    0.002048 * Math.sin(2 * Drad - 2 * Msrad - Mrad) -
    0.001773 * Math.sin(2 * Drad + Mrad - 2 * Frad) +
    0.001215 * Math.sin(4 * Drad - Msrad - Mrad);

  return normalizeDeg(L0 + dL);
}

// ---------------------------------------------------------------------------
// Core Panchangam computation
// ---------------------------------------------------------------------------

export interface PanchangamData {
  date: string;
  tithi: string;
  tithiNumber: number;
  nakshatram: string;
  masam: string;
  paksham: string;
  samvatsaram: string;
  vara: string;
  auspiciousTimings: string[];
  inauspiciousTimings: string[];
}

/** Compute Panchangam for a given date (for IST, noon is used as reference) */
export function getPanchangamForDate(date: Date): PanchangamData {
  // Use sunrise IST (~5:30 AM = 00:00 UTC) as the reference time.
  // Traditional Panchangam determines the day's Tithi by what prevails at sunrise.
  const ref = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
    ),
  );

  const jd = julianDayNumber(ref);

  const sunLon = sunLongitude(jd);
  const moonLon = moonLongitude(jd);

  // Elongation (Moon – Sun), always positive
  const elongation = normalizeDeg(moonLon - sunLon);

  // Tithi: each of 30 Tithis spans 12° of elongation (1-indexed)
  const tithiIndex = Math.floor(elongation / 12); // 0–29
  const tithiNumber = tithiIndex + 1;

  let tithi: string;
  let paksham: string;
  if (tithiIndex < 15) {
    paksham = "Shukla";
    tithi = TITHIS_SHUKLA[tithiIndex];
  } else {
    paksham = "Krishna";
    tithi = TITHIS_KRISHNA[tithiIndex - 15];
  }

  // Nakshatram: 27 Nakshatrams, each 360/27 = 13.333° of Moon's longitude
  const nakshatramIndex = Math.floor(moonLon / (360 / 27));
  const nakshatram = NAKSHATRAMS[nakshatramIndex % 27];

  // Masam: solar month based on Sun's longitude (rashi)
  const masamIndex = Math.floor(sunLon / 30);
  const masam = MASAMS[masamIndex % 12];

  // Vara: day of week (0=Sun … 6=Sat)
  const vara = VARAS[date.getDay()];

  // Samvatsara: 60-year Telugu cycle. Epoch: 1987 = Hevilambi (index 31)
  const teluguYear = ((date.getFullYear() - 1987) % 60 + 60) % 60;
  const samvatsaram = SAMVATSARAS[teluguYear];

  return {
    date: date.toISOString().split("T")[0],
    tithi,
    tithiNumber,
    nakshatram,
    masam,
    paksham,
    samvatsaram,
    vara,
    auspiciousTimings: AUSPICIOUS_TIMINGS,
    inauspiciousTimings: INAUSPICIOUS_TIMINGS,
  };
}

// ---------------------------------------------------------------------------
// Helpers for reminders
// ---------------------------------------------------------------------------

/** Returns the next anniversary date (today if today is the day) */
export function getNextAnniversaryDate(dateOfDeath: string): Date {
  const death = new Date(dateOfDeath);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisYear = today.getFullYear();
  let anniversary = new Date(thisYear, death.getMonth(), death.getDate());
  anniversary.setHours(0, 0, 0, 0);

  if (anniversary < today) {
    anniversary = new Date(thisYear + 1, death.getMonth(), death.getDate());
  }

  return anniversary;
}

/** Days from today until target date (0 = today) */
export function getDaysUntil(targetDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = targetDate.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}
