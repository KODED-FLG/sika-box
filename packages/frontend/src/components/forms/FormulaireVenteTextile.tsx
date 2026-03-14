import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AperçuBeneficeNet } from '@/components/common/AperçuBeneficeNet';

const schema = z.object({
  designation: z.string().min(1, 'Désignation requise'),
  prix_vente: z.number({ invalid_type_error: 'Nombre requis' }).int('Entier requis').positive('Doit être positif'),
  cout_achat: z.number({ invalid_type_error: 'Nombre requis' }).int('Entier requis').positive('Doit être positif'),
}).refine((data) => data.prix_vente >= data.cout_achat, {
  message: 'Vente à perte',
  path: ['prix_vente'],
});

type FormValues = z.infer<typeof schema>;

interface FormulaireVenteTextileProps {
  onSubmit: (data: { pv: number; ca: number; designation: string }) => void;
  isSubmitting?: boolean;
}

export function FormulaireVenteTextile({ onSubmit, isSubmitting }: FormulaireVenteTextileProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { designation: '', prix_vente: undefined as unknown as number, cout_achat: undefined as unknown as number },
  });

  const pv = watch('prix_vente') || 0;
  const ca = watch('cout_achat') || 0;

  const handleFormSubmit = (data: FormValues) => {
    onSubmit({ pv: data.prix_vente, ca: data.cout_achat, designation: data.designation });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" data-testid="form-vente-textile">
      <div className="space-y-2">
        <Label htmlFor="designation">Désignation</Label>
        <Input id="designation" placeholder="Ex: Bazin 3m" {...register('designation')} />
        {errors.designation && <p className="text-sm text-destructive">{errors.designation.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="prix_vente">Prix de Vente (PV)</Label>
        <Input
          id="prix_vente"
          type="number"
          inputMode="numeric"
          placeholder="0"
          {...register('prix_vente', { valueAsNumber: true })}
        />
        {errors.prix_vente && <p className="text-sm text-destructive">{errors.prix_vente.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cout_achat">Coût d&apos;Achat (CA)</Label>
        <Input
          id="cout_achat"
          type="number"
          inputMode="numeric"
          placeholder="0"
          {...register('cout_achat', { valueAsNumber: true })}
        />
        {errors.cout_achat && <p className="text-sm text-destructive">{errors.cout_achat.message}</p>}
      </div>

      <AperçuBeneficeNet prixVente={pv} coutAchat={ca} />

      <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
        {isSubmitting ? 'Enregistrement...' : 'Enregistrer la vente'}
      </Button>
    </form>
  );
}
