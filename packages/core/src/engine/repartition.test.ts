// B3.3 à B3.8 — Tests du moteur de répartition
import { describe, it, expect } from 'vitest';
import { calculerRepartition } from './repartition';
import { TypeCaisse } from '../domain/types';
import type { ContexteRepartition, MouvementCaisseResult } from '../domain/types';

function getMontant(mouvements: MouvementCaisseResult[], caisse: string): number {
  return mouvements.find((m) => m.caisse === caisse)?.montant ?? 0;
}

function totalMouvements(mouvements: MouvementCaisseResult[]): number {
  return mouvements.reduce((sum, m) => sum + m.montant, 0);
}

describe('calculerRepartition()', () => {
  const ratiosDefaut = { salaire: 50, remboursement: 30, reserve: 20 };
  const ratiosPostPlafond = { salaire: 70, reserve: 30 };

  // B3.3 — Répartition nominale (50/30/20)
  it('B3.3 — profit=5000, ratios 50/30/20 → Salaire=2500, Remboursement=1500, Reserve=1000', () => {
    const ctx: ContexteRepartition = {
      beneficeNet: 5000,
      ratios: ratiosDefaut,
      ratiosPostPlafond,
      soldeRemboursement: 0,
      plafondCapital: 500000,
    };

    const mouvements = calculerRepartition(ctx);

    expect(getMontant(mouvements, TypeCaisse.SALAIRE)).toBe(2500);
    expect(getMontant(mouvements, TypeCaisse.REMBOURSEMENT)).toBe(1500);
    expect(getMontant(mouvements, TypeCaisse.RESERVE)).toBe(1000);
    expect(totalMouvements(mouvements)).toBe(5000);
  });

  // B3.4 — Profit = 0
  it('B3.4 — profit=0 → tous les mouvements de répartition = 0', () => {
    const ctx: ContexteRepartition = {
      beneficeNet: 0,
      ratios: ratiosDefaut,
      ratiosPostPlafond,
      soldeRemboursement: 0,
      plafondCapital: 500000,
    };

    const mouvements = calculerRepartition(ctx);

    expect(getMontant(mouvements, TypeCaisse.SALAIRE)).toBe(0);
    expect(getMontant(mouvements, TypeCaisse.REMBOURSEMENT)).toBe(0);
    expect(getMontant(mouvements, TypeCaisse.RESERVE)).toBe(0);
  });

  // B3.5 — Plafond atteint → ratios post-plafond (70/30)
  it('B3.5 — plafond atteint, profit=5000 → Salaire=3500, Reserve=1500, Remboursement=0', () => {
    const ctx: ContexteRepartition = {
      beneficeNet: 5000,
      ratios: ratiosDefaut,
      ratiosPostPlafond,
      soldeRemboursement: 500000,
      plafondCapital: 500000,
    };

    const mouvements = calculerRepartition(ctx);

    expect(getMontant(mouvements, TypeCaisse.SALAIRE)).toBe(3500);
    expect(getMontant(mouvements, TypeCaisse.RESERVE)).toBe(1500);
    expect(getMontant(mouvements, TypeCaisse.REMBOURSEMENT)).toBe(0);
    expect(totalMouvements(mouvements)).toBe(5000);
  });

  // B3.6 — Plafond partiellement atteint (transaction charnière)
  it('B3.6 — solde=499000, plafond=500000, profit=5000 → Remb=1000, reste 4000 en post-plafond', () => {
    const ctx: ContexteRepartition = {
      beneficeNet: 5000,
      ratios: ratiosDefaut,
      ratiosPostPlafond,
      soldeRemboursement: 499000,
      plafondCapital: 500000,
    };

    const mouvements = calculerRepartition(ctx);

    // Remboursement reçoit juste ce qu'il faut : 1000
    expect(getMontant(mouvements, TypeCaisse.REMBOURSEMENT)).toBe(1000);

    // Reste 4000 réparti en 70/30
    expect(getMontant(mouvements, TypeCaisse.SALAIRE)).toBe(2800);
    expect(getMontant(mouvements, TypeCaisse.RESERVE)).toBe(1200);

    expect(totalMouvements(mouvements)).toBe(5000);
  });

  // B3.7 — Montant non divisible (arrondi)
  it('B3.7 — profit=1, ratios 50/30/20 → somme = 1 (pas de perte)', () => {
    const ctx: ContexteRepartition = {
      beneficeNet: 1,
      ratios: ratiosDefaut,
      ratiosPostPlafond,
      soldeRemboursement: 0,
      plafondCapital: 500000,
    };

    const mouvements = calculerRepartition(ctx);

    expect(totalMouvements(mouvements)).toBe(1);
  });

  // B3.8 — Arrondi critique (Largest Remainder Method)
  it('B3.8 — profit=3, ratios 50/30/20 → Salaire=1, Remboursement=1, Reserve=1 (LRM)', () => {
    // floor(3×50%)=1 (reste 0.5), floor(3×30%)=0 (reste 0.9), floor(3×20%)=0 (reste 0.6)
    // somme floors=1, reste=2
    // +1 à Remboursement (reste 0.9), +1 à Reserve (reste 0.6)
    // Résultat: Salaire=1, Remboursement=1, Reserve=1
    const ctx: ContexteRepartition = {
      beneficeNet: 3,
      ratios: ratiosDefaut,
      ratiosPostPlafond,
      soldeRemboursement: 0,
      plafondCapital: 500000,
    };

    const mouvements = calculerRepartition(ctx);

    expect(getMontant(mouvements, TypeCaisse.SALAIRE)).toBe(1);
    expect(getMontant(mouvements, TypeCaisse.REMBOURSEMENT)).toBe(1);
    expect(getMontant(mouvements, TypeCaisse.RESERVE)).toBe(1);
    expect(totalMouvements(mouvements)).toBe(3);
  });
});
