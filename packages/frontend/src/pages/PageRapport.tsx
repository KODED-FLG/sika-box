import { EmptyState } from '@/components/common/EmptyState';
import { FileText } from 'lucide-react';

export function PageRapport() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Rapport Trimestriel</h2>
      <EmptyState icon={<FileText className="h-12 w-12" />} message="Aucun rapport disponible" />
    </div>
  );
}
