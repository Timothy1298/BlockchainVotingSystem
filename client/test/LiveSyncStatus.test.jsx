import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import LiveSyncStatus from '../src/components/LiveSyncStatus';

// Mock the API module inline (ESM-safe)
vi.mock('../src/services/api', () => ({
  getMetrics: async () => `events_processed_total 42\nprocessed_blocks 128`,
  getBlockchainStatus: async () => ({ blockNumber: 128, txCount: 200, latestHash: '0xabc', nodes: 2 }),
}));

describe('LiveSyncStatus', () => {
  it('renders and shows metrics', async () => {
    render(<LiveSyncStatus />);
    await waitFor(() => expect(screen.getByText(/Live Blockchain Sync/i)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(/Last Processed Block/i)).toBeInTheDocument());
    expect(screen.getByText(/Events Processed/i)).toBeInTheDocument();
  });
});
