// Panchangam data for SmritiSetu
// Simplified Panchangam calculations based on traditional Telugu calendar

export const TITHIS = [
  "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya/Purnima"
];

export const NAKSHATRAMS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
  "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
  "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
  "Vishakha", "Anuradha", "Jyeshtha", "Moola", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati"
];

export const MASAMS = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana",
  "Bhadrapada", "Ashwayuja", "Kartika", "Margashira", "Pushya",
  "Magha", "Phalguna"
];

export const VARAS = [
  "Ravivara", "Somavara", "Mangalavara", "Budhavara",
  "Guruvara", "Shukravara", "Shanivara"
];

export const AUSPICIOUS_TIMINGS = [
  "Abhijit Muhurta (11:45 AM - 12:30 PM)",
  "Brahma Muhurta (5:00 AM - 6:00 AM)",
  "Vijaya Muhurta (2:00 PM - 2:45 PM)",
];

export const INAUSPICIOUS_TIMINGS = [
  "Rahu Kalam (9:00 AM - 10:30 AM)",
  "Gulika Kalam (6:00 AM - 7:30 AM)",
  "Yamagandam (10:30 AM - 12:00 PM)",
];

export interface PanchangamData {
  date: string;
  tithi: string;
  nakshatram: string;
  masam: string;
  paksham: string;
  samvatsaram: string;
  vara: string;
  auspiciousTimings: string[];
  inauspiciousTimings: string[];
}

// Simplified cyclic calculation based on day of year
export function getPanchangamForDate(date: Date): PanchangamData {
  const dayOfYear = getDayOfYear(date);
  const dayOfWeek = date.getDay();

  const tithiIndex = dayOfYear % 15;
  const nakshatramIndex = Math.floor(dayOfYear * 27 / 365) % 27;
  const masamIndex = Math.floor((date.getMonth() + 1 + 2) % 12);
  const paksham = tithiIndex < 14 ? "Shukla" : "Krishna";

  // Telugu Samvatsara cycle (60-year cycle)
  const teluguYear = ((date.getFullYear() - 1987) % 60 + 60) % 60;
  const samvatsaraNames = [
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
    "Dundubhi", "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya"
  ];

  return {
    date: date.toISOString().split("T")[0],
    tithi: TITHIS[tithiIndex % TITHIS.length],
    nakshatram: NAKSHATRAMS[nakshatramIndex],
    masam: MASAMS[masamIndex],
    paksham,
    samvatsaram: samvatsaraNames[teluguYear],
    vara: VARAS[dayOfWeek],
    auspiciousTimings: AUSPICIOUS_TIMINGS,
    inauspiciousTimings: INAUSPICIOUS_TIMINGS,
  };
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Calculate next anniversary date from death date
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

export function getDaysUntil(targetDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = targetDate.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}
