import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { createProofProvider } from '@midnight-ntwrk/midnight-js-types';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

export type NetworkName = 'preprod' | 'preview';

export const DEFAULT_NETWORK: NetworkName =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_NETWORK_ID as NetworkName) || 'preview';

// CRYPTO_NETWORK must match DEFAULT_NETWORK — previously hardcoded to 'preview'
// which caused a mismatch when .env.local set NEXT_PUBLIC_NETWORK_ID=preprod.
export const CRYPTO_NETWORK: NetworkName = DEFAULT_NETWORK;

// Do NOT call setNetworkId at module level — it uses SDK internals that can
// crash during SSR / static generation.  We call it lazily in createConnectedSession.
let _networkIdSet = false;
function ensureNetworkId() {
  if (!_networkIdSet) {
    setNetworkId(CRYPTO_NETWORK);
    _networkIdSet = true;
  }
}

export interface NetworkConfig {
  networkId: NetworkName;
  indexerUri: string;
  indexerWsUri: string;
  proofServerUri: string;
}

const NETWORKS: Record<NetworkName, NetworkConfig> = {
  preprod: {
    networkId: 'preprod',
    indexerUri: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWsUri: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    proofServerUri: 'https://proof-server.preprod.midnight.network',
  },
  preview: {
    networkId: 'preview',
    indexerUri: 'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWsUri: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    proofServerUri: 'https://proof-server.preview.midnight.network',
  },
};

export interface ConnectedSession {
  unshieldedAddress: string;
  config: NetworkConfig;
  providers: {
    walletProvider: any;
    midnightProvider: any;
    proofProvider: any;
    zkConfigProvider: any;
    privateStateProvider: any;
    publicDataProvider: any;
  };
  walletApi: any;
}

// ─── helpers ────────────────────────────────────────────────────────────────

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function fromHex(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return out;
}

/**
 * Detect and return the Midnight wallet API from window.midnight.
 * Includes a configurable timeout so the UI doesn't hang forever
 * if the wallet extension hasn't injected yet.
 */
export async function detectWallet(timeoutMs = 5000): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('Wallet detection can only run in the browser');
  }

  // Some wallets inject slightly after DOMContentLoaded.  Give them a moment.
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const w = (window as any).midnight;
    if (w) {
      if (w['1am']) return w['1am'];
      const first = Object.values(w)[0];
      if (first) return first;
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  throw new Error(
    'No Midnight-compatible wallet found. Please install and unlock the 1AM wallet extension, then refresh the page.',
  );
}

// ─── private state provider ─────────────────────────────────────────────────

function createPrivateStateProvider() {
  const store = new Map<string, unknown>();
  const contractAddresses = new Map<string, string>();
  const signingKeys = new Map<string, unknown>();
  return {
    async get(id: string) { return store.get(id) ?? null; },
    async set(id: string, state: unknown) { store.set(id, state); },
    async remove(id: string) { store.delete(id); },
    async setContractAddress(address: string) { contractAddresses.set('__current__', address); },
    async getContractAddress() { return contractAddresses.get('__current__') ?? null; },
    async setSigningKey(contractAddress: string, key: unknown) { signingKeys.set(contractAddress, key); },
    async getSigningKey(contractAddress: string) { return signingKeys.get(contractAddress) ?? null; },
  };
}


// ─── poll for state ──────────────────────────────────────────────────────────

export async function pollForState(
  queryUrl: string,
  contractAddress: string,
  { retries = 20, delayMs = 1500 }: { retries?: number; delayMs?: number } = {},
): Promise<string> {
  let lastError: string | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(queryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          query: `
            query ContractState($address: String!) {
              contractAction(address: $address) { state }
            }
          `,
          variables: { address: contractAddress },
        }),
      });

      clearTimeout(timeout);
      
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const json = JSON.parse(text);
          const state = json?.data?.contractAction?.state;
          if (state) return state as string;

          // Capture GraphQL-level errors
          if (json?.errors?.length) {
            lastError = json.errors[0].message;
          }
        }
      } else {
        lastError = `HTTP ${res.status}`;
      }
    } catch (e: any) {
      lastError = e?.message ?? String(e);
      console.warn(`pollForState attempt ${i + 1}/${retries} error:`, lastError);
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(
    `Timed out waiting for contract state at ${contractAddress}` +
    (lastError ? ` (last error: ${lastError})` : ''),
  );
}

// ─── createConnectedSession ──────────────────────────────────────────────────

