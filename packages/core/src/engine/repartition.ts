// B4.4, B4.5, B4.6 — Moteur de répartition
import type {
  ContexteRepartition,
  MouvementCaisseResult,
} from '../domain/types';
import { TypeCaisse } from '../domain/types';

/**
 * Répartit un bénéfice net entre les caisses selon les ratios configurés.
 * Gère le plafond de capital et la transition vers les ratios post-plafond.
 * Utilise la Méthode du Plus Grand Reste (Largest Remainder Method).
 */
export function calculerRepartition(ctx: ContexteRepartition): MouvementCaisseResult[] {
  const { beneficeNet, ratios, ratiosPostPlafond, soldeRemboursement, plafondCapital } = ctx;

  if (beneficeNet <= 0) {
    return [
      { caisse: TypeCaisse.SALAIRE, montant: 0 },
      { caisse: TypeCaisse.REMBOURSEMENT, montant: 0 },
      { caisse: TypeCaisse.RESERVE, montant: 0 },
    ];
  }

  // Cas 1 : plafond déjà atteint → ratios post-plafond uniquement
  if (soldeRemboursement >= plafondCapital) {
    return repartirPostPlafond(beneficeNet, ratiosPostPlafond);
  }

  // Combien peut encore recevoir la caisse remboursement ?
  const capaciteRemboursement = plafondCapital - soldeRemboursement;

  // Part remboursement selon ratio pré-plafond
  const partRemboursementBrute = (beneficeNet * ratios.remboursement) / 100;
  const partRemboursement = Math.min(Math.floor(partRemboursementBrute), capaciteRemboursement);

  // Cas 2 : la transaction charnière (le remboursement n'absorbe pas tout ce que le ratio prévoit)
  if (partRemboursementBrute > capaciteRemboursement) {
    // Transaction charnière : remboursement reçoit juste ce qu'il faut
    const montantRemboursement = capaciteRemboursement;
    const resteApresRemboursement = beneficeNet - montantRemboursement;

    // Le reste est réparti selon les ratios post-plafond
    const mouvementsPostPlafond = repartirPostPlafond(resteApresRemboursement, ratiosPostPlafond);

    return [
      { caisse: TypeCaisse.REMBOURSEMENT, montant: montantRemboursement },
      ...mouvementsPostPlafond,
    ];
  }

  // Cas 3 : répartition normale pré-plafond
  return repartirLRM(beneficeNet, [
    { caisse: TypeCaisse.SALAIRE, ratio: ratios.salaire },
    { caisse: TypeCaisse.REMBOURSEMENT, ratio: ratios.remboursement },
    { caisse: TypeCaisse.RESERVE, ratio: ratios.reserve },
  ]);
}

/**
 * Répartition post-plafond (Salaire + Réserve uniquement)
 */
function repartirPostPlafond(
  montant: number,
  ratios: { salaire: number; reserve: number },
): MouvementCaisseResult[] {
  if (montant <= 0) {
    return [
      { caisse: TypeCaisse.SALAIRE, montant: 0 },
      { caisse: TypeCaisse.RESERVE, montant: 0 },
    ];
  }

  const mouvements = repartirLRM(montant, [
    { caisse: TypeCaisse.SALAIRE, ratio: ratios.salaire },
    { caisse: TypeCaisse.RESERVE, ratio: ratios.reserve },
  ]);

  return mouvements;
}

/**
 * Largest Remainder Method — répartition entière sans perte/gain
 * En cas d'égalité des restes, la Caisse Réserve est prioritaire.
 */
function repartirLRM(
  total: number,
  parts: { caisse: TypeCaisse; ratio: number }[],
): MouvementCaisseResult[] {
  const sommeRatios = parts.reduce((s, p) => s + p.ratio, 0);

  // Calcul des parts brutes et floors
  const calcul = parts.map((p) => {
    const partBrute = (total * p.ratio) / sommeRatios;
    const floor = Math.floor(partBrute);
    const reste = partBrute - floor;
    return { caisse: p.caisse, floor, reste };
  });

  // Somme des floors
  const sommeFloors = calcul.reduce((s, c) => s + c.floor, 0);
  let resteADistribuer = total - sommeFloors;

  // Trier par reste décroissant, avec Réserve en priorité en cas d'égalité
  const priorite: Record<string, number> = {
    [TypeCaisse.RESERVE]: 0,
    [TypeCaisse.REMBOURSEMENT]: 1,
    [TypeCaisse.SALAIRE]: 2,
  };

  const tries = [...calcul].sort((a, b) => {
    if (b.reste !== a.reste) return b.reste - a.reste;
    return (priorite[a.caisse] ?? 99) - (priorite[b.caisse] ?? 99);
  });

  // Distribuer le reste 1 FCFA à la fois
  const resultats = new Map(calcul.map((c) => [c.caisse, c.floor]));
  for (const item of tries) {
    if (resteADistribuer <= 0) break;
    resultats.set(item.caisse, (resultats.get(item.caisse) ?? 0) + 1);
    resteADistribuer--;
  }

  return calcul.map((c) => ({
    caisse: c.caisse,
    montant: resultats.get(c.caisse) ?? 0,
  }));
}
