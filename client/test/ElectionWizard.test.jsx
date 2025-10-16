import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ElectionWizard from '../src/components/ElectionWizard';
vi.mock('../src/services/api', () => ({
  createElection: async (payload) => ({ id: 'mock-eid', ...payload }),
  previewElectionOnChain: async (id) => ({ onChain: true, id }),
}));

describe('ElectionWizard', () => {
  it('creates an election via API', async () => {
    const onCreated = vi.fn();
    // render once and reuse container
    const { container } = render(<ElectionWizard onCreated={onCreated} />);
  const textboxes = screen.getAllByRole('textbox');
  const titleInput = textboxes[0];
  fireEvent.change(titleInput, { target: { value: 'Test Election' } });
  // set start/end datetime inputs (they are type=datetime-local and required)
  const startInput = container.querySelector('input[type="datetime-local"]');
  const endInput = container.querySelectorAll('input[type="datetime-local"]')[1] || container.querySelector('input[type="datetime-local"]');
  if (startInput) fireEvent.change(startInput, { target: { value: '2025-01-01T00:00' } });
  if (endInput) fireEvent.change(endInput, { target: { value: '2025-01-02T00:00' } });
  // set candidate name via placeholder
  fireEvent.change(screen.getAllByPlaceholderText(/Name/i)[0], { target: { value: 'Alice' } });
    // submit
    fireEvent.click(screen.getByText(/Create Election/i));
    await waitFor(() => expect(onCreated).toHaveBeenCalled());
  });
});
