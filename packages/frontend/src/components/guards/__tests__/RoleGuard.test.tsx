import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { useAuthStore } from '@/stores/authStore';

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route element={<RoleGuard role="ADMIN" />}>
          <Route path="/admin" element={<div>Admin Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('RoleGuard', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it('redirige GESTIONNAIRE vers /dashboard', () => {
    useAuthStore.setState({
      user: { id: '1', identifiant: 'gestionnaire1', role: 'GESTIONNAIRE' },
      token: 'jwt-token',
      isAuthenticated: true,
    });
    renderWithRouter('/admin');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('autorise ADMIN à accéder', () => {
    useAuthStore.setState({
      user: { id: '1', identifiant: 'admin', role: 'ADMIN' },
      token: 'jwt-token',
      isAuthenticated: true,
    });
    renderWithRouter('/admin');
    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });
});
