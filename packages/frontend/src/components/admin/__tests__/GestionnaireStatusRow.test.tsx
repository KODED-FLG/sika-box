import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { GestionnaireStatusRow } from '@/components/admin/GestionnaireStatusRow';

describe('GestionnaireStatusRow', () => {
  it('affiche l\'identifiant et le badge Actif', () => {
    render(<GestionnaireStatusRow id="1" identifiant="gestionnaire1" actif={true} onToggle={() => {}} />);
    expect(screen.getByText('gestionnaire1')).toBeInTheDocument();
    expect(screen.getByText('Actif')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Désactiver' })).toBeInTheDocument();
  });

  it('appelle onToggle avec les bons paramètres', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<GestionnaireStatusRow id="1" identifiant="gestionnaire1" actif={true} onToggle={onToggle} />);

    await user.click(screen.getByRole('button', { name: 'Désactiver' }));
    expect(onToggle).toHaveBeenCalledWith('1', false);
  });
});
