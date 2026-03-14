import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { useAuthStore } from '@/stores/authStore';

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<AuthGuard />}>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AuthGuard', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it('redirige vers /login sans token', () => {
    renderWithRouter('/dashboard');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it("autorise l'accès avec token", () => {
    useAuthStore.setState({
      user: { id: '1', identifiant: 'admin', role: 'ADMIN' },
      token: 'jwt-token',
      isAuthenticated: true,
    });
    renderWithRouter('/dashboard');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
