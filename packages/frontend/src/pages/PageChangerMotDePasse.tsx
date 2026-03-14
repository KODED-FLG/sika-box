import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const schema = z
  .object({
    nouveau_mot_de_passe: z.string().min(8, 'Minimum 8 caractères'),
    confirmation: z.string().min(1, 'Confirmez le mot de passe'),
  })
  .refine((data) => data.nouveau_mot_de_passe === data.confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmation'],
  });

type FormValues = z.infer<typeof schema>;

interface PageChangerMotDePasseProps {
  onSubmit?: (data: { password: string }) => void;
}

export function PageChangerMotDePasse({ onSubmit }: PageChangerMotDePasseProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const handleFormSubmit = (data: FormValues) => {
    onSubmit?.({ password: data.nouveau_mot_de_passe });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Changer le mot de passe</CardTitle>
          <p className="text-sm text-muted-foreground">Créez un nouveau mot de passe sécurisé</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" data-testid="form-changer-mdp">
            <div className="space-y-2">
              <Label htmlFor="nouveau_mdp">Nouveau mot de passe</Label>
              <Input id="nouveau_mdp" type="password" placeholder="Min. 8 caractères" {...register('nouveau_mot_de_passe')} />
              {errors.nouveau_mot_de_passe && (
                <p className="text-sm text-destructive">{errors.nouveau_mot_de_passe.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmation_mdp">Confirmer le mot de passe</Label>
              <Input id="confirmation_mdp" type="password" placeholder="Confirmez" {...register('confirmation')} />
              {errors.confirmation && <p className="text-sm text-destructive">{errors.confirmation.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={!isValid}>
              Changer le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
