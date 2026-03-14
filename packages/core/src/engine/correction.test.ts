// B3.18 à B3.20 — Tests fenêtre de correction
import { describe, it, expect } from 'vitest';
import { estFenetreActive } from './correction';
import { genererCorrectionTransaction } from './correction';
import { TypeTransaction, TypeCaisse } from '../domain/types';
import type { TransactionPourCorrection, MouvementCaisseResult } from '../domain/types';

describe('estFenetreActive()', () => {
  // B3.18 — Fenêtre active (< 10 min)
  it('B3.18 — créé il y a 5 min → true', () => {
    const maintenant = new Date();
    const creeLe = new Date(maintenant.getTime() - 5 * 60 * 1000);

    expect(estFenetreActive(creeLe, maintenant)).toBe(true);
  });

  // B3.19 — Fenêtre expirée (≥ 10 min)
  it('B3.19 — créé il y a 11 min → false', () => {
    const maintenant = new Date();
    const creeLe = new Date(maintenant.getTime() - 11 * 60 * 1000);

    expect(estFenetreActive(creeLe, maintenant)).toBe(false);
  });

  it('créé il y a exactement 10 min → false (borne incluse)', () => {
    const maintenant = new Date();
    const creeLe = new Date(maintenant.getTime() - 10 * 60 * 1000);

    expect(estFenetreActive(creeLe, maintenant)).toBe(false);
  });
});

describe('genererCorrectionTransaction()', () => {
  // B3.20 — Correction génère des écritures inverses + nouvelles
  it('B3.20 — vente corrigée : inverse les anciens mouvements et génère les nouveaux', () => {
    const ratios = { salaire: 50, remboursement: 30, reserve: 20 };
    const ratiosPostPlafond = { salaire: 70, reserve: 30 };

    const ancienne: TransactionPourCorrection = {
      type: TypeTransaction.VENTE_TEXTILE,
      prixDeVente: 15000,
      coutAchat: 10000,
      designation: 'Guipure',
      montant: 15000,
      beneficeNet: 5000,
      mouvements: [
        { caisse: TypeCaisse.STOCK, montant: 10000 },
        { caisse: TypeCaisse.SALAIRE, montant: 2500 },
        { caisse: TypeCaisse.REMBOURSEMENT, montant: 1500 },
        { caisse: TypeCaisse.RESERVE, montant: 1000 },
      ],
    };

    const nouvelle: TransactionPourCorrection = {
      type: TypeTransaction.VENTE_TEXTILE,
      prixDeVente: 12000,
      coutAchat: 7000,
      designation: 'Guipure',
      montant: 12000,
      beneficeNet: 5000,
      mouvements: [], // sera calculé
    };

    const result = genererCorrectionTransaction(ancienne, nouvelle, {
      ratios,
      ratiosPostPlafond,
      soldeRemboursement: 0,
      plafondCapital: 500000,
    });

    // Les mouvements inverses annulent les anciens
    const inverses = result.filter((m) => m.montant < 0);
    const nouveaux = result.filter((m) => m.montant > 0);

    // Somme des inverses = -somme des anciens
    const sommeInverses = inverses.reduce((s, m) => s + m.montant, 0);
    expect(sommeInverses).toBe(-15000); // -(CA+bénéfice) = -(10000+5000)

    // Somme des nouveaux mouvements = nouvelle PV
    const sommeNouveaux = nouveaux.reduce((s, m) => s + m.montant, 0);
    expect(sommeNouveaux).toBe(12000); // nouveau CA + nouveau bénéfice = 7000+5000

    // Résultat net = 12000 - 15000 = -3000
    const sommeTotal = result.reduce((s, m) => s + m.montant, 0);
    expect(sommeTotal).toBe(-3000);
  });
});
