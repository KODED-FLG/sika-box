import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuditLogRow } from '@/components/admin/AuditLogRow';

describe('AuditLogRow', () => {
  it('affiche l\'action, l\'utilisateur, les détails et la date', () => {
    render(
      <AuditLogRow
        action="MODIFICATION"
        utilisateur="admin"
        details="Modification du plafond capital"
        date="2026-03-14T10:00:00Z"
      />,
    );
    expect(screen.getByText('Modification')).toBeInTheDocument();
    expect(screen.getByText(/par admin/)).toBeInTheDocument();
    expect(screen.getByText('Modification du plafond capital')).toBeInTheDocument();
  });
});
