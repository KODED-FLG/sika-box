import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { PageChangerMotDePasse } from '@/pages/PageChangerMotDePasse';

function renderPage(onSubmit = vi.fn()) {
  return render(
    <MemoryRouter>
      <PageChangerMotDePasse onSubmit={onSubmit} />
    </MemoryRouter>,
  );
}

describe('PageChangerMotDePasse', () => {
  it('soumet quand les mots de passe correspondent', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderPage(onSubmit);

    await user.type(screen.getByLabelText(/Nouveau mot de passe/), 'abcdefgh');
    await user.type(screen.getByLabelText(/Confirmer/), 'abcdefgh');

    const submitBtn = screen.getByRole('button', { name: /changer le mot de passe/i });
    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith({ password: 'abcdefgh' });
  });

  it('affiche une erreur quand les mots de passe diffèrent', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/Nouveau mot de passe/), 'abcdefgh');
    await user.type(screen.getByLabelText(/Confirmer/), 'different');
    await user.tab();

    expect(screen.getByText('Les mots de passe ne correspondent pas')).toBeInTheDocument();
  });

  it('affiche une erreur quand < 8 caractères', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/Nouveau mot de passe/), 'court');
    await user.tab();

    expect(screen.getByText('Minimum 8 caractères')).toBeInTheDocument();
  });
});
