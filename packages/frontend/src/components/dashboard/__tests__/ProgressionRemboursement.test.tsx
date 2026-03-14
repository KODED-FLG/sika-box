import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressionRemboursement } from '@/components/dashboard/ProgressionRemboursement';

describe('ProgressionRemboursement', () => {
  it('affiche la barre de progression et les montants', () => {
    render(<ProgressionRemboursement solde={230000} plafond={500000} pourcentage={46} />);
    expect(screen.getByText('46%')).toBeInTheDocument();
    expect(screen.getByText(/230\s*000/)).toBeInTheDocument();
    expect(screen.getByText(/500\s*000/)).toBeInTheDocument();
  });
});
