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
      console.log('[NightPass] Attempting to connect 1AM / Midnight Wallet...');
      // Dynamic imports so the heavy SDK code is only loaded client-side
      // and never pulled into SSR bundles.
      const { detectWallet, createConnectedSession, DEFAULT_NETWORK } = await import('@/lib/midnight');

      const wallet = await detectWallet();
      console.log('[NightPass] Wallet provider detected:', wallet);

      let targetNetwork = DEFAULT_NETWORK;
      let api: any;

      if (typeof wallet.connect === 'function') {
        try {
          api = await wallet.connect(targetNetwork);
        } catch (netErr: any) {
          const errMsg = netErr?.message ?? String(netErr);
          // Auto-adapt if wallet is on preview or preprod
          if (errMsg.toLowerCase().includes('wallet is on') && errMsg.toLowerCase().includes('preview')) {
            console.warn('[NightPass] 1AM Wallet is set to "preview". Auto-switching target network to preview...');
            targetNetwork = 'preview';
            api = await wallet.connect('preview');
          } else if (errMsg.toLowerCase().includes('wallet is on') && errMsg.toLowerCase().includes('preprod')) {
            console.warn('[NightPass] 1AM Wallet is set to "preprod". Auto-switching target network to preprod...');
            targetNetwork = 'preprod';
            api = await wallet.connect('preprod');
          } else {
            throw netErr;
          }
        }
      } else if (typeof wallet.enable === 'function') {
        api = await wallet.enable();
      } else {
        api = wallet;
      }

      console.log('[NightPass] Wallet connected. Initializing Midnight session on', targetNetwork);
      const s = await createConnectedSession(api, ZK_PATH, targetNetwork);
      console.log('[NightPass] Wallet session successfully established for:', s.unshieldedAddress);
      setSession(s);
    } catch (e: any) {
      console.error('[NightPass] Wallet connection failed:', e);
      const msg = e?.message ?? String(e);
      // Make common errors more user-friendly
      if (msg.includes('User rejected') || msg.includes('user denied')) {
        setError('Connection rejected in the wallet. Please try again.');
      } else if (msg.toLowerCase().includes('wallet is syncing') || msg.toLowerCase().includes('wait for sync')) {
        setError('1AM Wallet is still syncing blocks. In your 1AM extension tab, click the orange [RE-AUTHENTICATE] button and wait for the "FINALIZING..." blue bar to finish, then click Connect again.');
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
