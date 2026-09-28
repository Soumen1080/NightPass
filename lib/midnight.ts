import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { createProofProvider } from '@midnight-ntwrk/midnight-js-types';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

export type NetworkName = 'preprod' | 'preview';

export const DEFAULT_NETWORK: NetworkName =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_NETWORK_ID as NetworkName) || 'preprod';

export const CRYPTO_NETWORK: NetworkName = DEFAULT_NETWORK;

let _networkIdSet = false;
export function ensureNetworkId() {
  if (!_networkIdSet) {
    try {
      setNetworkId(CRYPTO_NETWORK);
      _networkIdSet = true;
    } catch (e) {
      console.warn('Network ID already configured or error setting network ID:', e);
    }
  }
}

export interface NetworkConfig {
  networkId: NetworkName;
  indexerUri: string;
  indexerWsUri: string;
  proofServerUri: string;
}

export const NETWORKS: Record<NetworkName, NetworkConfig> = {
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

export function getDefaultIndexerUri(): string {
  return NETWORKS[DEFAULT_NETWORK]?.indexerUri || 'https://indexer.preprod.midnight.network/api/v4/graphql';
}

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

// ─── Helpers ────────────────────────────────────────────────────────────────

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
 * Detect and return Midnight wallet API from window.midnight.
 * Checks for 1AM, Lace (mnLace), or any injected provider.
 */
export async function detectWallet(timeoutMs = 4000): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('Wallet detection can only run in the browser.');
  }

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const w = (window as any).midnight;
    if (w) {
      if (w['1am']) return w['1am'];
      if (w['mnLace']) return w['mnLace'];
      const first = Object.values(w)[0];
      if (first) return first;
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  throw new Error(
    'No Midnight wallet detected. Please install and unlock the 1AM or Lace wallet extension, then refresh.'
  );
}

// ─── Private State Provider ─────────────────────────────────────────────────

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

// ─── Poll / Query For State ─────────────────────────────────────────────────

export async function pollForState(
  queryUrl: string,
  contractAddress: string,
  { retries = 3, delayMs = 1000 }: { retries?: number; delayMs?: number } = {},
): Promise<string> {
  let lastError: string | null = null;
  const endpoint = queryUrl || getDefaultIndexerUri();

  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(endpoint, {
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

          if (json?.errors?.length) {
            lastError = json.errors[0].message;
          }
        }
      } else {
        lastError = `HTTP ${res.status}`;
      }
    } catch (e: any) {
      lastError = e?.name === 'AbortError' ? 'Request timed out' : e?.message ?? String(e);
    }

    if (i < retries - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  throw new Error(
    `No contract state found at address "${contractAddress}".` +
    (lastError ? ` (${lastError})` : '')
  );
}

// ─── Create Connected Session ───────────────────────────────────────────────

export async function createConnectedSession(
  walletApi: any,
  zkPath: string,
  network: NetworkName = DEFAULT_NETWORK,
): Promise<ConnectedSession> {
  ensureNetworkId();

  const config = { ...NETWORKS[network] };
  if (!config) {
    throw new Error(`Unknown network "${network}". Expected "preprod" or "preview".`);
  }

  // Attempt to use custom configuration from wallet if available
  if (typeof walletApi.getConfiguration === 'function') {
    try {
      const walletConfig = await walletApi.getConfiguration();
      if (walletConfig?.indexerUri) config.indexerUri = walletConfig.indexerUri;
      if (walletConfig?.indexerWsUri) config.indexerWsUri = walletConfig.indexerWsUri;
      if (walletConfig?.proofServerUri) config.proofServerUri = walletConfig.proofServerUri;
    } catch {
      // Use defaults
    }
  }

  let coinPublicKeyStr = '';
  let encPublicKeyStr = '';
  let unshieldedAddress = '';

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
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Safe origin resolution
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const zkConfigUrl = new URL(zkPath, origin).toString();
  const zkConfigProvider = new FetchZkConfigProvider(zkConfigUrl, fetch.bind(globalThis));

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

  const walletProvider = {
    getCoinPublicKey: () => coinPublicKeyStr,
    getEncryptionPublicKey: () => encPublicKeyStr,

    balanceTx: async (tx: any) => {
      const serialized: Uint8Array = typeof tx.serialize === 'function' ? tx.serialize() : tx;
      const hexTx = toHex(serialized);

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
      return typeof result === 'string' ? result : result?.tx ?? result;
    },

    submitTx: async (tx: any) => {
      return walletApi.submitTransaction(typeof tx === 'string' ? tx : toHex(tx));
    },
  };

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
