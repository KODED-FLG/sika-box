import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MontantFCFA } from '@/components/common/MontantFCFA';
import { Smartphone } from 'lucide-react';

interface FondsRoulementMomoCardProps {
  operateur: string;
  solde: number;
}

export function FondsRoulementMomoCard({ operateur, solde }: FondsRoulementMomoCardProps) {
  return (
    <Card className="border-l-4 border-l-momo" data-testid="fonds-momo-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-momo">{operateur}</CardTitle>
        <Smartphone className="h-4 w-4 text-momo" />
      </CardHeader>
      <CardContent>
        <MontantFCFA value={solde} className="text-2xl font-bold" />
      </CardContent>
    </Card>
  );
}
