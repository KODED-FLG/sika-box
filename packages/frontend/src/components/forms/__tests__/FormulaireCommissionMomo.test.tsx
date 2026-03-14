import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';
import { FormulaireCommissionMomo } from '@/components/forms/FormulaireCommissionMomo';

beforeAll(() => {
  // Radix UI uses pointer capture which jsdom doesn't support
  Element.prototype.hasPointerCapture = Element.prototype.hasPointerCapture || (() => false);
  Element.prototype.setPointerCapture = Element.prototype.setPointerCapture || (() => {});
  Element.prototype.releasePointerCapture = Element.prototype.releasePointerCapture || (() => {});
});

const MOCK_OPERATEURS = [
  { id: '1', nom: 'MTN Mobile Money' },
  { id: '2', nom: 'Moov Money' },
];

describe('FormulaireCommissionMomo', () => {
  it('affiche le formulaire avec le champ montant', () => {
    render(<FormulaireCommissionMomo operateurs={MOCK_OPERATEURS} onSubmit={() => {}} />);
    expect(screen.getByLabelText(/Montant Commission/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enregistrer la commission/i })).toBeDisabled();
  });
});
