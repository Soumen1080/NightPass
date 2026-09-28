import { createUnprovenDeployTx, submitCallTxAsync, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { getCompiledContract, getLedger, sampleSigningKey, ContractState } from '../contract/src/index';
import type { ConnectedSession } from './midnight';
import { fromHex, pollForState, CRYPTO_NETWORK, getDefaultIndexerUri } from './midnight';
import { bech32ToUserAddress } from './address';

const PRIVATE_STATE_ID = 'PrivatePartyState';
export const ZK_PATH = '/zk/private-party';

const PARTY_STATE_NAMES = [
  'NOT_STARTED',
  'READY',
  'STARTED',
  'DOORS_CLOSED',
  'FEES_CLAIMED',
] as const;

function setSize(value: unknown): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object' && 'size' in value) {
    const size = (value as { size: unknown }).size;
    if (typeof size === 'function') return Number((size as () => number)());
    if (typeof size === 'number') return size;
  }
  return 0;
}

export type DeployResult = {
  contractAddress: string;
  txHash: string;
};

export async function deployParty(
  session: ConnectedSession,
  partySize: number,
  entryFeeStars: number,
  organizerSecret: Uint8Array,
): Promise<DeployResult> {
  const cc = await getCompiledContract();
  const deployTxData = await (createUnprovenDeployTx as any)(
    {
      zkConfigProvider: session.providers.zkConfigProvider,
      walletProvider: session.providers.walletProvider,
    },
    {
      compiledContract: cc,
      args: [BigInt(partySize), BigInt(entryFeeStars), organizerSecret],
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: {},
      signingKey: sampleSigningKey(),
    },
  );

  const contractAddress = deployTxData.public.contractAddress;
  const txHash = await (submitTxAsync as any)(session.providers, { unprovenTx: deployTxData.private.unprovenTx });
  console.log('[NightPass] Deploy transaction submitted! Tx Hash:', txHash, 'Contract Address:', contractAddress);

  await session.providers.privateStateProvider.setContractAddress(contractAddress);
  await session.providers.privateStateProvider.set(PRIVATE_STATE_ID, {});
  await session.providers.privateStateProvider.setSigningKey(
    contractAddress,
    deployTxData.private.signingKey,
  );

  // Poll for the newly deployed contract on the indexer with enough retries to confirm block inclusion
  try {
    await pollForState(session.config.indexerUri, contractAddress, { retries: 25, delayMs: 1500 });
  } catch (pollErr) {
    console.warn('Initial post-deploy poll warning (contract will index shortly):', pollErr);
  }

  return { contractAddress, txHash: typeof txHash === 'string' ? txHash : String(txHash) };
}

async function call(
  session: ConnectedSession,
  contractAddress: string,
  circuitId: string,
  args: unknown[],
): Promise<string> {
  const cc = await getCompiledContract();

  await session.providers.privateStateProvider.setContractAddress(contractAddress);
  const existingState = await session.providers.privateStateProvider.get(PRIVATE_STATE_ID);
  if (!existingState) {
    await session.providers.privateStateProvider.set(PRIVATE_STATE_ID, {});
  }

  const txHash = await (submitCallTxAsync as any)(session.providers, {
    compiledContract: cc,
    contractAddress,
    circuitId,
    args,
    privateStateId: PRIVATE_STATE_ID,
  });
  console.log(`[NightPass] Circuit call "${circuitId}" submitted! Tx Hash:`, txHash);
  return typeof txHash === 'string' ? txHash : String(txHash);
}

export const rsvp = (session: ConnectedSession, contractAddress: string, userAddress: { bytes: Uint8Array }, attendeeSecret: Uint8Array) =>
  call(session, contractAddress, 'rsvp', [userAddress, attendeeSecret]);

export const startParty = (session: ConnectedSession, contractAddress: string, organizerSecret: Uint8Array) =>
  call(session, contractAddress, 'startParty', [organizerSecret]);

export const checkIn = (session: ConnectedSession, contractAddress: string, userAddress: { bytes: Uint8Array }, attendeeSecret: Uint8Array) =>
  call(session, contractAddress, 'checkIn', [userAddress, attendeeSecret]);

export const closeEntry = (session: ConnectedSession, contractAddress: string, organizerSecret: Uint8Array) =>
  call(session, contractAddress, 'closeEntry', [organizerSecret]);

export const claimFees = (session: ConnectedSession, contractAddress: string, organizerAddress: { bytes: Uint8Array }, organizerSecret: Uint8Array) =>
  call(session, contractAddress, 'claimFees', [organizerAddress, organizerSecret]);

export async function decodePartyState(stateHex: string) {
  try {
    const contractState = ContractState.deserialize(fromHex(stateHex));
    const ledger = await getLedger();
    const l = ledger(contractState.data) as any;
    const stateIdx = Number(l.partyState);
    return {
      partyState: PARTY_STATE_NAMES[stateIdx] ?? `UNKNOWN(${stateIdx})`,
      partyStateIndex: stateIdx,
      maxListSize: Number(l.maxListSize),
      entryFee: Number(l.entryFee),
      rsvpCount: setSize(l.hashedPartyGoers),
      checkedInCount: setSize(l.checkedInParty),
    };
  } catch (err: any) {
    throw new Error(`Failed to decode on-chain contract state: ${err?.message || err}`);
  }
}

export async function fetchPartyState(
  queryUrl?: string,
  contractAddress?: string,
  options?: { retries?: number; delayMs?: number },
) {
  if (!contractAddress) throw new Error('Contract address is required');
  const endpoint = queryUrl || getDefaultIndexerUri();
  const hex = await pollForState(endpoint, contractAddress, options ?? { retries: 2, delayMs: 800 });
  return decodePartyState(hex);
}

export function userAddressFromSession(session: ConnectedSession) {
  return bech32ToUserAddress(session.unshieldedAddress, CRYPTO_NETWORK);
}
