import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  identifiant: z.string().min(1, 'Identifiant requis'),
  mot_de_passe_temporaire: z.string().min(8, 'Minimum 8 caractères'),
});

type FormValues = z.infer<typeof schema>;

interface FormulaireCreationGestionnaireProps {
  onSubmit: (data: { identifiant: string; mot_de_passe_temporaire: string }) => void;
  isSubmitting?: boolean;
}

export function FormulaireCreationGestionnaire({ onSubmit, isSubmitting }: FormulaireCreationGestionnaireProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="form-creation-gestionnaire">
      <div className="space-y-2">
        <Label htmlFor="identifiant-gest">Identifiant</Label>
        <Input id="identifiant-gest" placeholder="Ex: gestionnaire1" {...register('identifiant')} />
        {errors.identifiant && <p className="text-sm text-destructive">{errors.identifiant.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="mdp-temp">Mot de passe temporaire</Label>
        <Input id="mdp-temp" type="password" placeholder="Min. 8 caractères" {...register('mot_de_passe_temporaire')} />
        {errors.mot_de_passe_temporaire && (
          <p className="text-sm text-destructive">{errors.mot_de_passe_temporaire.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
        {isSubmitting ? 'Création...' : 'Créer le gestionnaire'}
      </Button>
    </form>
  );
}
