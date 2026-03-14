import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { IndicateurConnexion } from '@/components/common/IndicateurConnexion';
import { useUiStore } from '@/stores/uiStore';

describe('IndicateurConnexion', () => {
  beforeEach(() => {
    useUiStore.setState({ isOnline: true });
  });

  it('affiche "En ligne" quand online', () => {
    render(<IndicateurConnexion />);
    expect(screen.getByText('En ligne')).toBeInTheDocument();
  });

  it('affiche "Hors ligne" quand offline', () => {
    useUiStore.setState({ isOnline: false });
    render(<IndicateurConnexion />);
    expect(screen.getByText('Hors ligne')).toBeInTheDocument();
  });
});
