import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AlerteRappelCommission } from '@/components/dashboard/AlerteRappelCommission';

describe('AlerteRappelCommission', () => {
  it('affiche l\'alerte quand rappels > 0', () => {
    render(<AlerteRappelCommission rappelsEnAttente={2} />);
    expect(screen.getByText(/2 commissions à saisir/)).toBeInTheDocument();
  });

  it('n\'affiche rien quand rappels = 0', () => {
    const { container } = render(<AlerteRappelCommission rappelsEnAttente={0} />);
    expect(container.firstChild).toBeNull();
  });
});
