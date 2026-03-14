 // @sikabox/core — Types et enums du domaine (B4.2)

// ── Enums ──────────────────────────────────────────────

export const TypeTransaction = {
  VENTE_TEXTILE: 'VENTE_TEXTILE',
  MOMO_DEPOT: 'MOMO_DEPOT',
  MOMO_RETRAIT: 'MOMO_RETRAIT',
  COMMISSION_MOMO: 'COMMISSION_MOMO',
} as const;
export type TypeTransaction = (typeof TypeTransaction)[keyof typeof TypeTransaction];

export const TypeCaisse = {
  STOCK: 'STOCK',
  SALAIRE: 'SALAIRE',
  REMBOURSEMENT: 'REMBOURSEMENT',
  RESERVE: 'RESERVE',
  FONDS_ROULEMENT_MOMO: 'FONDS_ROULEMENT_MOMO',
} as const;
export type TypeCaisse = (typeof TypeCaisse)[keyof typeof TypeCaisse];

export const RoleUtilisateur = {
  ADMIN: 'ADMIN',
  GESTIONNAIRE: 'GESTIONNAIRE',
} as const;
export type RoleUtilisateur = (typeof RoleUtilisateur)[keyof typeof RoleUtilisateur];

export const ActionAudit = {
  MODIFICATION_VARIABLE: 'MODIFICATION_VARIABLE',
  CREATION_COMPTE: 'CREATION_COMPTE',
  DESACTIVATION_COMPTE: 'DESACTIVATION_COMPTE',
  ACTIVATION_COMPTE: 'ACTIVATION_COMPTE',
  CORRECTION_TRANSACTION: 'CORRECTION_TRANSACTION',
} as const;
export type ActionAudit = (typeof ActionAudit)[keyof typeof ActionAudit];

export const StatutCaisse = {
  LIBRE: 'LIBRE',
  BLOQUE: 'BLOQUE',
  SEMI_BLOQUE: 'SEMI_BLOQUE',
  ISOLE: 'ISOLE',
} as const;
export type StatutCaisse = (typeof StatutCaisse)[keyof typeof StatutCaisse];

// ── Codes d'erreur ─────────────────────────────────────

export const CodeErreur = {
  VENTE_A_PERTE: 'VENTE_A_PERTE',
  MONTANT_INVALIDE: 'MONTANT_INVALIDE',
  FONDS_INSUFFISANT: 'FONDS_INSUFFISANT',
  FENETRE_EXPIREE: 'FENETRE_EXPIREE',
  RATIOS_INVALIDES: 'RATIOS_INVALIDES',
  DESIGNATION_INVALIDE: 'DESIGNATION_INVALIDE',
  OPERATEUR_INVALIDE: 'OPERATEUR_INVALIDE',
} as const;
export type CodeErreur = (typeof CodeErreur)[keyof typeof CodeErreur];

// ── Interfaces du domaine ─────────────────────────────

export interface ErreurValidation {
  code: CodeErreur;
  message: string;
}

export interface Ratios {
  salaire: number;
  remboursement: number;
  reserve: number;
}

export interface RatiosPostPlafond {
  salaire: number;
  reserve: number;
}

export interface ContexteRepartition {
  beneficeNet: number;
  ratios: Ratios;
  ratiosPostPlafond: RatiosPostPlafond;
  soldeRemboursement: number;
  plafondCapital: number;
}

export interface MouvementCaisseResult {
  caisse: TypeCaisse;
  montant: number;
  operateurMomoId?: string;
}

export interface VenteTextileInput {
  prixDeVente: number;
  coutAchat: number;
  designation: string;
}

export interface VenteTextileValidee {
  prixDeVente: number;
  coutAchat: number;
  designation: string;
  beneficeNet: number;
}

export interface OperationMomoInput {
  typeOperation: 'DEPOT' | 'RETRAIT';
  montant: number;
  soldeActuel: number;
}

export interface OperationMomoValidee {
  typeOperation: 'DEPOT' | 'RETRAIT';
  montant: number;
  nouveauSolde: number;
}

export interface CommissionMomoInput {
  montant: number;
}

export interface CommissionMomoValidee {
  montant: number;
}

export interface TransactionPourCorrection {
  type: TypeTransaction;
  prixDeVente?: number;
  coutAchat?: number;
  designation?: string;
  montant: number;
  operateurMomoId?: string;
  beneficeNet: number;
  mouvements: MouvementCaisseResult[];
}

export interface PeriodeRapport {
  annee: number;
  trimestre: 1 | 2 | 3 | 4;
  dateDebut: string;
  dateFin: string;
}

export interface NombreTransactions {
  total: number;
  venteTextile: number;
  momoDepot: number;
  momoRetrait: number;
  commissionMomo: number;
}

export interface VentilationCumulee {
  caisseStock: number;
  caisseSalaire: number;
  caisseRemboursement: number;
  caisseReserve: number;
}

export interface RapportTrimestriel {
  periode: PeriodeRapport;
  nombreTransactions: NombreTransactions;
  chiffreAffairesTotal: number;
  beneficeNetTotal: number;
  ventilationCumulee: VentilationCumulee;
  nombreCorrections: number;
}

export interface TransactionPourRapport {
  type: TypeTransaction;
  montant: number;
  coutAchat?: number;
  beneficeNet: number;
  corrigee: boolean;
  mouvements: MouvementCaisseResult[];
}
