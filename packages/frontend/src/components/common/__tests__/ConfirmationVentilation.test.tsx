import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ConfirmationVentilation } from '@/components/common/ConfirmationVentilation';

describe('ConfirmationVentilation', () => {
  it('affiche la ventilation et bouton OK', () => {
    const mouvements = [
      { caisse: 'STOCK', montant: 2500 },
      { caisse: 'SALAIRE', montant: 1500 },
      { caisse: 'REMBOURSEMENT', montant: 1000 },
    ];
    render(<ConfirmationVentilation open={true} onClose={() => {}} mouvements={mouvements} />);
    expect(screen.getByText('Transaction enregistrée')).toBeInTheDocument();
    expect(screen.getByText('Caisse Stock')).toBeInTheDocument();
    expect(screen.getByText('Caisse Salaire')).toBeInTheDocument();
    expect(screen.getByText('Caisse Remboursement')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });
});
