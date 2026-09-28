/**
 * NightPass Utility Functions
 * General-purpose helper utilities used across the application.
 */

/**
 * Truncates a blockchain address for display.
 * Example: "0x1234...5678"
 */
export function truncateAddress(address: string, prefixLen = 6, suffixLen = 4): string {
  if (!address) return '';
  if (address.length <= prefixLen + suffixLen) return address;
  return `${address.slice(0, prefixLen)}...${address.slice(-suffixLen)}`;
}

/**
 * Formats a DUST/tNIGHT amount from its raw representation.
 * Midnight uses micro-units (1 tNIGHT = 1,000,000 micro-tNIGHT).
 */
export function formatTokenAmount(amount: bigint | number, symbol = 'tNIGHT'): string {
  const raw = typeof amount === 'bigint' ? Number(amount) : amount;
  const formatted = (raw / 1_000_000).toFixed(2);
  return `${formatted} ${symbol}`;
}

/**
 * Formats a Date object or ISO string into a human-readable relative time.
 * E.g.: "2 hours ago", "in 3 days"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const absDiff = Math.abs(diffMs);
  const isPast = diffMs < 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let timeStr: string;
  if (seconds < 60) timeStr = `${seconds}s`;
  else if (minutes < 60) timeStr = `${minutes}m`;
  else if (hours < 24) timeStr = `${hours}h`;
  else timeStr = `${days}d`;

  return isPast ? `${timeStr} ago` : `in ${timeStr}`;
}

/**
 * Sleeps for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Copies text to clipboard, returns true on success.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates that a string looks like a Midnight contract address (64 hex chars).
 */
export function isValidContractAddress(address: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(address.trim());
}

/**
 * Clamps a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Returns the Midnight Preprod explorer URL for a given contract address.
 */
export function getExplorerUrl(contractAddress: string, network = 'preprod'): string {
  const base =
    network === 'preview'
      ? 'https://explorer.preview.midnight.network'
      : 'https://explorer.midnight.network';
  return `${base}/contracts/${contractAddress}`;
}
