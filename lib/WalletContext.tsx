'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ConnectedSession } from '@/lib/midnight';
import { ZK_PATH } from '@/lib/party';

type WalletContextType = {
  session: ConnectedSession | null;
  busy: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectingRef = useRef(false);

  const connect = useCallback(async () => {
    // Guard against double-clicking — the connect flow is async and can take
    // 10–30 s while the wallet popup is open.
    if (connectingRef.current) return;
    connectingRef.current = true;
    setBusy(true);
    setError(null);

    try {
      // Dynamic imports so the heavy SDK code is only loaded client-side
      // and never pulled into SSR bundles.
      const { detectWallet, createConnectedSession, DEFAULT_NETWORK } = await import('@/lib/midnight');

      const wallet = await detectWallet();
      const api = await wallet.connect(DEFAULT_NETWORK);
      const s = await createConnectedSession(api, ZK_PATH);
      setSession(s);
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      // Make common errors more user-friendly
      if (msg.includes('User rejected') || msg.includes('user denied')) {
        setError('Connection rejected by the wallet. Please try again.');
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
      connectingRef.current = false;
    }
  }, []);

  const disconnect = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  return (
    <WalletContext.Provider value={{ session, busy, error, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
