// B4.13 — Agrégation du rapport trimestriel
import { TypeTransaction, TypeCaisse } from '../domain/types';
import type {
  TransactionPourRapport,
  PeriodeRapport,
  RapportTrimestriel,
} from '../domain/types';

export function agregerRapportTrimestriel(
  transactions: TransactionPourRapport[],
  periode: PeriodeRapport,
): RapportTrimestriel {
  const nombreTransactions = {
    total: transactions.length,
    venteTextile: transactions.filter((t) => t.type === TypeTransaction.VENTE_TEXTILE).length,
    momoDepot: transactions.filter((t) => t.type === TypeTransaction.MOMO_DEPOT).length,
    momoRetrait: transactions.filter((t) => t.type === TypeTransaction.MOMO_RETRAIT).length,
    commissionMomo: transactions.filter((t) => t.type === TypeTransaction.COMMISSION_MOMO).length,
  };

  // CA total = PV des ventes textiles + commissions MoMo
  const chiffreAffairesTotal = transactions
    .filter(
      (t) =>
        t.type === TypeTransaction.VENTE_TEXTILE ||
        t.type === TypeTransaction.COMMISSION_MOMO,
    )
    .reduce((sum, t) => sum + t.montant, 0);

  // Bénéfice net total
  const beneficeNetTotal = transactions.reduce((sum, t) => sum + t.beneficeNet, 0);

  // Ventilation cumulée par caisse
  const ventilationCumulee = {
    caisseStock: 0,
    caisseSalaire: 0,
    caisseRemboursement: 0,
    caisseReserve: 0,
  };

  for (const tx of transactions) {
    for (const mv of tx.mouvements) {
      switch (mv.caisse) {
        case TypeCaisse.STOCK:
          ventilationCumulee.caisseStock += mv.montant;
          break;
        case TypeCaisse.SALAIRE:
          ventilationCumulee.caisseSalaire += mv.montant;
          break;
        case TypeCaisse.REMBOURSEMENT:
          ventilationCumulee.caisseRemboursement += mv.montant;
          break;
        case TypeCaisse.RESERVE:
          ventilationCumulee.caisseReserve += mv.montant;
          break;
      }
    }
  }

  const nombreCorrections = transactions.filter((t) => t.corrigee).length;

  return {
    periode,
    nombreTransactions,
    chiffreAffairesTotal,
    beneficeNetTotal,
    ventilationCumulee,
    nombreCorrections,
  };
}
