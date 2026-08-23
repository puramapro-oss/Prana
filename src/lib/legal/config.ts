import type { LegalAppConfig } from "./types"
import { buildMediateurInfo } from "./company"
import { APP_DOMAIN, COMPANY_INFO } from "@/lib/constants"
import { PLANS, TRIAL_DAYS } from "@/lib/stripe/plans"

/**
 * Config NIYAMA de PRANA — dérivée de `@/lib/constants` (COMPANY_INFO), jamais réécrite ici :
 * `packages/legal/src/company.ts` fournit une adresse générique légèrement différente
 * ("8 Rue Chapelle" sans "de la") qui contredirait les pages légales déjà en place.
 */
export const PRANA_LEGAL_CONFIG: LegalAppConfig = {
  slug: "prana",
  nom: "PURAMA ONE",
  domaine: APP_DOMAIN,
  famille: "sante_bienetre",
  company: {
    nom: "PURAMA",
    forme_juridique: "SASU",
    adresse: "8 Rue de la Chapelle",
    code_postal: "25560",
    commune: "Frasne",
    pays: "France",
    siret: process.env.NEXT_PUBLIC_SIRET || "",
    tva_non_applicable: true,
    mention_tva: COMPANY_INFO.vat,
    emailContact: COMPANY_INFO.contact,
    directeurPublication: "Matiss Dornier",
    tribunalCompetent: `${COMPANY_INFO.rcs} (25)`,
  },
  mediateur: buildMediateurInfo(),
  descriptionActivite:
    "la régulation du système nerveux par protocoles guidés (respiration, cohérence cardiaque), l'organisation personnelle (LifeOS) et l'exécution de tâches assistée par intelligence artificielle.",
  aPaiement: true,
  aChatIA: true,
  clausesSpecifiquesCgv: [
    {
      titre: "Tarifs et abonnements",
      paragraphes: [
        `${PLANS.find((p) => p.id === "free")!.name} est gratuit, sans limite de durée. Les abonnements payants sont facturés mensuellement ou annuellement (l'abonnement annuel inclut une réduction) :`,
      ],
      liste: PLANS.filter((p) => p.priceMonthly > 0).map(
        (p) => `${p.name} : ${p.priceMonthly}€/mois ou ${p.priceYearly}€/an.`,
      ),
    },
    {
      titre: "Essai gratuit",
      paragraphes: [
        `Un essai gratuit de ${TRIAL_DAYS} jours du plan Pro est offert à l'inscription, sans carte bancaire requise. À l'issue de l'essai, le Client reste sur le plan Free tant qu'il n'a pas explicitement souscrit un abonnement payant.`,
      ],
    },
  ],
}
