import { MontantFCFA } from './MontantFCFA';
import { cn } from '@/lib/utils';

interface AperçuBeneficeNetProps {
  prixVente: number;
  coutAchat: number;
}

export function AperçuBeneficeNet({ prixVente, coutAchat }: AperçuBeneficeNetProps) {
  if (prixVente === 0 && coutAchat === 0) return null;

  const benefice = prixVente - coutAchat;
  const isVenteAPerte = prixVente < coutAchat;

  return (
    <div
      data-testid="apercu-benefice"
      className={cn('mt-2 text-sm font-medium', isVenteAPerte ? 'text-destructive' : 'text-green-600')}
    >
      {isVenteAPerte ? (
        <span>Vente à perte</span>
      ) : (
        <span>
          Bénéfice Net : <MontantFCFA value={benefice} />
        </span>
      )}
    </div>
  );
}
