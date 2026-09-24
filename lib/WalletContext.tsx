'use client';

import React, { createContext, useContext, useState } from 'react';
import { createConnectedSession, detectWallet, DEFAULT_NETWORK, type ConnectedSession } from '@/lib/midnight';
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

  const connect = async () => {
    setBusy(true);
    setError(null);
    try {
      const wallet = await detectWallet();
      const api = await wallet.connect(DEFAULT_NETWORK);
      const s = await createConnectedSession(api, ZK_PATH);
      setSession(s);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const disconnect = () => {
    setSession(null);
  };

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
