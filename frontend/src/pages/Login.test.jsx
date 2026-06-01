import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';
import { useAuth } from '../context/AuthContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Login Component', () => {
  it('renders login form correctly', () => {
    useAuth.mockReturnValue({ login: vi.fn() });
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Masuk/i })).toBeInTheDocument();
  });

  it('shows error when login fails', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Username atau password salah!'));
    useAuth.mockReturnValue({ login: mockLogin });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'wrong' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Masuk/i }));

    await waitFor(() => {
      expect(screen.getByText(/Username atau password salah!/i)).toBeInTheDocument();
    });
  });

  it('navigates to dashboard on successful login', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ role: 'KEPALA_SEKOLAH' });
    useAuth.mockReturnValue({ login: mockLogin });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'admin' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Masuk/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