export async function createConnectedSession(
  walletApi: any,
  zkPath: string,
  network: NetworkName = DEFAULT_NETWORK,
): Promise<ConnectedSession> {
  // Ensure the crypto network ID is set before any SDK operations
  ensureNetworkId();

  const config = NETWORKS[network];
  if (!config) {
    throw new Error(`Unknown network "${network}". Expected "preprod" or "preview".`);
  }

  let coinPublicKeyStr = '';
  let encPublicKeyStr = '';
  let unshieldedAddress = '';

  // Retry loop — wallet may be syncing on first connect
  for (let retries = 5; retries > 0; retries--) {
    try {
      if (typeof walletApi.getShieldedAddresses === 'function') {
        const shielded = await walletApi.getShieldedAddresses();
        const unshielded = await walletApi.getUnshieldedAddress();
        coinPublicKeyStr = shielded.shieldedCoinPublicKey;
        encPublicKeyStr = shielded.shieldedEncryptionPublicKey ?? coinPublicKeyStr;
        unshieldedAddress = unshielded.unshieldedAddress;
      } else {
        let state: any;
        if (typeof walletApi.state === 'function') {
          state = await walletApi.state();
        } else if (walletApi.state?.subscribe) {
          state = await new Promise((res, rej) => {
            const sub = walletApi.state.subscribe({
              next: (v: any) => { res(v); setTimeout(() => sub.unsubscribe(), 0); },
              error: rej,
            });
          });
        } else {
          state = walletApi.state;
        }
        coinPublicKeyStr = state.coinPublicKey;
        encPublicKeyStr = state.encryptionPublicKey ?? coinPublicKeyStr;
        unshieldedAddress = state.address ?? state.unshieldedAddress;
      }

      if (!unshieldedAddress) {
        throw new Error('Wallet returned an empty address. Is the wallet fully synced?');
      }

      break;
    } catch (err: any) {
      if (retries === 1) throw err;
      console.warn(`Wallet not ready, retrying… (${retries - 1} left)`, err?.message);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // ── ZK config provider ───────────────────────────────────────────────────
  const zkConfigUrl = new URL(zkPath, window.location.origin).toString();
  const zkConfigProvider = new FetchZkConfigProvider(zkConfigUrl, fetch.bind(globalThis));

  // ── Proof provider — delegate proving to the 1AM wallet ─────────────────
  //    getProvingProvider bridges our ZK keys into the wallet's WASM prover.
  //    The wallet popup fires during prove() when the user is asked to confirm.
  const keyMaterialProvider = {
    getZKIR: (loc: string) =>
      zkConfigProvider.getZKIR(loc as any) as Promise<Uint8Array>,
    getProverKey: (loc: string) =>
      zkConfigProvider.getProverKey(loc as any) as Promise<Uint8Array>,
    getVerifierKey: (loc: string) =>
      zkConfigProvider.getVerifierKey(loc as any) as Promise<Uint8Array>,
  };
  const provingProvider = await walletApi.getProvingProvider(keyMaterialProvider);
  const proofProvider = createProofProvider(provingProvider);

  // ── Wallet provider ──────────────────────────────────────────────────────
  //    balanceTx receives an UnboundTransaction (WASM object with .serialize()).
  //    The wallet's balanceUnsealedTransaction expects a hex string, so we
  //    serialize first. This is where the wallet popup will appear.
  const walletProvider = {
    getCoinPublicKey: () => coinPublicKeyStr,
    getEncryptionPublicKey: () => encPublicKeyStr,

    balanceTx: async (tx: any) => {
      // Serialize the WASM UnboundTransaction → hex string
      const serialized: Uint8Array = typeof tx.serialize === 'function'
        ? tx.serialize()
        : tx;
      const hexTx = toHex(serialized);

      // Send to wallet for balancing + signing → triggers popup
      let result: any;
      if (typeof walletApi.balanceUnsealedTransaction === 'function') {
        result = await walletApi.balanceUnsealedTransaction(hexTx, { payFees: true });
      } else if (typeof walletApi.balanceSealedTransaction === 'function') {
        result = await walletApi.balanceSealedTransaction(hexTx, { payFees: true });
      } else if (typeof walletApi.balanceTransaction === 'function') {
        result = await walletApi.balanceTransaction(hexTx);
      } else {
        throw new Error('No balance transaction method found on walletApi');
      }
      // The wallet returns { tx: string } — extract the string
      return typeof result === 'string' ? result : result?.tx ?? result;
    },

    submitTx: async (tx: any) => {
      return walletApi.submitTransaction(typeof tx === 'string' ? tx : toHex(tx));
    },
  };

  // ── Midnight provider ─────────────────────────────────────────────────────
  const midnightProvider = {
    submitTx: async (tx: any) => {
      return walletApi.submitTransaction(typeof tx === 'string' ? tx : toHex(tx));
    },
  };

  const privateStateProvider = createPrivateStateProvider();
  const publicDataProvider = indexerPublicDataProvider(
    config.indexerUri,
    config.indexerWsUri,
  );

  return {
    unshieldedAddress,
    config,
    walletApi,
    providers: {
      walletProvider,
      midnightProvider,
      proofProvider,
      zkConfigProvider,
      privateStateProvider,
      publicDataProvider,
    },
  };
}
