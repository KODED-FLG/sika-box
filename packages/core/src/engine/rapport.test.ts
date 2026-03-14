// B3.24 à B3.25 — Tests rapport trimestriel
import { describe, it, expect } from 'vitest';
import { agregerRapportTrimestriel } from './rapport';
import { TypeTransaction, TypeCaisse } from '../domain/types';
import type { TransactionPourRapport, PeriodeRapport } from '../domain/types';

describe('agregerRapportTrimestriel()', () => {
  const periode: PeriodeRapport = {
    annee: 2026,
    trimestre: 1,
    dateDebut: '2026-01-01',
    dateFin: '2026-03-31',
  };

  // B3.24 — 0 transactions
  it('B3.24 — 0 transactions → total=0, tous montants=0', () => {
    const rapport = agregerRapportTrimestriel([], periode);

    expect(rapport.nombreTransactions.total).toBe(0);
    expect(rapport.nombreTransactions.venteTextile).toBe(0);
    expect(rapport.nombreTransactions.momoDepot).toBe(0);
    expect(rapport.nombreTransactions.momoRetrait).toBe(0);
    expect(rapport.nombreTransactions.commissionMomo).toBe(0);
    expect(rapport.chiffreAffairesTotal).toBe(0);
    expect(rapport.beneficeNetTotal).toBe(0);
    expect(rapport.ventilationCumulee.caisseStock).toBe(0);
    expect(rapport.ventilationCumulee.caisseSalaire).toBe(0);
    expect(rapport.ventilationCumulee.caisseRemboursement).toBe(0);
    expect(rapport.ventilationCumulee.caisseReserve).toBe(0);
    expect(rapport.nombreCorrections).toBe(0);
  });

  // B3.25 — Données mixtes
  it('B3.25 — 3 ventes + 2 dépôts + 1 commission → agrégation correcte par type', () => {
    const transactions: TransactionPourRapport[] = [
      // Vente 1: PV=15000, CA=10000, bénéfice=5000
      {
        type: TypeTransaction.VENTE_TEXTILE,
        montant: 15000,
        coutAchat: 10000,
        beneficeNet: 5000,
        corrigee: false,
        mouvements: [
          { caisse: TypeCaisse.STOCK, montant: 10000 },
          { caisse: TypeCaisse.SALAIRE, montant: 2500 },
          { caisse: TypeCaisse.REMBOURSEMENT, montant: 1500 },
          { caisse: TypeCaisse.RESERVE, montant: 1000 },
        ],
      },
      // Vente 2: PV=20000, CA=12000, bénéfice=8000
      {
        type: TypeTransaction.VENTE_TEXTILE,
        montant: 20000,
        coutAchat: 12000,
        beneficeNet: 8000,
        corrigee: false,
        mouvements: [
          { caisse: TypeCaisse.STOCK, montant: 12000 },
          { caisse: TypeCaisse.SALAIRE, montant: 4000 },
          { caisse: TypeCaisse.REMBOURSEMENT, montant: 2400 },
          { caisse: TypeCaisse.RESERVE, montant: 1600 },
        ],
      },
      // Vente 3 (corrigée): PV=10000, CA=8000, bénéfice=2000
      {
        type: TypeTransaction.VENTE_TEXTILE,
        montant: 10000,
        coutAchat: 8000,
        beneficeNet: 2000,
        corrigee: true,
        mouvements: [
          { caisse: TypeCaisse.STOCK, montant: 8000 },
          { caisse: TypeCaisse.SALAIRE, montant: 1000 },
          { caisse: TypeCaisse.REMBOURSEMENT, montant: 600 },
          { caisse: TypeCaisse.RESERVE, montant: 400 },
        ],
      },
      // Dépôt MoMo 1: 50000
      {
        type: TypeTransaction.MOMO_DEPOT,
        montant: 50000,
        beneficeNet: 0,
        corrigee: false,
        mouvements: [],
      },
      // Dépôt MoMo 2: 30000
      {
        type: TypeTransaction.MOMO_DEPOT,
        montant: 30000,
        beneficeNet: 0,
        corrigee: false,
        mouvements: [],
      },
      // Commission MoMo: 3000
      {
        type: TypeTransaction.COMMISSION_MOMO,
        montant: 3000,
        beneficeNet: 3000,
        corrigee: false,
        mouvements: [
          { caisse: TypeCaisse.SALAIRE, montant: 1500 },
          { caisse: TypeCaisse.REMBOURSEMENT, montant: 900 },
          { caisse: TypeCaisse.RESERVE, montant: 600 },
        ],
      },
    ];

    const rapport = agregerRapportTrimestriel(transactions, periode);

    // Nombre de transactions
    expect(rapport.nombreTransactions.total).toBe(6);
    expect(rapport.nombreTransactions.venteTextile).toBe(3);
    expect(rapport.nombreTransactions.momoDepot).toBe(2);
    expect(rapport.nombreTransactions.momoRetrait).toBe(0);
    expect(rapport.nombreTransactions.commissionMomo).toBe(1);

    // CA total = PV des ventes textiles + commissions = 15000+20000+10000+3000 = 48000
    expect(rapport.chiffreAffairesTotal).toBe(48000);

    // Bénéfice net total = 5000+8000+2000+0+0+3000 = 18000
    expect(rapport.beneficeNetTotal).toBe(18000);

    // Ventilation par caisse
    expect(rapport.ventilationCumulee.caisseStock).toBe(30000); // 10000+12000+8000
    expect(rapport.ventilationCumulee.caisseSalaire).toBe(9000); // 2500+4000+1000+1500
    expect(rapport.ventilationCumulee.caisseRemboursement).toBe(5400); // 1500+2400+600+900
    expect(rapport.ventilationCumulee.caisseReserve).toBe(3600); // 1000+1600+400+600

    // Corrections
    expect(rapport.nombreCorrections).toBe(1);

    // Période
    expect(rapport.periode.annee).toBe(2026);
    expect(rapport.periode.trimestre).toBe(1);
  });
});
