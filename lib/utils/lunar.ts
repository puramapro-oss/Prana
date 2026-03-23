/* ------------------------------------------------------------------ */
/*  Lunar phase calculator using the synodic month algorithm           */
/*  No external API required.                                          */
/* ------------------------------------------------------------------ */

export interface LunarPhase {
  phase: string;
  emoji: string;
  name: string;
  advice: string;
}

/**
 * Reference new moon: January 6, 2000 18:14 UTC
 * Synodic month (new moon to new moon): ~29.53058770576 days
 */
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);
const SYNODIC_MONTH = 29.53058770576;
const MS_PER_DAY = 86_400_000;

/**
 * Returns the age of the moon in days (0 = new moon, ~14.76 = full moon).
 */
function getMoonAge(date: Date = new Date()): number {
  const diffMs = date.getTime() - KNOWN_NEW_MOON;
  const diffDays = diffMs / MS_PER_DAY;
  const cycles = diffDays / SYNODIC_MONTH;
  const age = (cycles - Math.floor(cycles)) * SYNODIC_MONTH;
  return age;
}

/**
 * Determines the current lunar phase with French name, emoji and
 * holistic health advice tailored to each phase.
 */
export function getLunarPhase(date: Date = new Date()): LunarPhase {
  const age = getMoonAge(date);

  // Divide the synodic month into 8 phases (~3.69 days each)
  const phaseIndex = Math.floor((age / SYNODIC_MONTH) * 8) % 8;

  const phases: LunarPhase[] = [
    {
      phase: 'new_moon',
      emoji: '\uD83C\uDF11',
      name: 'Nouvelle Lune',
      advice:
        'Moment ideal pour poser vos intentions, commencer un jeune ou une detox douce, et pratiquer la meditation introspective. L\'energie est tournee vers l\'interieur.',
    },
    {
      phase: 'waxing_crescent',
      emoji: '\uD83C\uDF12',
      name: 'Premier Croissant',
      advice:
        'Lancez de nouveaux projets et habitudes. Favorisez les aliments legers et nourrissants. Bonne periode pour demarrer un programme de pratiques.',
    },
    {
      phase: 'first_quarter',
      emoji: '\uD83C\uDF13',
      name: 'Premier Quartier',
      advice:
        'Periode d\'action et de determination. Intensifiez vos exercices physiques et pratiques de Qi Gong. Travaillez sur les obstacles avec les techniques I AM.',
    },
    {
      phase: 'waxing_gibbous',
      emoji: '\uD83C\uDF14',
      name: 'Lune Gibbeuse Croissante',
      advice:
        'Peaufinez vos pratiques et ajustez votre programme. Excellent moment pour les soins ayurvediques, les massages et l\'herboristerie.',
    },
    {
      phase: 'full_moon',
      emoji: '\uD83C\uDF15',
      name: 'Pleine Lune',
      advice:
        'Energie maximale. Pratiquez la gratitude et la manifestation. Attention au sommeil perturbe : privilegiez les tisanes calmantes et la meditation du soir.',
    },
    {
      phase: 'waning_gibbous',
      emoji: '\uD83C\uDF16',
      name: 'Lune Gibbeuse Decroissante',
      advice:
        'Temps du partage et de la transmission. Consolidez vos acquis, pratiquez le journaling sacre et reequilibrez votre alimentation.',
    },
    {
      phase: 'last_quarter',
      emoji: '\uD83C\uDF17',
      name: 'Dernier Quartier',
      advice:
        'Liberez-vous des habitudes qui ne vous servent plus. Ideal pour les techniques de respiration (coherence cardiaque, Wim Hof) et le lacher-prise.',
    },
    {
      phase: 'waning_crescent',
      emoji: '\uD83C\uDF18',
      name: 'Dernier Croissant',
      advice:
        'Phase de repos et de regeneration. Reduisez l\'intensite de vos pratiques, privilegiez le sommeil profond et preparez le prochain cycle.',
    },
  ];

  return phases[phaseIndex];
}
