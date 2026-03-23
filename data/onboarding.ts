/* ------------------------------------------------------------------ */
/*  Onboarding questions for programme generation                      */
/* ------------------------------------------------------------------ */

export interface OnboardingOption {
  id: string;
  label: string;
  emoji: string;
}

export interface OnboardingQuestion {
  id: number;
  title: string;
  subtitle: string;
  type: 'single' | 'multi';
  options: OnboardingOption[];
}

const questions: OnboardingQuestion[] = [
  {
    id: 0,
    title: 'Quel est votre objectif principal ?',
    subtitle: 'Choisissez celui qui résonne le plus avec vous.',
    type: 'single',
    options: [
      { id: 'stress', label: 'Réduire le stress', emoji: '🧘' },
      { id: 'energy', label: 'Booster mon énergie', emoji: '⚡' },
      { id: 'sleep', label: 'Mieux dormir', emoji: '🌙' },
      { id: 'focus', label: 'Améliorer ma concentration', emoji: '🎯' },
      { id: 'balance', label: 'Équilibre global', emoji: '☯️' },
      { id: 'spiritual', label: 'Éveil spirituel', emoji: '✨' },
    ],
  },
  {
    id: 1,
    title: 'Quel est votre niveau d\'expérience ?',
    subtitle: 'Soyez honnête, nous adaptons tout à votre niveau.',
    type: 'single',
    options: [
      { id: 'beginner', label: 'Débutant total', emoji: '🌱' },
      { id: 'curious', label: 'Curieux initié', emoji: '🌿' },
      { id: 'regular', label: 'Pratiquant régulier', emoji: '🌳' },
      { id: 'advanced', label: 'Pratiquant avancé', emoji: '🏔️' },
    ],
  },
  {
    id: 2,
    title: 'Quels défis rencontrez-vous ?',
    subtitle: 'Sélectionnez tous ceux qui s\'appliquent.',
    type: 'multi',
    options: [
      { id: 'anxiety', label: 'Anxiété', emoji: '😰' },
      { id: 'fatigue', label: 'Fatigue chronique', emoji: '😴' },
      { id: 'insomnia', label: 'Troubles du sommeil', emoji: '🌃' },
      { id: 'pain', label: 'Douleurs corporelles', emoji: '💢' },
      { id: 'digestion', label: 'Problèmes digestifs', emoji: '🍽️' },
      { id: 'emotional', label: 'Instabilité émotionnelle', emoji: '🎭' },
      { id: 'motivation', label: 'Manque de motivation', emoji: '📉' },
      { id: 'overwork', label: 'Surmenage', emoji: '🔥' },
    ],
  },
  {
    id: 3,
    title: 'Combien de temps pouvez-vous consacrer par jour ?',
    subtitle: 'Nous calibrons votre programme à votre emploi du temps.',
    type: 'single',
    options: [
      { id: '10min', label: '10 minutes', emoji: '⏱️' },
      { id: '20min', label: '20 minutes', emoji: '🕐' },
      { id: '30min', label: '30 minutes', emoji: '🕑' },
      { id: '45min', label: '45 minutes', emoji: '🕒' },
      { id: '60min', label: '1 heure ou plus', emoji: '🕓' },
    ],
  },
  {
    id: 4,
    title: 'Quelles pratiques vous attirent ?',
    subtitle: 'Sélectionnez toutes celles qui vous intéressent.',
    type: 'multi',
    options: [
      { id: 'breathwork', label: 'Respiration / Pranayama', emoji: '🌬️' },
      { id: 'meditation', label: 'Méditation', emoji: '🧘' },
      { id: 'yoga', label: 'Yoga / Mouvement', emoji: '🤸' },
      { id: 'nutrition', label: 'Nutrition consciente', emoji: '🥗' },
      { id: 'journaling', label: 'Journal / Écriture', emoji: '📝' },
      { id: 'sound', label: 'Thérapie sonore', emoji: '🎵' },
      { id: 'cold', label: 'Exposition au froid', emoji: '🧊' },
      { id: 'nature', label: 'Connexion nature', emoji: '🌳' },
    ],
  },
];

export default questions;
