import { FormulaireCreationGestionnaire } from '@/components/admin/FormulaireCreationGestionnaire';
import { EmptyState } from '@/components/common/EmptyState';
import { Users } from 'lucide-react';

export function PageGestionnaires() {
  const handleCreate = (data: { identifiant: string; mot_de_passe_temporaire: string }) => {
    console.log('Créer gestionnaire:', data);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h2 className="text-2xl font-bold">Gestion des gestionnaires</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Créer un gestionnaire</h3>
        <FormulaireCreationGestionnaire onSubmit={handleCreate} />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Gestionnaires existants</h3>
        <EmptyState icon={<Users className="h-12 w-12" />} message="Aucun gestionnaire pour le moment" />
      </div>
    </div>
  );
}
