// B3.14 à B3.17 — Tests opérations MoMo
import { describe, it, expect } from 'vitest';
import { validerOperationMomo } from './operation-momo';
import { validerCommissionMomo } from './commission-momo';
import { CodeErreur } from '../domain/types';

describe('validerOperationMomo()', () => {
  // B3.14 — Dépôt valide (fonds suffisants)
  it('B3.14 — solde=200000, dépôt=50000 → ok, nouveauSolde=150000', () => {
    const result = validerOperationMomo({
      typeOperation: 'DEPOT',
      montant: 50000,
      soldeActuel: 200000,
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.nouveauSolde).toBe(150000);
    }
  });

  // B3.15 — Dépôt fonds insuffisants
  it('B3.15 — solde=30000, dépôt=50000 → err FONDS_INSUFFISANT', () => {
    const result = validerOperationMomo({
      typeOperation: 'DEPOT',
      montant: 50000,
      soldeActuel: 30000,
    });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe(CodeErreur.FONDS_INSUFFISANT);
    }
  });

  // B3.16 — Retrait (augmente le e-float)
  it('B3.16 — solde=200000, retrait=50000 → ok, nouveauSolde=250000', () => {
    const result = validerOperationMomo({
      typeOperation: 'RETRAIT',
      montant: 50000,
      soldeActuel: 200000,
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.nouveauSolde).toBe(250000);
    }
  });
});

describe('validerCommissionMomo()', () => {
  // B3.17 — Commission → distribué comme un profit
  it('B3.17 — commission=5000 → ok, montant=5000', () => {
    const result = validerCommissionMomo({ montant: 5000 });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.montant).toBe(5000);
    }
  });

  it('commission=0 → err MONTANT_INVALIDE', () => {
    const result = validerCommissionMomo({ montant: 0 });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe(CodeErreur.MONTANT_INVALIDE);
    }
  });

  it('commission décimale → err MONTANT_INVALIDE', () => {
    const result = validerCommissionMomo({ montant: 5000.5 });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe(CodeErreur.MONTANT_INVALIDE);
    }
  });
});
