// B4.10 — Validation des ratios
import { Result } from '../result';
import type {
  Ratios,
  RatiosPostPlafond,
  ErreurValidation,
} from '../domain/types';
import { CodeErreur } from '../domain/types';

export function validerRatios(
  ratios: Ratios,
): Result<Ratios, ErreurValidation> {
  const { salaire, remboursement, reserve } = ratios;

  if (salaire < 0 || remboursement < 0 || reserve < 0) {
    return Result.err({
      code: CodeErreur.RATIOS_INVALIDES,
      message: 'Les ratios ne peuvent pas être négatifs.',
    });
  }

  if (salaire + remboursement + reserve !== 100) {
    return Result.err({
      code: CodeErreur.RATIOS_INVALIDES,
      message: `La somme des ratios doit être 100% (actuellement ${salaire + remboursement + reserve}%).`,
    });
  }

  return Result.ok(ratios);
}

export function validerRatiosPostPlafond(
  ratios: RatiosPostPlafond,
): Result<RatiosPostPlafond, ErreurValidation> {
  const { salaire, reserve } = ratios;

  if (salaire < 0 || reserve < 0) {
    return Result.err({
      code: CodeErreur.RATIOS_INVALIDES,
      message: 'Les ratios ne peuvent pas être négatifs.',
    });
  }

  if (salaire + reserve !== 100) {
    return Result.err({
      code: CodeErreur.RATIOS_INVALIDES,
      message: `La somme des ratios post-plafond doit être 100% (actuellement ${salaire + reserve}%).`,
    });
  }

  return Result.ok(ratios);
}
