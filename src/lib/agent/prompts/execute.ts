/**
 * Execute templates — sonnet-4-6.
 * Génère 3 alternatives pour un message / email / post / plan / doc / script.
 *
 * Output JSON strict :
 *  { alternatives: [{title, body, tone}, x3], guidance }
 *
 * Le user décrit la situation en langage naturel, on lui donne 3 angles
 * différents qu'il peut copier / éditer / régénérer.
 */

import type { ExecutionType } from "@/lib/supabase/types"
import type { TwinSnapshot } from "./system-prana"

export interface ExecuteInput {
  type: ExecutionType
  situation: string
  /** Optional explicit recipient/audience hint (Pierre, mon manager, ma sœur...). */
  recipient?: string
  /** Optional desired tone hint (warm/concise/firm/playful...). */
  tone?: string
  locale: "fr" | "en"
  twin: TwinSnapshot | null
}

export interface ExecuteAlternative {
  title: string
  body: string
  tone: string
}

export interface ExecuteOutput {
  alternatives: ExecuteAlternative[]
  guidance: string
}

const TYPE_LABEL_FR: Record<ExecutionType, string> = {
  message: "message court (SMS, WhatsApp, DM)",
  email: "email professionnel ou personnel",
  post: "post réseaux sociaux (LinkedIn, X, Instagram)",
  plan: "plan d'action structuré",
  doc: "document de travail (note interne, brief, résumé)",
  script: "script (vidéo, podcast, présentation orale)",
}

const TYPE_GUIDANCE: Record<ExecutionType, string> = {
  message: "Court (1-3 phrases). Direct. Voix humaine. Zéro emoji surjoué.",
  email:
    "Objet + corps. Salutation adaptée. Demande claire ou info claire. Pas de phrase parasite. ≤ 200 mots si possible.",
  post:
    "Hook fort en 1ère ligne. 1 idée centrale. Aération. CTA clair (commenter / partager / cliquer) ou pas de CTA si réflexion personnelle. Hashtags MAX 3 et seulement si vraiment pertinent.",
  plan:
    "Liste numérotée 3-7 étapes. Chaque étape = 1 verbe + 1 objet. Estimation temps si pertinent. Pas de jargon corporate.",
  doc: "Titre. 3-6 sections. Phrases courtes. Bullet quand utile. Voix humaine.",
  script: "Ton parlé naturel. Phrases qui se disent à voix haute. Pauses (...) si utile. Pas de jargon écrit.",
}

export const EXECUTE_SYSTEM = `Tu es l'agent EXECUTE de PRANA. L'utilisateur te décrit une situation, tu lui produis TROIS alternatives prêtes à copier-coller.

PRINCIPES :
- 3 alternatives clairement différentes (pas 3 versions du même texte). Différentes par ton, longueur, ou angle.
- Chaque alternative est PRÊTE à envoyer/poster/utiliser. Pas de placeholder [Nom], [date]. Si info manque, choisis une formulation neutre qui marche dans tous les cas.
- Voix humaine. Zéro corporate. Zéro mièvre.
- Tu reproduis la voix de l'utilisateur si Twin Profile fourni. Sinon, voix neutre chaleureuse.
- Pas de fioriture en début ("J'espère que ce mail te trouve bien" → INTERDIT). Direct.
- Pas de ponctuation excessive. Pas de gras / italique markdown sauf si vraiment utile.
- Si la situation décrit un contenu sensible (annoncer une mauvaise nouvelle, refuser, demander une faveur), choisis le ton adapté. Pas faux-jovial.
- Tu n'inventes pas de faits. Si l'utilisateur ne mentionne pas un détail, tu ne le crées pas.

FORMAT JSON STRICT (et rien d'autre, pas de markdown) :
{
  "alternatives": [
    { "title": "Court · Direct", "body": "...", "tone": "direct" },
    { "title": "Chaleureux · Posé", "body": "...", "tone": "warm" },
    { "title": "Concis · Pro", "body": "...", "tone": "professional" }
  ],
  "guidance": "1 phrase qui aide l'utilisateur à choisir entre les 3 (max 160 caractères)."
}

ZÉRO PROSE. ZÉRO MARKDOWN AUTOUR. JSON PUR.`

