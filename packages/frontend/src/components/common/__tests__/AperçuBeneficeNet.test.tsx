import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AperçuBeneficeNet } from '@/components/common/AperçuBeneficeNet';

describe('AperçuBeneficeNet', () => {
  it('affiche le bénéfice net quand PV > CA', () => {
    render(<AperçuBeneficeNet prixVente={15000} coutAchat={10000} />);
    expect(screen.getByText(/Bénéfice Net/)).toBeInTheDocument();
    expect(screen.getByText(/5\s*000 FCFA/)).toBeInTheDocument();
  });

  it('affiche "Vente à perte" quand PV < CA', () => {
    render(<AperçuBeneficeNet prixVente={5000} coutAchat={10000} />);
    expect(screen.getByText('Vente à perte')).toBeInTheDocument();
  });

  it('n\'affiche rien quand PV=0 et CA=0', () => {
    const { container } = render(<AperçuBeneficeNet prixVente={0} coutAchat={0} />);
    expect(container.firstChild).toBeNull();
  });
});
