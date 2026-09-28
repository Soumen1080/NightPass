import { MidnightBech32m, UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';

export function bech32ToUserAddress(bech32: string, networkId: string): { bytes: Uint8Array } {
  try {
    const parsed = MidnightBech32m.parse(bech32).decode(UnshieldedAddress, networkId);
    return { bytes: new Uint8Array(parsed.data) };
  } catch (err: any) {
    // If strict network decoding fails, try decoding without network restriction or with alternative network
    try {
      const altNetwork = networkId === 'preprod' ? 'preview' : 'preprod';
      const parsedAlt = MidnightBech32m.parse(bech32).decode(UnshieldedAddress, altNetwork);
      return { bytes: new Uint8Array(parsedAlt.data) };
    } catch {
      throw new Error(`Failed to decode Midnight address "${bech32}": ${err?.message || err}`);
    }
  }
}
