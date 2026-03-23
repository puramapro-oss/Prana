export interface Module {
  id: string;
  emoji: string;
  name: string;
  tag: string;
  tagColor: 'jade' | 'gold' | 'violet' | 'sage' | 'rose' | 'amber';
  description: string;
}

const modules: Module[] = [
  {
    id: 'respiration',
    emoji: '🌬️',
    name: 'Respiration Consciente',
    tag: 'Souffle',
    tagColor: 'jade',
    description: 'Techniques de pranayama et cohérence cardiaque pour réguler le système nerveux.',
  },
  {
    id: 'meditation',
    emoji: '🧘',
    name: 'Méditation Guidée',
    tag: 'Mental',
    tagColor: 'violet',
    description: 'Méditations adaptatives pour la pleine conscience, la visualisation et le scan corporel.',
  },
  {
    id: 'sommeil',
    emoji: '🌙',
    name: 'Sommeil Profond',
    tag: 'Repos',
    tagColor: 'sage',
    description: 'Routines du soir, yoga nidra et sons binauraux pour un sommeil réparateur.',
  },
  {
    id: 'nutrition',
    emoji: '🥗',
    name: 'Nutrition Holistique',
    tag: 'Alimentation',
    tagColor: 'gold',
    description: 'Plans alimentaires personnalisés, suivi des macros et recettes saisonnières.',
  },
  {
    id: 'mouvement',
    emoji: '🏃',
    name: 'Mouvement Vital',
    tag: 'Corps',
    tagColor: 'rose',
    description: 'Yoga, mobilité fonctionnelle et routines d\'exercices adaptées à votre niveau.',
  },
  {
    id: 'stress',
    emoji: '🧠',
    name: 'Gestion du Stress',
    tag: 'Mental',
    tagColor: 'violet',
    description: 'Outils de régulation émotionnelle, techniques de décompression et suivi d\'humeur.',
  },
  {
    id: 'energie',
    emoji: '⚡',
    name: 'Énergie Vitale',
    tag: 'Énergie',
    tagColor: 'amber',
    description: 'Optimisation des rythmes circadiens, micro-pauses et boosters naturels.',
  },
  {
    id: 'hydratation',
    emoji: '💧',
    name: 'Hydratation',
    tag: 'Corps',
    tagColor: 'sage',
    description: 'Rappels intelligents, suivi de consommation et recommandations personnalisées.',
  },
  {
    id: 'gratitude',
    emoji: '🙏',
    name: 'Journal de Gratitude',
    tag: 'Mental',
    tagColor: 'gold',
    description: 'Écriture contemplative, prompts quotidiens et analyse du bien-être émotionnel.',
  },
  {
    id: 'posture',
    emoji: '🧍',
    name: 'Posture & Ergonomie',
    tag: 'Corps',
    tagColor: 'rose',
    description: 'Corrections posturales, exercices de bureau et prévention des douleurs.',
  },
  {
    id: 'detox',
    emoji: '🍃',
    name: 'Détox Digitale',
    tag: 'Équilibre',
    tagColor: 'jade',
    description: 'Gestion du temps d\'écran, rituels de déconnexion et pleine présence.',
  },
  {
    id: 'cycle',
    emoji: '🔄',
    name: 'Cycles Féminins',
    tag: 'Santé',
    tagColor: 'rose',
    description: 'Suivi hormonal, adaptation des routines au cycle et bien-être féminin.',
  },
  {
    id: 'immunite',
    emoji: '🛡️',
    name: 'Immunité Naturelle',
    tag: 'Santé',
    tagColor: 'jade',
    description: 'Renforcement immunitaire par l\'alimentation, le froid et les suppléments.',
  },
  {
    id: 'focus',
    emoji: '🎯',
    name: 'Focus & Productivité',
    tag: 'Mental',
    tagColor: 'violet',
    description: 'Deep work, techniques Pomodoro avancées et état de flow.',
  },
  {
    id: 'relations',
    emoji: '❤️',
    name: 'Relations Saines',
    tag: 'Social',
    tagColor: 'rose',
    description: 'Communication non-violente, gestion des conflits et intelligence émotionnelle.',
  },
  {
    id: 'nature',
    emoji: '🌳',
    name: 'Connexion Nature',
    tag: 'Équilibre',
    tagColor: 'jade',
    description: 'Bains de forêt, earthing et intégration des rythmes naturels.',
  },
  {
    id: 'son',
    emoji: '🎵',
    name: 'Thérapie Sonore',
    tag: 'Énergie',
    tagColor: 'amber',
    description: 'Fréquences de guérison, bols tibétains et paysages sonores adaptatifs.',
  },
];

export default modules;
