import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormulaireCorrectionTransaction } from '@/components/forms/FormulaireCorrectionTransaction';

describe('FormulaireCorrectionTransaction', () => {
  it('affiche le temps restant et les champs pré-remplis', () => {
    const future = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    render(
      <FormulaireCorrectionTransaction
        transactionId="tx1"
        valeurInitiale={{ prix_vente: 10000, cout_achat: 8000, designation: 'Pagne' }}
        fenetreExpiration={future}
        onSubmit={() => {}}
      />,
    );

    expect(screen.getByText('Correction de transaction')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pagne')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /appliquer la correction/i })).toBeInTheDocument();
  });

  it('affiche Expiré quand la fenêtre est passée', () => {
    const past = new Date(Date.now() - 60 * 1000).toISOString();
    render(
      <FormulaireCorrectionTransaction
        transactionId="tx1"
        valeurInitiale={{ prix_vente: 10000, cout_achat: 8000, designation: 'Pagne' }}
        fenetreExpiration={past}
        onSubmit={() => {}}
      />,
    );

    expect(screen.getByText('Expiré')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fenêtre expirée/i })).toBeDisabled();
  });
});
