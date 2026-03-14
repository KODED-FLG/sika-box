import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CaisseCard } from '@/components/dashboard/CaisseCard';

describe('CaisseCard', () => {
  it('affiche le nom de la caisse et le solde formaté', () => {
    render(<CaisseCard type="STOCK" solde={350000} />);
    expect(screen.getByText('Caisse Stock')).toBeInTheDocument();
    expect(screen.getByText(/350\s*000 FCFA/)).toBeInTheDocument();
  });

  it('affiche l\'icône cadenas quand bloqué', () => {
    render(<CaisseCard type="STOCK" solde={350000} statut="BLOQUE" />);
    expect(screen.getByLabelText('Bloqué')).toBeInTheDocument();
  });

  it('affiche l\'icône débloqué quand actif', () => {
    render(<CaisseCard type="SALAIRE" solde={100000} statut="ACTIF" />);
    expect(screen.getByLabelText('Débloqué')).toBeInTheDocument();
  });
});
