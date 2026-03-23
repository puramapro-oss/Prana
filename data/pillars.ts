export interface Pillar {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  techniques: string[];
}

export const pillars: Pillar[] = [
  {
    id: 'sleep',
    name: 'Sommeil',
    icon: '🌙',
    color: 'violet',
    description: 'Optimise ton sommeil pour une régénération cellulaire profonde.',
    techniques: ['yoga-nidra', 'sats', 'coherence-cardiaque', 'scan-corporel'],
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    icon: '🌱',
    color: 'jade',
    description: 'Nourris ton corps avec intelligence et conscience.',
    techniques: ['chrono-nutrition', 'jeune-intermittent', 'alimentation-ayurvedique'],
  },
  {
    id: 'movement',
    name: 'Mouvement',
    icon: '🏔️',
    color: 'amber',
    description: 'Active ton énergie vitale par le mouvement conscient.',
    techniques: ['5-rites-tibetains', 'qi-gong', 'tsa-lung', 'yoga-flow'],
  },
  {
    id: 'mind',
    name: 'Mental',
    icon: '🧠',
    color: 'sage',
    description: 'Maîtrise ton mental et reprogramme tes croyances.',
    techniques: ['meditation-iam', 'eft', 'emdr', 'hooponopono'],
  },
  {
    id: 'energy',
    name: 'Énergie',
    icon: '⚡',
    color: 'gold',
    description: 'Cultive et canalise ton énergie vitale.',
    techniques: ['tummo', 'wim-hof', 'pranayama', 'respiration-holotropique'],
  },
  {
    id: 'spirit',
    name: 'Esprit',
    icon: '🕊️',
    color: 'rose',
    description: 'Connecte-toi à ta dimension spirituelle profonde.',
    techniques: ['flamme-violette', 'dzogchen', 'tonglen', 'meditation-transcendantale'],
  },
];
