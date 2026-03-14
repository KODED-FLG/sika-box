import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MontantFCFA } from '@/components/common/MontantFCFA';
import { Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaisseCardProps {
  type: string;
  solde: number;
  statut?: string;
}

const CONFIG: Record<string, { label: string; bgClass: string; textClass: string }> = {
  STOCK: { label: 'Caisse Stock', bgClass: 'border-l-4 border-l-stock', textClass: 'text-stock' },
  SALAIRE: { label: 'Caisse Salaire', bgClass: 'border-l-4 border-l-salaire', textClass: 'text-salaire' },
  REMBOURSEMENT: { label: 'Caisse Remboursement', bgClass: 'border-l-4 border-l-remboursement', textClass: 'text-remboursement' },
  RESERVE: { label: 'Caisse Réserve', bgClass: 'border-l-4 border-l-reserve', textClass: 'text-reserve' },
};

export function CaisseCard({ type, solde, statut }: CaisseCardProps) {
  const config = CONFIG[type] ?? { label: type, bgClass: '', textClass: '' };
  const isBloque = statut === 'BLOQUE';

  return (
    <Card className={cn(config.bgClass)} data-testid={`caisse-${type.toLowerCase()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn('text-sm font-medium', config.textClass)}>{config.label}</CardTitle>
        {isBloque ? (
          <Lock className="h-4 w-4 text-muted-foreground" aria-label="Bloqué" />
        ) : (
          <Unlock className="h-4 w-4 text-muted-foreground" aria-label="Débloqué" />
        )}
      </CardHeader>
      <CardContent>
        <MontantFCFA value={solde} className="text-2xl font-bold" />
        {statut && (
          <Badge variant={isBloque ? 'destructive' : 'secondary'} className="mt-2">
            {statut}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
