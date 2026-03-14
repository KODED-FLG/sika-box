import { EmptyState } from '@/components/common/EmptyState';
import { Shield } from 'lucide-react';

export function PageAudit() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Journal d&apos;audit</h2>
      <EmptyState icon={<Shield className="h-12 w-12" />} message="Aucune entrée d'audit pour le moment" />
    </div>
  );
}
