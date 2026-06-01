import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AssetsTU from './AssetsTU';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 3, role: 'TU', name: 'Ahmad Yani' },
  }),
}));

global.fetch = vi.fn();

describe('AssetsTU Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders reported tickets correctly', async () => {
    const mockTickets = [
      { 
        id: 1, 
        asset: { name: 'Proyektor' }, 
        reporter: { name: 'Guru A' },
        description: 'Lampu mati',
        status: 'REPORTED',
        createdAt: '2023-10-01T00:00:00Z'
      }
    ];
    fetch.mockImplementation((url) => {
      if (url.includes('tickets')) {
        return Promise.resolve({ ok: true, json: async () => mockTickets });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(
      <BrowserRouter>
        <AssetsTU />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Guru A/i)).toBeInTheDocument();
      expect(screen.getByText(/Lampu mati/i)).toBeInTheDocument();
      expect(screen.getByText(/Proyektor/i)).toBeInTheDocument();
    });
  });

  it('renders approved tickets correctly', async () => {
    const mockTickets = [
      { 
        id: 2, 
        asset: { name: 'Meja' }, 
        reporter: { name: 'Guru B' },
        description: 'Patah',
        status: 'APPROVED',
        kepsekFeedback: 'Silakan perbaiki',
        createdAt: '2023-10-01T00:00:00Z'
      }
    ];
    fetch.mockImplementation((url) => {
      if (url.includes('tickets')) {
        return Promise.resolve({ ok: true, json: async () => mockTickets });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(
      <BrowserRouter>
        <AssetsTU />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Meja/i)).toBeInTheDocument();
      expect(screen.getByText(/Silakan perbaiki/i)).toBeInTheDocument();
    });
  });
});
