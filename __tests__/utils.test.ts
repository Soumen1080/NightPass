/**
 * Tests for lib/utils.ts utility functions.
 */
import {
  truncateAddress,
  formatRelativeTime,
  isValidContractAddress,
  clamp,
  getExplorerUrl,
} from '../lib/utils';

describe('truncateAddress', () => {
  it('returns empty string for empty input', () => {
    expect(truncateAddress('')).toBe('');
  });

  it('truncates a long address correctly', () => {
    const addr = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const result = truncateAddress(addr);
    expect(result).toBe('abcdef...7890');
  });

  it('returns address as-is if shorter than prefix+suffix', () => {
    const addr = 'abc123';
    expect(truncateAddress(addr, 6, 4)).toBe('abc123');
  });

  it('uses custom prefix and suffix lengths', () => {
    const addr = '0x1234567890abcdef';
    const result = truncateAddress(addr, 4, 4);
    expect(result).toBe('0x12...cdef');
  });
});

describe('isValidContractAddress', () => {
  it('returns true for a valid 64-char hex address', () => {
    const addr = '5ee45743bda79990b937f48e78594b4d5391cc4a15b27dc997d3591972ac6a24';
    expect(isValidContractAddress(addr)).toBe(true);
  });

  it('returns false for an address that is too short', () => {
    expect(isValidContractAddress('abc123')).toBe(false);
  });

  it('returns false for non-hex characters', () => {
    const addr = 'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ';
    expect(isValidContractAddress(addr)).toBe(false);
  });

  it('handles addresses with leading/trailing spaces', () => {
    const addr = '  5ee45743bda79990b937f48e78594b4d5391cc4a15b27dc997d3591972ac6a24  ';
    expect(isValidContractAddress(addr)).toBe(true);
  });
});

describe('clamp', () => {
  it('clamps values within range', () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(0, 1, 10)).toBe(1);
    expect(clamp(15, 1, 10)).toBe(10);
  });
});

describe('getExplorerUrl', () => {
  const addr = '5ee45743bda79990b937f48e78594b4d5391cc4a15b27dc997d3591972ac6a24';

  it('returns preprod explorer URL by default', () => {
    const url = getExplorerUrl(addr);
    expect(url).toContain('explorer.midnight.network');
    expect(url).toContain(addr);
  });

  it('returns preview explorer URL for preview network', () => {
    const url = getExplorerUrl(addr, 'preview');
    expect(url).toContain('preview.midnight.network');
  });
});
