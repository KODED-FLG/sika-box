import { Badge } from '@/components/ui/badge';
import { MontantFCFA } from '@/components/common/MontantFCFA';
import { ShoppingBag, Smartphone, ArrowDownCircle, ArrowUpCircle, Clock, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionRowProps {
  type: string;
  designation?: string;
  montant: number;
  date: string;
  corrigee?: boolean;
  fenetreActive?: boolean;
  onClick?: () => void;
}

const ICONS: Record<string, React.ReactNode> = {
  VENTE_TEXTILE: <ShoppingBag className="h-4 w-4 text-green-600" />,
  DEPOT_MOMO: <ArrowDownCircle className="h-4 w-4 text-blue-600" />,
  RETRAIT_MOMO: <ArrowUpCircle className="h-4 w-4 text-red-600" />,
  COMMISSION_MOMO: <Smartphone className="h-4 w-4 text-momo" />,
};

const LABELS: Record<string, string> = {
  VENTE_TEXTILE: 'Vente textile',
  DEPOT_MOMO: 'Dépôt MoMo',
  RETRAIT_MOMO: 'Retrait MoMo',
  COMMISSION_MOMO: 'Commission MoMo',
};

export function TransactionRow({
  type,
  designation,
  montant,
  date,
  corrigee,
  fenetreActive,
  onClick,
}: TransactionRowProps) {
  const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 transition-colors',
        onClick && 'cursor-pointer hover:bg-accent',
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      data-testid="transaction-row"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
        {ICONS[type] ?? <ShoppingBag className="h-4 w-4" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{LABELS[type] ?? type}</span>
          {corrigee && (
            <Badge variant="secondary" className="text-xs">
              <RotateCcw className="mr-1 h-3 w-3" />
              Corrigée
            </Badge>
          )}
          {fenetreActive && (
            <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
              <Clock className="mr-1 h-3 w-3" />
              Modifiable
            </Badge>
          )}
        </div>
        {designation && <p className="text-xs text-muted-foreground truncate">{designation}</p>}
      </div>

      <div className="text-right shrink-0">
        <MontantFCFA value={montant} className="text-sm font-semibold" />
        <p className="text-xs text-muted-foreground">{formattedDate}</p>
      </div>
    </div>
  );
}
