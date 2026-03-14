import { EmptyState } from '@/components/common/EmptyState';
import { Smartphone } from 'lucide-react';

export function PageOperateursMomo() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h2 className="text-2xl font-bold">Configuration des opérateurs MoMo</h2>
      <EmptyState icon={<Smartphone className="h-12 w-12" />} message="Les opérateurs seront chargés depuis l'API" />
    </div>
  );
}
