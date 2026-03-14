import { FormulaireVenteTextile } from '@/components/forms/FormulaireVenteTextile';
import { toast } from '@/hooks/use-toast';

export function PageVente() {
  const handleSubmit = (data: { pv: number; ca: number; designation: string }) => {
    // API integration in Sprint 5
    console.log('Vente textile:', data);
    toast({ title: 'Vente enregistrée', variant: 'success' });
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h2 className="text-2xl font-bold">Vente Textile</h2>
      <FormulaireVenteTextile onSubmit={handleSubmit} />
    </div>
  );
}
