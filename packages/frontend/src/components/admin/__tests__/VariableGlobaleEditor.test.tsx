import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { VariableGlobaleEditor } from '@/components/admin/VariableGlobaleEditor';

describe('VariableGlobaleEditor', () => {
  it('affiche le label et la valeur actuelle', () => {
    render(<VariableGlobaleEditor cle="plafond_capital" label="Plafond" valeur={500000} onChange={() => {}} />);
    expect(screen.getByText('Plafond Capital')).toBeInTheDocument();
    expect(screen.getByText(/500\s?000/)).toBeInTheDocument();
  });

  it('active le bouton quand la valeur change', async () => {
    const user = userEvent.setup();
    render(<VariableGlobaleEditor cle="plafond_capital" label="Plafond" valeur={500000} onChange={() => {}} />);

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '600000');

    expect(screen.getByRole('button', { name: 'Sauver' })).not.toBeDisabled();
  });

  it('appelle onChange avec le bon nombre', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<VariableGlobaleEditor cle="plafond_capital" label="Plafond" valeur={500000} onChange={onChange} />);

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '600000');
    await user.click(screen.getByRole('button', { name: 'Sauver' }));

    expect(onChange).toHaveBeenCalledWith(600000);
  });
});
