import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';

describe('AuthLayout', () => {
  it('renders outlet content', () => {
    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/test" element={<div>Test Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders nested route content', () => {
    render(
      <MemoryRouter initialEntries={['/auth/login']}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/auth/login" element={<div>Login Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders different nested routes', () => {
    render(
      <MemoryRouter initialEntries={['/auth/register']}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/auth/register" element={<div>Register Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Register Page')).toBeInTheDocument();
  });
});