import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const schema = z.object({
  identifiant: z.string().min(1, 'Identifiant requis'),
  mot_de_passe: z.string().min(1, 'Mot de passe requis'),
});

type FormValues = z.infer<typeof schema>;

interface PageLoginProps {
  onSubmit?: (data: { email: string; password: string }) => void;
}

export function PageLogin({ onSubmit }: PageLoginProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const handleFormSubmit = (data: FormValues) => {
    onSubmit?.({ email: data.identifiant, password: data.mot_de_passe });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sika Box</CardTitle>
          <p className="text-sm text-muted-foreground">Connectez-vous à votre compte</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" data-testid="form-login">
            <div className="space-y-2">
              <Label htmlFor="identifiant">Identifiant</Label>
              <Input id="identifiant" placeholder="Votre identifiant" {...register('identifiant')} />
              {errors.identifiant && <p className="text-sm text-destructive">{errors.identifiant.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mot_de_passe">Mot de passe</Label>
              <Input id="mot_de_passe" type="password" placeholder="••••••••" {...register('mot_de_passe')} />
              {errors.mot_de_passe && <p className="text-sm text-destructive">{errors.mot_de_passe.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={!isValid}>
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
