import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FormulaireVenteTextile } from '@/components/forms/FormulaireVenteTextile';

describe('FormulaireVenteTextile', () => {
  it('soumet les données quand le formulaire est valide', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<FormulaireVenteTextile onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Désignation'), 'Bazin 3m');
    await user.type(screen.getByLabelText(/Prix de Vente/), '15000');
    await user.type(screen.getByLabelText(/Coût d'Achat/), '10000');

    const submitBtn = screen.getByRole('button', { name: /enregistrer la vente/i });
    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith({ pv: 15000, ca: 10000, designation: 'Bazin 3m' });
  });

  it('affiche une erreur quand PV < CA', async () => {
    const user = userEvent.setup();
    render(<FormulaireVenteTextile onSubmit={() => {}} />);

    await user.type(screen.getByLabelText('Désignation'), 'Test');
    await user.type(screen.getByLabelText(/Prix de Vente/), '5000');
    await user.type(screen.getByLabelText(/Coût d'Achat/), '10000');

    // Trigger validation
    await user.tab();

    expect(screen.getByText('Vente à perte')).toBeInTheDocument();
  });

  it('désactive le bouton quand les champs sont vides', () => {
    render(<FormulaireVenteTextile onSubmit={() => {}} />);
    const submitBtn = screen.getByRole('button', { name: /enregistrer la vente/i });
    expect(submitBtn).toBeDisabled();
  });
});
