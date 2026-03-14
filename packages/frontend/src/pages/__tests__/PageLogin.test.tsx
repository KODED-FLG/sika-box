import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { PageLogin } from '@/pages/PageLogin';

function renderPage(onSubmit = vi.fn()) {
  return render(
    <MemoryRouter>
      <PageLogin onSubmit={onSubmit} />
    </MemoryRouter>,
  );
}

describe('PageLogin', () => {
  it('affiche le formulaire de connexion', () => {
    renderPage();
    expect(screen.getByText('Sika Box')).toBeInTheDocument();
    expect(screen.getByLabelText('Identifiant')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
  });

  it('soumet les données quand le formulaire est valide', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderPage(onSubmit);

    await user.type(screen.getByLabelText('Identifiant'), 'admin');
    await user.type(screen.getByLabelText('Mot de passe'), 'monmdp123');

    const submitBtn = screen.getByRole('button', { name: /se connecter/i });
    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith({ email: 'admin', password: 'monmdp123' });
  });

  it('désactive le bouton quand les champs sont vides', () => {
    renderPage();
    const submitBtn = screen.getByRole('button', { name: /se connecter/i });
    expect(submitBtn).toBeDisabled();
  });
});
