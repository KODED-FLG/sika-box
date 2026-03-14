import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TransactionRow } from '@/components/transactions/TransactionRow';

describe('TransactionRow', () => {
  it('affiche le type, le montant et la date', () => {
    render(
      <TransactionRow
        type="VENTE_TEXTILE"
        designation="Bazin 3m"
        montant={15000}
        date="2026-03-14T10:00:00Z"
      />,
    );
    expect(screen.getByText('Vente textile')).toBeInTheDocument();
    expect(screen.getByText(/15\s*000 FCFA/)).toBeInTheDocument();
    expect(screen.getByText('Bazin 3m')).toBeInTheDocument();
  });

  it('affiche le badge Corrigée quand corrigée', () => {
    render(
      <TransactionRow type="VENTE_TEXTILE" montant={10000} date="2026-03-14T10:00:00Z" corrigee={true} />,
    );
    expect(screen.getByText('Corrigée')).toBeInTheDocument();
  });

  it('affiche le badge Modifiable quand fenêtre active', () => {
    render(
      <TransactionRow type="VENTE_TEXTILE" montant={10000} date="2026-03-14T10:00:00Z" fenetreActive={true} />,
    );
    expect(screen.getByText('Modifiable')).toBeInTheDocument();
  });
});
