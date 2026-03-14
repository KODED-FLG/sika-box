import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FondsRoulementMomoCard } from '@/components/dashboard/FondsRoulementMomoCard';

describe('FondsRoulementMomoCard', () => {
  it('affiche le nom de l\'opérateur et le solde', () => {
    render(<FondsRoulementMomoCard operateur="MTN Mobile Money" solde={185000} />);
    expect(screen.getByText('MTN Mobile Money')).toBeInTheDocument();
    expect(screen.getByText(/185\s*000 FCFA/)).toBeInTheDocument();
  });
});
