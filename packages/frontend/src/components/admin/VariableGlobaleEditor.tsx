import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MontantFCFA } from '@/components/common/MontantFCFA';

interface VariableGlobaleEditorProps {
  cle: string;
  label: string;
  valeur: number;
  onChange: (nouvelle_valeur: number) => void;
  erreur?: string;
  isSaving?: boolean;
}

const LABELS_LISIBLES: Record<string, string> = {
  plafond_capital: 'Plafond Capital',
  ratio_stock: 'Ratio Stock (%)',
  ratio_salaire: 'Ratio Salaire (%)',
  ratio_remboursement: 'Ratio Remboursement (%)',
  ratio_post_plafond_salaire: 'Ratio Post-Plafond Salaire (%)',
  ratio_post_plafond_reserve: 'Ratio Post-Plafond Réserve (%)',
  frequence_rappel_commission: 'Fréquence Rappel Commission',
  verrouillage_inactivite_minutes: 'Verrouillage Inactivité (min)',
};

export function VariableGlobaleEditor({ cle, label, valeur, onChange, erreur, isSaving }: VariableGlobaleEditorProps) {
  const [localValue, setLocalValue] = useState(valeur.toString());
  const displayLabel = LABELS_LISIBLES[cle] ?? label;
  const isDirty = Number(localValue) !== valeur;

  const handleSave = () => {
    const num = Number(localValue);
    if (!Number.isNaN(num) && Number.isInteger(num)) {
      onChange(num);
    }
  };

  return (
    <div className="flex items-end gap-3 rounded-md border p-3" data-testid={`variable-${cle}`}>
      <div className="flex-1 space-y-1">
        <Label htmlFor={`var-${cle}`}>{displayLabel}</Label>
        <Input
          id={`var-${cle}`}
          type="number"
          inputMode="numeric"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
        />
        {erreur && <p className="text-sm text-destructive">{erreur}</p>}
        {!erreur && (
          <p className="text-xs text-muted-foreground">
            Actuel : <MontantFCFA value={valeur} />
          </p>
        )}
      </div>
      <Button size="sm" onClick={handleSave} disabled={!isDirty || isSaving}>
        {isSaving ? '...' : 'Sauver'}
      </Button>
    </div>
  );
}
