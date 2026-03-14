import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MontantFCFA } from '@/components/common/MontantFCFA';

describe('MontantFCFA', () => {
  it('affiche 350 000 FCFA pour 350000', () => {
    render(<MontantFCFA value={350000} />);
    expect(screen.getByText(/350\s*000 FCFA/)).toBeInTheDocument();
  });

  it('affiche 0 FCFA pour 0', () => {
    render(<MontantFCFA value={0} />);
    expect(screen.getByText('0 FCFA')).toBeInTheDocument();
  });

  it('affiche 1 500 000 FCFA pour 1500000', () => {
    render(<MontantFCFA value={1500000} />);
    expect(screen.getByText(/1\s*500\s*000 FCFA/)).toBeInTheDocument();
  });
});
