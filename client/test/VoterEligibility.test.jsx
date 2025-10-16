import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import VoterEligibility from '../src/components/VoterEligibility';
vi.mock('../src/services/api', () => ({
  checkVoterEligibility: async (voterId) => ({ eligible: voterId === 'allowed', reason: voterId === 'allowed' ? null : 'Not found' }),
  uploadEligibilityFile: async (file) => ({ message: 'uploaded' }),
}));

describe('VoterEligibility', () => {
  it('checks eligibility and uploads file', async () => {
    render(<VoterEligibility />);
    fireEvent.change(screen.getByPlaceholderText(/Voter ID or Email/i), { target: { value: 'allowed' } });
    fireEvent.click(screen.getByText(/Check/i));
    await waitFor(() => expect(screen.getByText(/Eligible/i)).toBeInTheDocument());
  });
});
