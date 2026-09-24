// Isomorphic WS is a dependency of the Midnight SDK. In browser environments,
// it tries to use the native WebSocket. In Node, it uses the 'ws' package.
// Next.js static generation can get confused. This forces it to resolve cleanly.
const WS = typeof window !== 'undefined' ? window.WebSocket : null;
export default WS;
export const WebSocket = WS;
