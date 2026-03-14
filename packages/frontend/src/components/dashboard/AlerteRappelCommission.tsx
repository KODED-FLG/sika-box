import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AlerteRappelCommissionProps {
  rappelsEnAttente: number;
}

export function AlerteRappelCommission({ rappelsEnAttente }: AlerteRappelCommissionProps) {
  if (rappelsEnAttente === 0) return null;

  return (
    <Alert className="border-orange-500 bg-orange-50 text-orange-900" data-testid="alerte-rappel-commission">
      <AlertTriangle className="h-4 w-4 text-orange-500" />
      <AlertTitle>Rappel</AlertTitle>
      <AlertDescription>
        {rappelsEnAttente} commission{rappelsEnAttente > 1 ? 's' : ''} à saisir
      </AlertDescription>
    </Alert>
  );
}
