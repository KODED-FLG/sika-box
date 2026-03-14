import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

const schema = z.object({
  prix_vente: z.number({ invalid_type_error: 'Nombre requis' }).int('Entier requis').positive('Doit être positif'),
  cout_achat: z.number({ invalid_type_error: 'Nombre requis' }).int('Entier requis').positive('Doit être positif'),
  designation: z.string().min(1, 'Désignation requise'),
}).refine((data) => data.prix_vente >= data.cout_achat, {
  message: 'Vente à perte',
  path: ['prix_vente'],
});

type FormValues = z.infer<typeof schema>;

interface FormulaireCorrectionTransactionProps {
  transactionId: string;
  valeurInitiale: { prix_vente: number; cout_achat: number; designation: string };
  fenetreExpiration: string;
  onSubmit: (data: { transactionId: string; pv: number; ca: number; designation: string }) => void;
  isSubmitting?: boolean;
}

function useCountdown(expiration: string) {
  const calcSecondsLeft = useCallback(() => {
    const diff = new Date(expiration).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  }, [expiration]);

  const [secondsLeft, setSecondsLeft] = useState(calcSecondsLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(calcSecondsLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calcSecondsLeft]);

  return secondsLeft;
}

export function FormulaireCorrectionTransaction({
  transactionId,
  valeurInitiale,
  fenetreExpiration,
  onSubmit,
  isSubmitting,
}: FormulaireCorrectionTransactionProps) {
  const secondsLeft = useCountdown(fenetreExpiration);
  const isExpired = secondsLeft <= 0;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: valeurInitiale,
  });

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const handleFormSubmit = (data: FormValues) => {
    onSubmit({ transactionId, pv: data.prix_vente, ca: data.cout_achat, designation: data.designation });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" data-testid="form-correction">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Correction de transaction</h3>
        <Badge variant={isExpired ? 'destructive' : 'outline'} className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {isExpired ? 'Expiré' : `${minutes}:${seconds.toString().padStart(2, '0')}`}
        </Badge>
      </div>

      <div className="space-y-2">
        <Label htmlFor="correction-designation">Désignation</Label>
        <Input id="correction-designation" disabled={isExpired} {...register('designation')} />
        {errors.designation && <p className="text-sm text-destructive">{errors.designation.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="correction-pv">Prix de Vente</Label>
        <Input
          id="correction-pv"
          type="number"
          inputMode="numeric"
          disabled={isExpired}
          {...register('prix_vente', { valueAsNumber: true })}
        />
        {errors.prix_vente && <p className="text-sm text-destructive">{errors.prix_vente.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="correction-ca">Coût d&apos;Achat</Label>
        <Input
          id="correction-ca"
          type="number"
          inputMode="numeric"
          disabled={isExpired}
          {...register('cout_achat', { valueAsNumber: true })}
        />
        {errors.cout_achat && <p className="text-sm text-destructive">{errors.cout_achat.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={!isValid || isSubmitting || isExpired}>
        {isExpired ? 'Fenêtre expirée' : isSubmitting ? 'Correction en cours...' : 'Appliquer la correction'}
      </Button>
    </form>
  );
}
