import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FormulaireCreationGestionnaire } from '@/components/admin/FormulaireCreationGestionnaire';

describe('FormulaireCreationGestionnaire', () => {
  it('soumet les données avec identifiant et mot de passe', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<FormulaireCreationGestionnaire onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Identifiant'), 'gestionnaire1');
    await user.type(screen.getByLabelText(/Mot de passe temporaire/), 'monsecret123');

    const submitBtn = screen.getByRole('button', { name: /créer le gestionnaire/i });
    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith(
      { identifiant: 'gestionnaire1', mot_de_passe_temporaire: 'monsecret123' },
      expect.anything(),
    );
  });

  it('affiche une erreur quand le mot de passe < 8 caractères', async () => {
    const user = userEvent.setup();
    render(<FormulaireCreationGestionnaire onSubmit={() => {}} />);

    await user.type(screen.getByLabelText('Identifiant'), 'gestionnaire1');
    await user.type(screen.getByLabelText(/Mot de passe temporaire/), 'court');
    await user.tab();

    expect(screen.getByText('Minimum 8 caractères')).toBeInTheDocument();
  });

  it('désactive le bouton quand l\'identifiant est vide', () => {
    render(<FormulaireCreationGestionnaire onSubmit={() => {}} />);
    const submitBtn = screen.getByRole('button', { name: /créer le gestionnaire/i });
    expect(submitBtn).toBeDisabled();
  });
});
