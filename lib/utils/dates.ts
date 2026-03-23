export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Returns the meteorological season for a given date (Northern Hemisphere).
 */
export function getSeason(date: Date = new Date()): Season {
  const month = date.getMonth(); // 0-indexed
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

/**
 * Returns the time-of-day category based on the hour.
 */
export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

const FRENCH_MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
] as const;

const FRENCH_DAYS = [
  'dimanche', 'lundi', 'mardi', 'mercredi',
  'jeudi', 'vendredi', 'samedi',
] as const;

/**
 * Formats a date into a full French date string.
 * Example: "lundi 23 mars 2026"
 */
export function formatFrenchDate(date: Date = new Date()): string {
  const dayName = FRENCH_DAYS[date.getDay()];
  const day = date.getDate();
  const month = FRENCH_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName} ${day} ${month} ${year}`;
}

/**
 * Returns a French greeting appropriate for the current time of day.
 */
export function getDayGreeting(date: Date = new Date()): string {
  const time = getTimeOfDay(date);
  switch (time) {
    case 'morning':
      return 'Bonjour';
    case 'afternoon':
      return 'Bon après-midi';
    case 'evening':
      return 'Bonsoir';
    case 'night':
      return 'Bonne nuit';
  }
}
