import React from 'react';

export type TxRecord = {
  id: string;
  type: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
  timestamp: Date;
  contractAddress?: string; // optional — set on Deploy success for direct explorer link
};

function ExternalLinkIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

/** Pulsing loading card shown while a tx is being proved / submitted */
export function TxLoadingCard({ label }: { label: string }) {
  return (
    <div className="p-5 rounded-xl border border-brand/30 bg-brand/5 fade-in flex items-center gap-4 shadow-lg">
      {/* Animated spinner ring */}
      <div className="relative w-10 h-10 shrink-0">
        <div className="absolute inset-0 rounded-full border-2 border-brand/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-brand border-r-brand/40 border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-brand/60 animate-pulse" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-brand uppercase tracking-widest">{label}</h4>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Generating Zero-Knowledge Proof &amp; waiting for wallet confirmation…
        </p>
        {/* progress shimmer bar */}
        <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand/60 via-brand to-cyan-400/60"
            style={{ animation: 'progressShimmer 1.8s ease-in-out infinite' }}
          />
        </div>
      </div>
    </div>
  );
}

export default function TxCard({ tx, network }: { tx: TxRecord; network: string }) {
  const isError = tx.status === 'error';
  const isSuccess = tx.status === 'success';

  // Build the explorer URL — point directly to the contract if we have its address
  const explorerBase =
    network === 'preview'
      ? 'https://explorer.preview.midnight.network'
      : network === 'preprod'
      ? 'https://explorer.preprod.midnight.network'
      : null;

  const explorerUrl = explorerBase
    ? tx.contractAddress
      ? `${explorerBase}/contracts/${tx.contractAddress}`
      : explorerBase
    : null;

  return (
    <div
      className={`p-4 rounded-xl border ${
        isError
          ? 'border-danger/30 bg-danger/10'
          : 'border-success/30 bg-success/10'
      } fade-in flex items-start gap-4 shadow-sm`}
    >
      <div
        className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
          isError ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'
        }`}
      >
        {isError ? '✗' : '✓'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4
            className={`text-sm font-bold ${
              isError ? 'text-danger-200' : 'text-emerald-200'
            } uppercase tracking-widest truncate`}
          >
            {tx.type}
          </h4>
          <span className="text-[10px] text-zinc-500 font-mono shrink-0">
            {tx.timestamp.toLocaleTimeString()}
          </span>
        </div>

        {isError && tx.error && (
          <div className="text-xs text-danger/80 mt-2 font-mono break-words leading-relaxed">
            {tx.error}
          </div>
        )}

        {isSuccess && tx.contractAddress && (
          <div className="mt-2 font-mono text-[10px] text-zinc-400 break-all leading-relaxed">
            <span className="text-zinc-600 mr-1">Contract:</span>
            {tx.contractAddress}
          </div>
        )}

        {isSuccess && explorerUrl && (
          <div className="mt-2">
            <a
              href={explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-200 transition-colors font-medium"
            >
              <ExternalLinkIcon />
              {tx.contractAddress ? 'View Contract on Midnight Explorer' : 'View on Explorer'}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
