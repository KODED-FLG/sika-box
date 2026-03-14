// B3.9 à B3.13 — Tests validation vente textile
import { describe, it, expect } from 'vitest';
import { validerVenteTextile } from './vente-textile';
import { CodeErreur } from '../domain/types';

describe('validerVenteTextile()', () => {
  // B3.9 — Vente valide (PV ≥ CA)
  it('B3.9 — PV=15000, CA=10000 → Result.ok avec beneficeNet=5000', () => {
    const result = validerVenteTextile({
      prixDeVente: 15000,
      coutAchat: 10000,
      designation: 'Guipure bleue',
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.beneficeNet).toBe(5000);
      expect(result.value.prixDeVente).toBe(15000);
      expect(result.value.coutAchat).toBe(10000);
      expect(result.value.designation).toBe('Guipure bleue');
    }
  });

  // B3.10 — Vente à perte (PV < CA)
  it('B3.10 — PV=8000, CA=10000 → Result.err VENTE_A_PERTE', () => {
    const result = validerVenteTextile({
      prixDeVente: 8000,
      coutAchat: 10000,
      designation: 'Dallas',
    });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe(CodeErreur.VENTE_A_PERTE);
    }
  });

  // B3.11 — PV = CA (profit = 0, valide)
  it('B3.11 — PV=10000, CA=10000 → Result.ok, beneficeNet=0', () => {
    const result = validerVenteTextile({
      prixDeVente: 10000,
      coutAchat: 10000,
      designation: 'Tissu uni',
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.beneficeNet).toBe(0);
    }
  });

  // B3.12 — Montant ≤ 0
  it('B3.12 — PV=0 → Result.err MONTANT_INVALIDE', () => {
    const result = validerVenteTextile({
      prixDeVente: 0,
      coutAchat: 10000,
      designation: 'Article',
    });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe(CodeErreur.MONTANT_INVALIDE);
    }
  });

  it('B3.12 — CA=-1 → Result.err MONTANT_INVALIDE', () => {
    const result = validerVenteTextile({
      prixDeVente: 15000,
      coutAchat: -1,
      designation: 'Article',
    });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe(CodeErreur.MONTANT_INVALIDE);
    }
  });

  // B3.13 — Montant décimal → MONTANT_INVALIDE
  it('B3.13 — PV=15000.5 → Result.err MONTANT_INVALIDE (FCFA entier)', () => {
    const result = validerVenteTextile({
      prixDeVente: 15000.5,
      coutAchat: 10000,
      designation: 'Article',
    });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe(CodeErreur.MONTANT_INVALIDE);
    }
  });

  it('B3.13 — CA=9999.99 → Result.err MONTANT_INVALIDE', () => {
    const result = validerVenteTextile({
      prixDeVente: 15000,
      coutAchat: 9999.99,
      designation: 'Article',
    });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe(CodeErreur.MONTANT_INVALIDE);
    }
  });
});
