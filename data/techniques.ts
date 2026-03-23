/* ------------------------------------------------------------------ */
/*  Techniques — Sagesse library data                                  */
/* ------------------------------------------------------------------ */

export type TechniqueLevel = 'Secret' | 'Ultime' | 'Ancestral' | 'Sacré';

export interface Technique {
  id: string;
  name: string;
  category: string;
  level: TechniqueLevel;
  origin: string;
  description: string;
  duration: string;
  steps: string[];
  benefits: string[];
}

export interface TechniqueCategory {
  id: string;
  title: string;
  icon: string;
  color: 'jade' | 'gold' | 'violet' | 'sage' | 'rose' | 'amber';
  techniques: Technique[];
}

const categories: TechniqueCategory[] = [
  {
    id: 'breathwork',
    title: 'Pranayama & Respiration',
    icon: '🌬️',
    color: 'jade',
    techniques: [
      {
        id: 'nadi-shodhana',
        name: 'Nadi Shodhana',
        category: 'breathwork',
        level: 'Ancestral',
        origin: 'Hatha Yoga Pradipika',
        description: 'Respiration alternée par les narines pour équilibrer les canaux énergétiques Ida et Pingala.',
        duration: '10 min',
        steps: [
          'Asseyez-vous confortablement, dos droit.',
          'Fermez la narine droite avec le pouce droit.',
          'Inspirez par la narine gauche sur 4 temps.',
          'Fermez les deux narines, retenez 4 temps.',
          'Expirez par la narine droite sur 4 temps.',
          'Inspirez par la droite, retenez, expirez par la gauche.',
        ],
        benefits: ['Équilibre nerveux', 'Clarté mentale', 'Réduction du stress'],
      },
      {
        id: 'kapalabhati',
        name: 'Kapalabhati',
        category: 'breathwork',
        level: 'Sacré',
        origin: 'Yoga Sutras',
        description: 'Technique de purification par expirations forcées et rapides — le "souffle de feu".',
        duration: '5 min',
        steps: [
          'Asseyez-vous en posture stable.',
          'Inspirez profondément.',
          'Expirez rapidement par le nez en contractant l\'abdomen.',
          'Laissez l\'inspiration se faire passivement.',
          'Répétez 30 expirations rapides.',
          'Terminez par une rétention poumons pleins.',
        ],
        benefits: ['Énergie vitale', 'Détoxification', 'Éveil mental'],
      },
      {
        id: 'coherence-cardiaque',
        name: 'Cohérence Cardiaque',
        category: 'breathwork',
        level: 'Secret',
        origin: 'Neurosciences modernes',
        description: 'Respiration 5-5 synchronisée avec le rythme cardiaque pour une régulation optimale du système nerveux.',
        duration: '5 min',
        steps: [
          'Installez-vous confortablement.',
          'Inspirez sur 5 secondes.',
          'Expirez sur 5 secondes.',
          'Maintenez ce rythme pendant 5 minutes.',
          'Concentrez-vous sur la zone du cœur.',
        ],
        benefits: ['Réduction du cortisol', 'Équilibre émotionnel', 'Sommeil amélioré'],
      },
    ],
  },
  {
    id: 'meditation',
    title: 'Méditation & Pleine Conscience',
    icon: '🧘',
    color: 'violet',
    techniques: [
      {
        id: 'vipassana',
        name: 'Vipassana',
        category: 'meditation',
        level: 'Ancestral',
        origin: 'Bouddhisme Theravada',
        description: 'Méditation d\'observation pure — voir les choses telles qu\'elles sont réellement.',
        duration: '20 min',
        steps: [
          'Asseyez-vous les yeux fermés.',
          'Portez attention aux sensations corporelles.',
          'Balayez le corps de la tête aux pieds.',
          'Observez sans réagir, sans juger.',
          'Notez l\'impermanence de chaque sensation.',
        ],
        benefits: ['Conscience profonde', 'Détachement', 'Paix intérieure'],
      },
      {
        id: 'yoga-nidra',
        name: 'Yoga Nidra',
        category: 'meditation',
        level: 'Sacré',
        origin: 'Tantra ancien',
        description: 'Le "sommeil yogique" — relaxation consciente entre veille et sommeil.',
        duration: '30 min',
        steps: [
          'Allongez-vous en Shavasana.',
          'Formulez votre Sankalpa (intention).',
          'Rotation de conscience dans le corps.',
          'Visualisation guidée.',
          'Retour progressif à l\'état de veille.',
        ],
        benefits: ['Récupération profonde', 'Reprogrammation mentale', 'Guérison émotionnelle'],
      },
      {
        id: 'trataka',
        name: 'Trataka',
        category: 'meditation',
        level: 'Ultime',
        origin: 'Hatha Yoga',
        description: 'Méditation par fixation du regard — purification de l\'esprit par la concentration visuelle.',
        duration: '15 min',
        steps: [
          'Placez une bougie à hauteur des yeux.',
          'Fixez la flamme sans cligner.',
          'Maintenez 2-3 minutes.',
          'Fermez les yeux, visualisez l\'image résiduelle.',
          'Répétez 3 cycles.',
        ],
        benefits: ['Concentration laser', 'Intuition accrue', 'Purification énergétique'],
      },
    ],
  },
  {
    id: 'movement',
    title: 'Mouvement & Corps',
    icon: '🏃',
    color: 'rose',
    techniques: [
      {
        id: 'surya-namaskar',
        name: 'Surya Namaskar',
        category: 'movement',
        level: 'Ancestral',
        origin: 'Tradition védique',
        description: 'La Salutation au Soleil — séquence dynamique de 12 postures pour éveiller le corps.',
        duration: '15 min',
        steps: [
          'Pranamasana — mains en prière.',
          'Hasta Uttanasana — extension arrière.',
          'Uttanasana — flexion avant.',
          'Ashwa Sanchalanasana — fente basse.',
          'Phalakasana — planche.',
          'Ashtanga Namaskar — huit points au sol.',
        ],
        benefits: ['Souplesse', 'Force', 'Énergie matinale'],
      },
      {
        id: 'qi-gong-5',
        name: 'Qi Gong des 5 Éléments',
        category: 'movement',
        level: 'Sacré',
        origin: 'Médecine traditionnelle chinoise',
        description: 'Mouvements lents harmonisant les cinq éléments — Bois, Feu, Terre, Métal, Eau.',
        duration: '20 min',
        steps: [
          'Position de l\'arbre — enracinement.',
          'Mouvement du Bois — expansion latérale.',
          'Mouvement du Feu — élévation.',
          'Mouvement de la Terre — rotation centripète.',
          'Mouvement du Métal — contraction.',
          'Mouvement de l\'Eau — ondulation descendante.',
        ],
        benefits: ['Circulation d\'énergie', 'Équilibre organique', 'Sérénité'],
      },
    ],
  },
  {
    id: 'energy',
    title: 'Énergie & Guérison',
    icon: '⚡',
    color: 'amber',
    techniques: [
      {
        id: 'chakra-dhyana',
        name: 'Chakra Dhyana',
        category: 'energy',
        level: 'Ultime',
        origin: 'Tantra kundalini',
        description: 'Méditation progressive à travers les 7 chakras pour éveiller l\'énergie serpentine.',
        duration: '25 min',
        steps: [
          'Concentrez-vous sur Muladhara (racine).',
          'Montez progressivement vers Svadhisthana.',
          'Activez Manipura avec le souffle de feu.',
          'Ouvrez Anahata avec l\'amour inconditionnel.',
          'Purifiez Vishuddha par le chant OM.',
          'Éveiller Ajna par la visualisation.',
          'Dissolvez-vous dans Sahasrara.',
        ],
        benefits: ['Éveil kundalini', 'Expansion de conscience', 'Guérison holistique'],
      },
      {
        id: 'wim-hof',
        name: 'Méthode Wim Hof',
        category: 'energy',
        level: 'Secret',
        origin: 'Pays-Bas moderne',
        description: 'Combinaison de respiration intense, exposition au froid et méditation pour reprogrammer le système nerveux.',
        duration: '15 min',
        steps: [
          '30 respirations profondes et rapides.',
          'Expiration complète, rétention poumons vides.',
          'Tenez aussi longtemps que possible.',
          'Inspiration profonde, rétention 15 secondes.',
          'Répétez 3-4 cycles.',
          'Terminez par une douche froide de 2 minutes.',
        ],
        benefits: ['Immunité renforcée', 'Énergie explosive', 'Résilience mentale'],
      },
    ],
  },
  {
    id: 'sound',
    title: 'Son & Vibration',
    icon: '🎵',
    color: 'gold',
    techniques: [
      {
        id: 'bols-tibetains',
        name: 'Bols Tibétains',
        category: 'sound',
        level: 'Sacré',
        origin: 'Tibet ancien',
        description: 'Bain sonore avec bols chantants pour harmoniser les fréquences corporelles.',
        duration: '20 min',
        steps: [
          'Allongez-vous confortablement.',
          'Laissez les vibrations pénétrer le corps.',
          'Portez attention aux zones de résonance.',
          'Suivez les harmoniques avec votre conscience.',
          'Intégrez le silence entre les sons.',
        ],
        benefits: ['Relaxation profonde', 'Harmonisation cellulaire', 'Libération émotionnelle'],
      },
      {
        id: 'mantra-om',
        name: 'Chant du OM',
        category: 'sound',
        level: 'Ancestral',
        origin: 'Vedas',
        description: 'Répétition du son primordial OM — vibration de l\'univers manifesté.',
        duration: '10 min',
        steps: [
          'Asseyez-vous en posture stable.',
          'Inspirez profondément.',
          'Chantez "AUM" sur l\'expiration.',
          'Sentez la vibration dans la poitrine (A), la gorge (U), le crâne (M).',
          'Répétez 108 fois ou pendant 10 minutes.',
        ],
        benefits: ['Centrage profond', 'Élévation vibratoire', 'Connexion universelle'],
      },
    ],
  },
];

export default categories;
