import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GradeSpreadsheet from './GradeSpreadsheet';

import axios from 'axios';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 2, role: 'GURU', name: 'Siti Aminah' },
  }),
}));

vi.mock('axios');

describe('GradeSpreadsheet Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders grades spreadsheet and fetches data', async () => {
    const mockGrades = [
      { id: 1, studentName: 'Budi', studentId: 101, subject: 'Matematika', dailyScore: 80, utsScore: 85, uasScore: 90, finalScore: 85 }
    ];
    axios.get.mockResolvedValue({ data: mockGrades });

    render(
      <BrowserRouter>
        <GradeSpreadsheet />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/101/i)).toBeInTheDocument();
      expect(screen.getByText(/Matematika/i)).toBeInTheDocument();
    });
  });
});
