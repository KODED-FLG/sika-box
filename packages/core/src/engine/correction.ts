// B4.11, B4.12 — Fenêtre de correction et génération de correction
import { DUREE_FENETRE_CORRECTION_MS } from '../domain/constants';
import { calculerRepartition } from './repartition';
import { TypeCaisse } from '../domain/types';
import type {
  TransactionPourCorrection,
  MouvementCaisseResult,
  Ratios,
  RatiosPostPlafond,
} from '../domain/types';

/**
 * Vérifie si la fenêtre de correction est encore active.
 * Retourne true si la transaction a été créée il y a moins de 10 minutes.
 */
export function estFenetreActive(creeLe: Date, maintenant: Date = new Date()): boolean {
  const elapsed = maintenant.getTime() - creeLe.getTime();
  return elapsed < DUREE_FENETRE_CORRECTION_MS;
}

interface ContexteCorrection {
  ratios: Ratios;
  ratiosPostPlafond: RatiosPostPlafond;
  soldeRemboursement: number;
  plafondCapital: number;
}

/**
 * Génère les mouvements de correction :
 * 1. Écritures inverses (annulation des anciens mouvements)
 * 2. Nouveaux mouvements basés sur les valeurs corrigées
 */
export function genererCorrectionTransaction(
  ancienne: TransactionPourCorrection,
  nouvelle: TransactionPourCorrection,
  contexte: ContexteCorrection,
): MouvementCaisseResult[] {
  // 1. Inverser tous les anciens mouvements
  const inverses: MouvementCaisseResult[] = ancienne.mouvements.map((m) => ({
    caisse: m.caisse,
    montant: -m.montant,
    operateurMomoId: m.operateurMomoId,
  }));

  // 2. Calculer les nouveaux mouvements
  let nouveauxMouvements: MouvementCaisseResult[] = [];

  if (nouvelle.type === 'VENTE_TEXTILE') {
    const coutAchat = nouvelle.coutAchat ?? 0;
    const beneficeNet = nouvelle.beneficeNet;

    // Mouvement stock (coût d'achat)
    nouveauxMouvements.push({
      caisse: TypeCaisse.STOCK,
      montant: coutAchat,
    });

    // Répartition du bénéfice
    if (beneficeNet > 0) {
      const repartition = calculerRepartition({
        beneficeNet,
        ratios: contexte.ratios,
        ratiosPostPlafond: contexte.ratiosPostPlafond,
        soldeRemboursement: contexte.soldeRemboursement,
        plafondCapital: contexte.plafondCapital,
      });
      nouveauxMouvements = [...nouveauxMouvements, ...repartition];
    }
  }

  return [...inverses, ...nouveauxMouvements];
}
