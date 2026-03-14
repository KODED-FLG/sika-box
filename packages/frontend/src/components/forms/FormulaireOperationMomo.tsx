import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  operateur_id: z.string().min(1, 'Opérateur requis'),
  type: z.enum(['DEPOT_MOMO', 'RETRAIT_MOMO']),
  montant: z.number({ invalid_type_error: 'Nombre requis' }).int('Entier requis').positive('Doit être positif'),
});

type FormValues = z.infer<typeof schema>;

interface Operateur {
  id: string;
  nom: string;
  solde_fonds: number;
}

interface FormulaireOperationMomoProps {
  operateurs: Operateur[];
  onSubmit: (data: { operateur_id: string; type: 'DEPOT_MOMO' | 'RETRAIT_MOMO'; montant: number }) => void;
  isSubmitting?: boolean;
}

export function FormulaireOperationMomo({ operateurs, onSubmit, isSubmitting }: FormulaireOperationMomoProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { operateur_id: '', type: 'DEPOT_MOMO', montant: undefined as unknown as number },
  });

  const selectedOperateurId = watch('operateur_id');
  const selectedType = watch('type');
  const montant = watch('montant') || 0;
  const selectedOperateur = operateurs.find((op) => op.id === selectedOperateurId);
  const fondsSuffisants = selectedType !== 'DEPOT_MOMO' || !selectedOperateur || montant <= selectedOperateur.solde_fonds;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="form-operation-momo">
      <div className="space-y-2">
        <Label>Opérateur</Label>
        <Controller
          control={control}
          name="operateur_id"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un opérateur" />
              </SelectTrigger>
              <SelectContent>
                {operateurs.map((op) => (
                  <SelectItem key={op.id} value={op.id}>
                    {op.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.operateur_id && <p className="text-sm text-destructive">{errors.operateur_id.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Type d&apos;opération</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" value="DEPOT_MOMO" {...register('type')} />
            <span>Dépôt</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="RETRAIT_MOMO" {...register('type')} />
            <span>Retrait</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="montant">Montant</Label>
        <Input
          id="montant"
          type="number"
          inputMode="numeric"
          placeholder="0"
          {...register('montant', { valueAsNumber: true })}
        />
        {errors.montant && <p className="text-sm text-destructive">{errors.montant.message}</p>}
        {!fondsSuffisants && (
          <p className="text-sm text-destructive">Fonds insuffisants pour ce dépôt</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={!isValid || isSubmitting || !fondsSuffisants}>
        {isSubmitting ? 'Enregistrement...' : 'Enregistrer l\'opération'}
      </Button>
    </form>
  );
}
