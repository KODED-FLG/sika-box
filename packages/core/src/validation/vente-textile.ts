// B4.7 — Validation vente textile
import { Result } from '../result';
import type {
  VenteTextileInput,
  VenteTextileValidee,
  ErreurValidation,
} from '../domain/types';
import { CodeErreur } from '../domain/types';

export function validerVenteTextile(
  input: VenteTextileInput,
): Result<VenteTextileValidee, ErreurValidation> {
  const { prixDeVente, coutAchat, designation } = input;

  // Vérifier que les montants sont des entiers positifs (FCFA)
  if (
    !Number.isInteger(prixDeVente) ||
    !Number.isInteger(coutAchat) ||
    prixDeVente <= 0 ||
    coutAchat <= 0
  ) {
    return Result.err({
      code: CodeErreur.MONTANT_INVALIDE,
      message: 'Les montants doivent être des entiers positifs en FCFA.',
    });
  }

  // Vérifier que PV ≥ CA (pas de vente à perte)
  if (prixDeVente < coutAchat) {
    return Result.err({
      code: CodeErreur.VENTE_A_PERTE,
      message: `Le prix de vente (${prixDeVente}) est inférieur au coût d'achat (${coutAchat}).`,
    });
  }

  const beneficeNet = prixDeVente - coutAchat;

  return Result.ok({
    prixDeVente,
    coutAchat,
    designation,
    beneficeNet,
  });
}
