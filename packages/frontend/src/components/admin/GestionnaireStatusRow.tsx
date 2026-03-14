import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface GestionnaireStatusRowProps {
  id: string;
  identifiant: string;
  actif: boolean;
  onToggle: (id: string, actif: boolean) => void;
}

export function GestionnaireStatusRow({ id, identifiant, actif, onToggle }: GestionnaireStatusRowProps) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3" data-testid="gestionnaire-row">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{identifiant}</span>
        <Badge variant={actif ? 'secondary' : 'destructive'}>{actif ? 'Actif' : 'Inactif'}</Badge>
      </div>
      <Button size="sm" variant={actif ? 'destructive' : 'default'} onClick={() => onToggle(id, !actif)}>
        {actif ? 'Désactiver' : 'Activer'}
      </Button>
    </div>
  );
}
