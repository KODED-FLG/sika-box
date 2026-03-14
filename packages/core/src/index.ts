// @sikabox/core — Logique métier pure, zéro dépendance I/O

// Result pattern
export { Result, Ok, Err } from './result';

// Types et enums du domaine
export {
  TypeTransaction,
  TypeCaisse,
  RoleUtilisateur,
  ActionAudit,
  StatutCaisse,
  CodeErreur,
} from './domain/types';
export type {
  ErreurValidation,
  Ratios,
  RatiosPostPlafond,
  ContexteRepartition,
  MouvementCaisseResult,
  VenteTextileInput,
  VenteTextileValidee,
  OperationMomoInput,
  OperationMomoValidee,
  CommissionMomoInput,
  CommissionMomoValidee,
  TransactionPourCorrection,
  PeriodeRapport,
  NombreTransactions,
  VentilationCumulee,
  RapportTrimestriel,
  TransactionPourRapport,
} from './domain/types';

// Constantes
export {
  DUREE_FENETRE_CORRECTION_MS,
  DEVISE,
  RATIOS_DEFAUT,
  RATIOS_POST_PLAFOND_DEFAUT,
  PLAFOND_CAPITAL_DEFAUT,
  FREQUENCE_RAPPEL_COMMISSION_DEFAUT,
  VERROUILLAGE_INACTIVITE_DEFAUT,
} from './domain/constants';

// Moteur de répartition
export { calculerRepartition } from './engine/repartition';

// Fenêtre de correction
export { estFenetreActive, genererCorrectionTransaction } from './engine/correction';

// Rapport trimestriel
export { agregerRapportTrimestriel } from './engine/rapport';

// Validations
export { validerVenteTextile } from './validation/vente-textile';
export { validerOperationMomo } from './validation/operation-momo';
export { validerCommissionMomo } from './validation/commission-momo';
export { validerRatios, validerRatiosPostPlafond } from './validation/ratios';
