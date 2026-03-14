import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  operateur_id: z.string().min(1, 'Opérateur requis'),
  montant: z.number({ invalid_type_error: 'Nombre requis' }).int('Entier requis').positive('Doit être positif'),
});

type FormValues = z.infer<typeof schema>;

interface Operateur {
  id: string;
  nom: string;
}

interface FormulaireCommissionMomoProps {
  operateurs: Operateur[];
  onSubmit: (data: { operateur_id: string; montant: number }) => void;
  isSubmitting?: boolean;
}

export function FormulaireCommissionMomo({ operateurs, onSubmit, isSubmitting }: FormulaireCommissionMomoProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { operateur_id: '', montant: undefined as unknown as number },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="form-commission-momo">
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
        <Label htmlFor="montant-commission">Montant Commission</Label>
        <Input
          id="montant-commission"
          type="number"
          inputMode="numeric"
          placeholder="0"
          {...register('montant', { valueAsNumber: true })}
        />
        {errors.montant && <p className="text-sm text-destructive">{errors.montant.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
        {isSubmitting ? 'Enregistrement...' : 'Enregistrer la commission'}
      </Button>
    </form>
  );
}
