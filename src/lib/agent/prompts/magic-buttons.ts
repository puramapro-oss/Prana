import type { MagicButtonSlug } from "@/lib/agent/magic-buttons-config"

/**
 * Schema attendu en sortie pour chaque bouton magique.
 * Validé en runtime côté API (Zod) avant retour client.
 */
export interface MagicButtonResponse {
  /** Phrase d'accueil chaleureuse mais sobre. 1-2 phrases. */
  intro: string
  /** Étapes du protocole. Vide si juste une action immédiate. */
  protocol_steps: Array<{
    label: string
    duration_seconds?: number
  }>
  /** L'action UNIQUE à faire maintenant (impérative, courte). */
  action: string
  /** CTA bouton — "C'est fait" par défaut, ou contextuel. */
  cta: string
}

interface PromptDefinition {
  /** Mots-clés ajoutés au prompt utilisateur côté API. */
  promptInstructions: string
  /** Réponse pré-écrite si l'API Anthropic timeout / fail. */
  fallback: MagicButtonResponse
}

export const MAGIC_BUTTON_PROMPTS: Record<MagicButtonSlug, PromptDefinition> = {
  "save-day": {
    promptInstructions: `Bouton SAVE-DAY (30 secondes).
Objectif : reset express. L'utilisateur sent que sa journée part en vrille.
1 ancrage corporel, 1 action minuscule. Pas plus.`,
    fallback: {
      intro: "Ta journée n'est pas fichue. On la reprend en 30 secondes.",
      protocol_steps: [
        { label: "Pose les pieds bien à plat. Sens le sol.", duration_seconds: 10 },
        { label: "Trois respirations. Lentes. Expire plus longtemps qu'inspire.", duration_seconds: 20 },
      ],
      action: "Choisis UNE chose minuscule à faire dans les 5 prochaines minutes. Une seule.",
      cta: "C'est fait",
    },
  },
  "stop-stress": {
    promptInstructions: `Bouton STOP-STRESS (90 secondes).
Objectif : faire redescendre le système nerveux.
Toujours la respiration 4-7-8 (inspire 4s, retiens 7s, expire 8s) × 4 cycles + ancrage 5 sens.`,
    fallback: {
      intro: "On respire ensemble. Je te guide. 90 secondes.",
      protocol_steps: [
        { label: "Inspire par le nez 4 secondes.", duration_seconds: 4 },
        { label: "Retiens 7 secondes.", duration_seconds: 7 },
        { label: "Expire bouche entrouverte 8 secondes.", duration_seconds: 8 },
        { label: "Recommence 3 fois encore.", duration_seconds: 57 },
        { label: "Nomme 3 choses que tu vois autour de toi.", duration_seconds: 14 },
      ],
      action: "Reprends. Sans rien décider. Juste la prochaine chose simple.",
      cta: "Je suis là",
    },
  },
  "anti-chaos": {
    promptInstructions: `Bouton ANTI-CHAOS (60 secondes).
Objectif : décharger la tête en 3 sphères (corps, esprit, prochaine action).
Demander au modèle de produire 3 questions très brèves, et UNE action.`,
    fallback: {
      intro: "Trop de bruit dans la tête. On vide en 3 questions, puis on agit.",
      protocol_steps: [
        { label: "Corps : où tu sens le plus de tension ? Nomme la zone.", duration_seconds: 15 },
        { label: "Tête : qu'est-ce qui revient en boucle ? Une phrase, c'est tout.", duration_seconds: 20 },
        { label: "Prochain geste : qu'est-ce qui ne peut PAS attendre ? Un seul.", duration_seconds: 25 },
      ],
      action: "Fais ce premier geste. Juste celui-là. Le reste attend.",
      cta: "C'est fait",
    },
  },
  exhausted: {
    promptInstructions: `Bouton EXHAUSTED (20 secondes).
Objectif : action MICRO seulement. L'utilisateur n'a plus rien.
Une action ridiculement petite : boire de l'eau, ouvrir une fenêtre, s'asseoir 30 sec.`,
    fallback: {
      intro: "Tu n'as plus rien. C'est ok. On garde minuscule.",
      protocol_steps: [],
      action: "Bois un verre d'eau. Rien d'autre. Vraiment.",
      cta: "Fait",
    },
  },
  "focus-tunnel": {
    promptInstructions: `Bouton FOCUS-TUNNEL (25 minutes).
Objectif : entrer en focus profond. Demander la tâche unique à l'utilisateur (déjà fournie via input).
Produire un protocole : préparation 60s, focus 25min, sortie 60s.`,
    fallback: {
      intro: "25 minutes. Une seule tâche. On verrouille.",
      protocol_steps: [
        { label: "Ferme tous les autres onglets. Téléphone en mode avion.", duration_seconds: 60 },
        { label: "Démarre la tâche. Si ça dérape, reviens à la première phrase.", duration_seconds: 1500 },
        { label: "Pause 60s. Marche 5 pas. Bois un verre d'eau.", duration_seconds: 60 },
      ],
      action: "Démarre maintenant. Le timer tourne.",
      cta: "Je suis dedans",
    },
  },
  "sleep-express": {
    promptInstructions: `Bouton SLEEP-EXPRESS (3 minutes).
Objectif : ralentir le cœur avant de dormir.
Respiration 4-7-8 longue (8 cycles) + visualisation très courte.`,
    fallback: {
      intro: "On ralentit le cœur. 3 minutes. Tu peux fermer les yeux.",
      protocol_steps: [
        { label: "Inspire 4. Retiens 7. Expire 8.", duration_seconds: 19 },
        { label: "Recommence 7 fois.", duration_seconds: 133 },
        { label: "Visualise ton corps qui s'enfonce dans le matelas.", duration_seconds: 28 },
      ],
      action: "Pose le téléphone et ferme les yeux.",
      cta: "Bonne nuit",
    },
  },
  confidence: {
    promptInstructions: `Bouton CONFIDENCE (60 secondes).
Objectif : entrer en confiance avant prise de parole/réunion.
Posture verticale + power pose 30s + respiration carrée + phrase d'ancrage.`,
    fallback: {
      intro: "Tu es prêt·e. On installe la posture en 60 secondes.",
      protocol_steps: [
        { label: "Debout. Pieds écartés. Épaules en arrière. 30 secondes.", duration_seconds: 30 },
        { label: "Respiration carrée : 4-4-4-4. Trois cycles.", duration_seconds: 24 },
        { label: "Une phrase qui t'ancre : « Je suis là. Je sais ce que je fais. »", duration_seconds: 6 },
      ],
      action: "Vas-y.",
      cta: "Go",
    },
  },
  procrastination: {
    promptInstructions: `Bouton PROCRASTINATION (30 secondes).
Objectif : réduire la tâche jusqu'au geste impossible à refuser.
Demander à l'utilisateur la tâche reportée. Couper en 1 micro-pas de moins de 2 minutes.`,
    fallback: {
      intro: "On coupe en plus petit jusqu'à ce que ça devienne ridicule.",
      protocol_steps: [
        { label: "Pense à la tâche. Tu n'as pas à la faire entière.", duration_seconds: 10 },
        { label: "Trouve la version qui prend moins de 2 minutes.", duration_seconds: 20 },
      ],
      action: "Fais cette version-là. Maintenant.",
      cta: "C'est parti",
    },
  },
  "inbox-clean": {
    promptInstructions: `Bouton INBOX-CLEAN (2 minutes).
Objectif : trier la boîte sans la lire. 3 catégories : répondre / archiver / ignorer.
Pas de lecture profonde. On décide à la ligne d'objet.`,
    fallback: {
      intro: "On ne lit pas. On décide. À l'objet uniquement.",
      protocol_steps: [
        { label: "Ouvre la boîte. Reste sur les en-têtes.", duration_seconds: 10 },
        { label: "Pour chaque mail : répondre en 30 sec, archiver, ou ignorer.", duration_seconds: 100 },
        { label: "Stop quand 2 minutes sont écoulées. Pas plus.", duration_seconds: 10 },
      ],
      action: "Ouvre la boîte mail.",
      cta: "C'est trié",
    },
  },
  "plan-7-days": {
    promptInstructions: `Bouton PLAN-7-DAYS (5 minutes).
Objectif : produire un plan sur 7 jours, 1 priorité par jour.
Demander : qu'est-ce qui compte cette semaine ? Twin Profile + dernières captures peuvent aider.
Produire 7 lignes : "Jour X : <action priorité>".`,
    fallback: {
      intro: "Ta semaine en 7 lignes. Une seule priorité par jour.",
      protocol_steps: [
        { label: "Pense à la chose qui DOIT bouger cette semaine.", duration_seconds: 60 },
        { label: "Découpe-la en 7 morceaux faisables — 1 par jour.", duration_seconds: 180 },
        { label: "Garde le reste pour la semaine suivante.", duration_seconds: 60 },
      ],
      action: "Note les 7 lignes. Une page suffit.",
      cta: "Plan posé",
    },
  },
  "mind-dump": {
    promptInstructions: `Bouton MIND-DUMP (4 minutes).
Objectif : tout sortir. L'utilisateur tape (ou dicte) tout ce qui tourne. L'IA classe en background ensuite.
Donner la consigne de vider sans filtre, 4 minutes.`,
    fallback: {
      intro: "Tout sort. Je trie après. Tu n'as qu'à écrire.",
      protocol_steps: [
        { label: "Ouvre la capture vocale ou textuelle.", duration_seconds: 5 },
        { label: "Écris/parle sans t'arrêter pendant 4 minutes.", duration_seconds: 235 },
      ],
      action: "Démarre. Je classe quand tu fermes.",
      cta: "Vider",
    },
  },
  "room-of-day": {
    promptInstructions: `Bouton ROOM-OF-DAY.
Objectif : afficher l'action collective de la room active du jour.
Si pas de room active, suggérer 1-2 rooms officielles pertinentes selon le pulse récent.`,
    fallback: {
      intro: "Action collective du jour. Tu n'es pas seul·e à la faire.",
      protocol_steps: [],
      action: "Va dans /rooms, choisis ta room, et fais l'action du jour.",
      cta: "J'y vais",
    },
  },
}

/** Demande JSON stricte. Utilisé en append au system prompt principal. */
export const JSON_OUTPUT_INSTRUCTION = `Tu DOIS répondre uniquement avec un objet JSON valide, sans markdown, sans backticks, sans préface, exactement de cette forme :
{
  "intro": string,
  "protocol_steps": Array<{ "label": string, "duration_seconds"?: number }>,
  "action": string,
  "cta": string
}
Aucun texte hors du JSON.`
