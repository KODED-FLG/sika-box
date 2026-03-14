import { FormulaireOperationMomo } from '@/components/forms/FormulaireOperationMomo';
import { FormulaireCommissionMomo } from '@/components/forms/FormulaireCommissionMomo';
import { toast } from '@/hooks/use-toast';

const MOCK_OPERATEURS = [
  { id: '1', nom: 'MTN Mobile Money', solde_fonds: 0 },
  { id: '2', nom: 'Moov Money', solde_fonds: 0 },
  { id: '3', nom: 'Celtis Cash', solde_fonds: 0 },
];

export function PageMomo() {
  const handleOperationSubmit = (data: { operateur_id: string; type: string; montant: number }) => {
    console.log('Opération MoMo:', data);
    toast({ title: 'Opération enregistrée', variant: 'success' });
  };

  const handleCommissionSubmit = (data: { operateur_id: string; montant: number }) => {
    console.log('Commission MoMo:', data);
    toast({ title: 'Commission enregistrée', variant: 'success' });
  };

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Opération MoMo</h2>
        <FormulaireOperationMomo operateurs={MOCK_OPERATEURS} onSubmit={handleOperationSubmit} />
      </div>

      <div className="border-t pt-6 space-y-4">
        <h2 className="text-xl font-bold">Commission MoMo</h2>
        <FormulaireCommissionMomo operateurs={MOCK_OPERATEURS} onSubmit={handleCommissionSubmit} />
      </div>
    </div>
  );
}