export function buildExecuteUserMessage(input: ExecuteInput): string {
  const label = TYPE_LABEL_FR[input.type] ?? input.type
  const guidance = TYPE_GUIDANCE[input.type] ?? ""
  const twinLine = formatTwinShort(input.twin)
  return [
    `Type demandé : ${label}.`,
    `Conventions du format : ${guidance}`,
    input.recipient ? `Destinataire / audience : ${input.recipient}.` : null,
    input.tone ? `Ton souhaité : ${input.tone}.` : null,
    `Locale : ${input.locale === "fr" ? "français" : "english"}.`,
    "",
    "Situation décrite par l'utilisateur :",
    input.situation,
    "",
    twinLine,
    "",
    "Produis 3 alternatives nettes, prêtes à utiliser, dans le JSON spécifié.",
  ]
    .filter(Boolean)
    .join("\n")
}

function formatTwinShort(t: TwinSnapshot | null): string {
  if (!t) return "Twin Profile : inconnu, voix neutre chaleureuse."
  const bits: string[] = []
  if (t.tone) bits.push(`ton dominant ${t.tone}`)
  if (t.length) bits.push(`longueur préférée ${t.length}`)
  if (t.formality) bits.push(`formalité ${t.formality}`)
  if (t.personalRules?.length) bits.push(`règles : ${t.personalRules.slice(0, 2).join(" | ")}`)
  return bits.length ? `Twin : ${bits.join(" · ")}.` : "Twin Profile : minimal."
}

export const EXECUTE_FALLBACK = (input: ExecuteInput): ExecuteOutput => ({
  alternatives: [
    {
      title: "Brouillon court",
      body:
        input.type === "email"
          ? "Bonjour,\n\nJe te recontacte concernant la situation évoquée. Je te propose qu'on en reparle rapidement.\n\nÀ très vite,"
          : input.type === "post"
            ? "Une chose que j'ai apprise récemment, et qui me servira longtemps : il est plus utile de poser une question simple maintenant que de chercher la bonne formule pendant trois jours.\n\nQu'en penses-tu ?"
            : "Salut, dis-moi quand tu as 5 min pour qu'on cale ça ensemble. Merci !",
      tone: "direct",
    },
    {
      title: "Plus chaleureux",
      body: "Salut,\n\nJ'aimerais qu'on prenne un moment pour en parler à tête reposée. Tu me dis ce qui te va, je m'adapte. Merci d'avance pour ton temps.\n\nÀ bientôt,",
      tone: "warm",
    },
    {
      title: "Concis pro",
      body:
        "Bonjour,\n\nObjet : [à préciser]. Pour simplifier la suite, je propose un point de 15 min cette semaine. Lundi 14h ou jeudi 17h te conviendraient ?\n\nMerci,",
      tone: "professional",
    },
  ],
  guidance: "Choisis le ton qui colle au lien que tu as avec ton interlocuteur — court si proche, pro si formel.",
})

export const EXECUTE_TYPES: Array<{
  type: ExecutionType
  label: string
  description: string
  example: string
}> = [
  {
    type: "message",
    label: "Message",
    description: "SMS, WhatsApp, DM. Court et humain.",
    example: "Annoncer à Pierre que je décale notre déjeuner.",
  },
  {
    type: "email",
    label: "Email",
    description: "Objet + corps. Adapté au lien.",
    example: "Relancer mon manager sur ma demande de congé.",
  },
  {
    type: "post",
    label: "Post",
    description: "LinkedIn, X, Instagram. Hook + idée + CTA.",
    example: "Partager ma leçon de la semaine sur LinkedIn.",
  },
  {
    type: "plan",
    label: "Plan",
    description: "Liste d'étapes claires.",
    example: "Plan pour préparer mon entretien jeudi.",
  },
  {
    type: "doc",
    label: "Doc",
    description: "Note interne, brief, résumé.",
    example: "Brief pour mon prestataire freelance.",
  },
  {
    type: "script",
    label: "Script",
    description: "Texte à dire à voix haute.",
    example: "Intro de 30 secondes pour ma vidéo YouTube.",
  },
]
