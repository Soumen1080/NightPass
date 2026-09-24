import { generateSecret, saveSecret, loadSecret } from '../lib/secret';

jest.mock('../lib/midnight', () => ({
  toHex: (arr: Uint8Array) => Buffer.from(arr).toString('hex'),
  fromHex: (hex: string) => new Uint8Array(Buffer.from(hex, 'hex'))
}));

const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem: function (key: string) {
      return store[key] || null;
    },
    setItem: function (key: string, value: string) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    },
    removeItem: function (key: string) {
      delete store[key];
    }
  };
})();

import { webcrypto } from 'crypto';
Object.defineProperty(global, 'crypto', {
  value: webcrypto
});

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

describe('Secret utilities', () => {
  beforeEach(() => {
    global.localStorage.clear();
  });

  it('should generate a 32 byte secret', () => {
    const secret = generateSecret();
    expect(secret).toBeInstanceOf(Uint8Array);
    expect(secret.length).toBe(32);
  });

  it('should save and load a secret properly', () => {
    const secret = generateSecret();
    saveSecret('organizer', 'test-party', secret);
    
    const loaded = loadSecret('organizer', 'test-party');
    expect(loaded).toBeInstanceOf(Uint8Array);
    expect(loaded).toEqual(secret);
  });

  it('should return null when loading a non-existent secret', () => {
    const loaded = loadSecret('organizer', 'non-existent');
    expect(loaded).toBeNull();
  });
});
