// Isomorphic WS is a dependency of the Midnight SDK. In browser environments,
// it tries to use the native WebSocket. In Node, it uses the 'ws' package.
// Next.js static generation can get confused. This forces it to resolve cleanly.
//
// During SSR / static generation, WebSocket is not available in the global scope.
// We provide a no-op fallback so the import doesn't crash the build.
const WS = typeof globalThis !== 'undefined' && typeof globalThis.WebSocket !== 'undefined'
  ? globalThis.WebSocket
  : (typeof window !== 'undefined' ? window.WebSocket : null);

export default WS;
export const WebSocket = WS;
