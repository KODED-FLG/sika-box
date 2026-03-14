// B3.21 à B3.23 — Tests validation des ratios
import { describe, it, expect } from 'vitest';
import { validerRatios, validerRatiosPostPlafond } from './ratios';
import { CodeErreur } from '../domain/types';

describe('validerRatios()', () => {
  // B3.21 — Ratios valides (somme = 100%)
  it('B3.21 — salaire=50, remboursement=30, reserve=20 → ok', () => {
    const result = validerRatios({ salaire: 50, remboursement: 30, reserve: 20 });
    expect(result.isOk()).toBe(true);
  });

  // B3.22 — Ratios invalides (somme ≠ 100%)
  it('B3.22 — salaire=50, remboursement=30, reserve=25 → err RATIOS_INVALIDES', () => {
    const result = validerRatios({ salaire: 50, remboursement: 30, reserve: 25 });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe(CodeErreur.RATIOS_INVALIDES);
    }
  });

  it('ratios négatifs → err RATIOS_INVALIDES', () => {
    const result = validerRatios({ salaire: -10, remboursement: 80, reserve: 30 });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe(CodeErreur.RATIOS_INVALIDES);
    }
  });
});

describe('validerRatiosPostPlafond()', () => {
  // B3.23 — Post-plafond valides (somme = 100%)
  it('B3.23 — salaire=70, reserve=30 → ok', () => {
    const result = validerRatiosPostPlafond({ salaire: 70, reserve: 30 });
    expect(result.isOk()).toBe(true);
  });

  it('salaire=60, reserve=30 → err RATIOS_INVALIDES', () => {
    const result = validerRatiosPostPlafond({ salaire: 60, reserve: 30 });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe(CodeErreur.RATIOS_INVALIDES);
    }
  });
});
