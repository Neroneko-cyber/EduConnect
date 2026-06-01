import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AssetsGuru from './AssetsGuru';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 2, role: 'GURU', name: 'Siti Aminah' },
  }),
}));

global.fetch = vi.fn();

describe('AssetsGuru Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders assets list correctly', async () => {
    const mockAssets = [
      { id: 1, name: 'Proyektor', category: 'Elektronik', condition: 'BAIK' }
    ];
    fetch.mockImplementation((url) => {
      if (url.includes('assets/search')) {
        return Promise.resolve({ ok: true, json: async () => mockAssets });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(
      <BrowserRouter>
        <AssetsGuru />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Proyektor/i)).toBeInTheDocument();
      expect(screen.getByText(/BAIK/i)).toBeInTheDocument();
    });
  });
});
