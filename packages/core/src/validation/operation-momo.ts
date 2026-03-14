// B4.8 — Validation opération MoMo
import { Result } from '../result';
import type {
  OperationMomoInput,
  OperationMomoValidee,
  ErreurValidation,
} from '../domain/types';
import { CodeErreur } from '../domain/types';

export function validerOperationMomo(
  input: OperationMomoInput,
): Result<OperationMomoValidee, ErreurValidation> {
  const { typeOperation, montant, soldeActuel } = input;

  if (!Number.isInteger(montant) || montant <= 0) {
    return Result.err({
      code: CodeErreur.MONTANT_INVALIDE,
      message: 'Le montant doit être un entier positif en FCFA.',
    });
  }

  if (typeOperation === 'DEPOT') {
    // Pour un dépôt, le e-float diminue → vérifier que le solde est suffisant
    if (soldeActuel < montant) {
      return Result.err({
        code: CodeErreur.FONDS_INSUFFISANT,
        message: `Fonds insuffisants : solde ${soldeActuel} FCFA, dépôt demandé ${montant} FCFA.`,
      });
    }

    return Result.ok({
      typeOperation,
      montant,
      nouveauSolde: soldeActuel - montant,
    });
  }

  // Pour un retrait, le e-float augmente
  return Result.ok({
    typeOperation,
    montant,
    nouveauSolde: soldeActuel + montant,
  });
}
