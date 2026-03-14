import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MontantFCFA } from './MontantFCFA';
import { CheckCircle } from 'lucide-react';

interface MouvementVentilation {
  caisse: string;
  montant: number;
}

interface ConfirmationVentilationProps {
  open: boolean;
  onClose: () => void;
  mouvements: MouvementVentilation[];
}

const LABELS_CAISSE: Record<string, string> = {
  STOCK: 'Caisse Stock',
  SALAIRE: 'Caisse Salaire',
  REMBOURSEMENT: 'Caisse Remboursement',
  RESERVE: 'Caisse Réserve',
};

const COULEURS_CAISSE: Record<string, string> = {
  STOCK: 'text-stock',
  SALAIRE: 'text-salaire',
  REMBOURSEMENT: 'text-remboursement',
  RESERVE: 'text-reserve',
};

export function ConfirmationVentilation({ open, onClose, mouvements }: ConfirmationVentilationProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Transaction enregistrée
          </DialogTitle>
          <DialogDescription>Détail de la ventilation :</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {mouvements.map((m) => (
            <div key={m.caisse} className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
              <span className={COULEURS_CAISSE[m.caisse] ?? 'text-foreground'}>
                {LABELS_CAISSE[m.caisse] ?? m.caisse}
              </span>
              <MontantFCFA value={m.montant} className="font-semibold" />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
