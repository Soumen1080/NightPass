/**
 * WalletContext unit tests
 * Tests the connection status state machine and retry logic.
 */
import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the midnight module
jest.mock('../lib/midnight', () => ({
  detectWallet: jest.fn(),
  createConnectedSession: jest.fn(),
  DEFAULT_NETWORK: 'preprod',
}));

import { WalletProvider, useWallet } from '../lib/WalletContext';
import * as midnight from '../lib/midnight';

const mockedDetectWallet = midnight.detectWallet as jest.Mock;
const mockedCreateSession = midnight.createConnectedSession as jest.Mock;

// Test component that exercises the wallet context
function TestComponent() {
  const { session, busy, error, connectionStatus, connect, disconnect } = useWallet();
  return (
    <div>
      <div data-testid="status">{connectionStatus}</div>
      <div data-testid="busy">{String(busy)}</div>
      <div data-testid="error">{error ?? 'none'}</div>
      <div data-testid="address">{session?.unshieldedAddress ?? 'not-connected'}</div>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}

describe('WalletContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts in idle state', () => {
    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );
    expect(screen.getByTestId('status').textContent).toBe('idle');
    expect(screen.getByTestId('busy').textContent).toBe('false');
    expect(screen.getByTestId('error').textContent).toBe('none');
  });

  it('shows connected status on successful connection', async () => {
    const fakeWallet = { connect: jest.fn().mockResolvedValue({}) };
    mockedDetectWallet.mockResolvedValue(fakeWallet);
    mockedCreateSession.mockResolvedValue({
      unshieldedAddress: 'mn1testaddress123',
    });

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );

    await act(async () => {
      screen.getByText('Connect').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('connected');
    });
    expect(screen.getByTestId('address').textContent).toBe('mn1testaddress123');
    expect(screen.getByTestId('error').textContent).toBe('none');
  });

  it('shows error on user rejection without retrying', async () => {
    const fakeWallet = {
      connect: jest.fn().mockRejectedValue(new Error('User rejected the request')),
    };
    mockedDetectWallet.mockResolvedValue(fakeWallet);

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );

    await act(async () => {
      screen.getByText('Connect').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('error');
    });
    expect(screen.getByTestId('error').textContent).toContain('rejected');
    // Should only have been called once — no retries on user rejection
    expect(fakeWallet.connect).toHaveBeenCalledTimes(1);
  });

  it('resets to idle on disconnect', async () => {
    const fakeWallet = { connect: jest.fn().mockResolvedValue({}) };
    mockedDetectWallet.mockResolvedValue(fakeWallet);
    mockedCreateSession.mockResolvedValue({ unshieldedAddress: 'mn1test' });

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );

    await act(async () => {
      screen.getByText('Connect').click();
    });
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('connected');
    });

    await act(async () => {
      screen.getByText('Disconnect').click();
    });

    expect(screen.getByTestId('status').textContent).toBe('idle');
    expect(screen.getByTestId('address').textContent).toBe('not-connected');
  });
});
