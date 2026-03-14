// B4.9 — Validation commission MoMo
import { Result } from '../result';
import type {
  CommissionMomoInput,
  CommissionMomoValidee,
  ErreurValidation,
} from '../domain/types';
import { CodeErreur } from '../domain/types';

export function validerCommissionMomo(
  input: CommissionMomoInput,
): Result<CommissionMomoValidee, ErreurValidation> {
  const { montant } = input;

  if (!Number.isInteger(montant) || montant <= 0) {
    return Result.err({
      code: CodeErreur.MONTANT_INVALIDE,
      message: 'Le montant de commission doit être un entier positif en FCFA.',
    });
  }

  return Result.ok({ montant });
}
