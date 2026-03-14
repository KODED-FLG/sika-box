import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VentilationDetail } from '@/components/transactions/VentilationDetail';

describe('VentilationDetail', () => {
  it('affiche la répartition pour chaque caisse', () => {
    const mouvements = [
      { caisse: 'STOCK', montant: 2500 },
      { caisse: 'SALAIRE', montant: 1500 },
      { caisse: 'REMBOURSEMENT', montant: 1000 },
      { caisse: 'RESERVE', montant: 0 },
    ];
    render(<VentilationDetail mouvements={mouvements} />);
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('Salaire')).toBeInTheDocument();
    expect(screen.getByText('Remboursement')).toBeInTheDocument();
    expect(screen.getByText('Réserve')).toBeInTheDocument();
    expect(screen.getByText(/2\s*500 FCFA/)).toBeInTheDocument();
  });
});
