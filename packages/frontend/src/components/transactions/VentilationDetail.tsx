import { MontantFCFA } from '@/components/common/MontantFCFA';
import { cn } from '@/lib/utils';

interface Mouvement {
  caisse: string;
  montant: number;
}

interface VentilationDetailProps {
  mouvements: Mouvement[];
}

const LABELS: Record<string, string> = {
  STOCK: 'Stock',
  SALAIRE: 'Salaire',
  REMBOURSEMENT: 'Remboursement',
  RESERVE: 'Réserve',
};

const COULEURS: Record<string, string> = {
  STOCK: 'bg-stock',
  SALAIRE: 'bg-salaire',
  REMBOURSEMENT: 'bg-remboursement',
  RESERVE: 'bg-reserve',
};

export function VentilationDetail({ mouvements }: VentilationDetailProps) {
  return (
    <div className="space-y-1" data-testid="ventilation-detail">
      {mouvements.map((m) => (
        <div key={m.caisse} className="flex items-center gap-2 text-sm">
          <div className={cn('h-3 w-3 rounded-full', COULEURS[m.caisse] ?? 'bg-muted')} />
          <span className="flex-1">{LABELS[m.caisse] ?? m.caisse}</span>
          <MontantFCFA value={m.montant} className="font-medium" />
        </div>
      ))}
    </div>
  );
}
