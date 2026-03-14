import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MontantFCFA } from '@/components/common/MontantFCFA';

interface ProgressionRemboursementProps {
  solde: number;
  plafond: number;
  pourcentage: number;
}

export function ProgressionRemboursement({ solde, plafond, pourcentage }: ProgressionRemboursementProps) {
  return (
    <Card data-testid="progression-remboursement">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-remboursement">Progression Remboursement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={pourcentage} className="h-3" />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            <MontantFCFA value={solde} /> / <MontantFCFA value={plafond} />
          </span>
          <span className="font-semibold">{pourcentage}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
