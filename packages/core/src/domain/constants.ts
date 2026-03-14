// @sikabox/core — Constantes du domaine (B4.3)

/** Durée de la fenêtre de correction en millisecondes (10 minutes) */
export const DUREE_FENETRE_CORRECTION_MS = 10 * 60 * 1000;

/** Devise utilisée (Franc CFA) */
export const DEVISE = 'XOF' as const;

/** Ratios de répartition par défaut (avant plafond) */
export const RATIOS_DEFAUT = {
  salaire: 50,
  remboursement: 30,
  reserve: 20,
} as const;

/** Ratios post-plafond par défaut */
export const RATIOS_POST_PLAFOND_DEFAUT = {
  salaire: 70,
  reserve: 30,
} as const;

/** Plafond de capital par défaut (FCFA) */
export const PLAFOND_CAPITAL_DEFAUT = 500_000;

/** Fréquence de rappel commission par défaut (jours) */
export const FREQUENCE_RAPPEL_COMMISSION_DEFAUT = 3;

/** Durée d'inactivité avant verrouillage (minutes) */
export const VERROUILLAGE_INACTIVITE_DEFAUT = 5;
