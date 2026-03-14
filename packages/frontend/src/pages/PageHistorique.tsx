import { EmptyState } from '@/components/common/EmptyState';
import { History } from 'lucide-react';

export function PageHistorique() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Historique des transactions</h2>
      <EmptyState
        icon={<History className="h-12 w-12" />}
        message="Aucune transaction pour le moment"
      />
    </div>
  );
}
