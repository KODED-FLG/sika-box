import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ConfigOperateurMomoCard } from '@/components/admin/ConfigOperateurMomoCard';

describe('ConfigOperateurMomoCard', () => {
  it('affiche le nom et le badge actif', () => {
    render(<ConfigOperateurMomoCard id="1" nom="MTN" soldeInitial={100000} actif={true} onChange={() => {}} />);
    expect(screen.getByText('MTN')).toBeInTheDocument();
    expect(screen.getByText('Actif')).toBeInTheDocument();
  });

  it('appelle onChange avec id et nouveau solde', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ConfigOperateurMomoCard id="1" nom="MTN" soldeInitial={100000} actif={true} onChange={onChange} />);

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '200000');
    await user.click(screen.getByRole('button', { name: 'Sauver' }));

    expect(onChange).toHaveBeenCalledWith('1', 200000);
  });
});
