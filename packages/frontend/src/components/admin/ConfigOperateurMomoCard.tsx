import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MontantFCFA } from '@/components/common/MontantFCFA';
import { Smartphone } from 'lucide-react';

interface ConfigOperateurMomoCardProps {
  id: string;
  nom: string;
  soldeInitial: number;
  actif: boolean;
  onChange: (id: string, soldeInitial: number) => void;
  isSaving?: boolean;
}

export function ConfigOperateurMomoCard({ id, nom, soldeInitial, actif, onChange, isSaving }: ConfigOperateurMomoCardProps) {
  const [localValue, setLocalValue] = useState(soldeInitial.toString());
  const isDirty = Number(localValue) !== soldeInitial;

  const handleSave = () => {
    const num = Number(localValue);
    if (!Number.isNaN(num) && Number.isInteger(num) && num >= 0) {
      onChange(id, num);
    }
  };

  return (
    <Card data-testid={`config-operateur-${id}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Smartphone className="h-4 w-4 text-momo" />
          {nom}
        </CardTitle>
        <Badge variant={actif ? 'secondary' : 'destructive'}>{actif ? 'Actif' : 'Inactif'}</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor={`solde-${id}`}>Solde initial</Label>
        <div className="flex gap-2">
          <Input
            id={`solde-${id}`}
            type="number"
            inputMode="numeric"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
          />
          <Button size="sm" onClick={handleSave} disabled={!isDirty || isSaving}>
            {isSaving ? '...' : 'Sauver'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Actuel : <MontantFCFA value={soldeInitial} />
        </p>
      </CardContent>
    </Card>
  );
}
