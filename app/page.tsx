import Link from 'next/link';

const TICKER_ITEMS = [
  'Zero-Knowledge Privacy', '✦', 'Private RSVPs', '✦',
  'On-Chain Verification', '✦', 'Midnight Network', '✦',
  'ZK Proofs', '✦', 'Anonymous Attendance', '✦',
  'Zero-Knowledge Privacy', '✦', 'Private RSVPs', '✦',
  'On-Chain Verification', '✦', 'Midnight Network', '✦',
  'ZK Proofs', '✦', 'Anonymous Attendance', '✦',
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-body bg-[#100818]">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4"
        style={{ background: 'linear-gradient(to bottom, rgba(16,8,24,0.95), transparent)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-display text-xl font-bold tracking-tight text-white">NightPass</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-zinc-400 border border-white/8 bg-black/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>
            Preview Network
          </div>
          <Link href="/app" className="glow-button px-5 py-2 rounded-full text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-gradient-to-r from-brand to-brand-dark">
            Launch App
          </Link>
        </div>
      </header>

      {/* ── Hero Split Layout ──────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 sm:px-10 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
        
        {/* Left Side: Text Content */}
        <div className="flex-1 text-center lg:text-left z-10 fade-in">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse inline-block"></span>
            Built on Midnight Network
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6"
            style={{ background: 'linear-gradient(135deg, #ffffff 20%, #c084fc 60%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            The Party That<br />
            <span style={{ background: 'linear-gradient(90deg, #a855f7, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Stays Private</span>
          </h1>

          <p className="text-zinc-400 text-lg sm:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed mb-10">
            RSVPs secured by Zero-Knowledge proofs. Your identity is invisible on the ledger until you step through the door and check in.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link href="/app/organize" className="glow-button w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] bg-gradient-to-r from-brand to-brand-dark text-center">
              Organize an Event
            </Link>
            <Link href="/app/join" className="glow-button w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)] bg-cyan-900/20 border border-cyan-400/30 text-center">
              Join an Event
            </Link>
          </div>
        </div>

        {/* Right Side: Visuals/Effects */}
        <div className="flex-1 relative w-full max-w-lg lg:max-w-none flex justify-center lg:justify-end fade-in float">
          {/* Decorative Orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-30 blur-[100px]"
            style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}></div>
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-20 blur-[80px]"
            style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)' }}></div>
          
          {/* Glass Mockup Card */}
          <div className="glass-card relative z-10 w-full max-w-md p-6 border border-white/10" style={{ background: 'rgba(30,14,50,0.4)' }}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Live Status</span>
              <span className="px-3 py-1 bg-brand/20 text-brand-hover text-[10px] font-bold uppercase rounded-full border border-brand/30">Ready</span>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Total RSVPs</div>
                  <div className="text-2xl font-display font-bold text-white">142<span className="text-sm text-zinc-600 font-normal">/200</span></div>
                </div>
                <div className="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center text-brand">🎟️</div>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Checked In</div>
                  <div className="text-2xl font-display font-bold text-white">0</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-cyan-900/30 flex items-center justify-center text-cyan-400">🚪</div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <span className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500">
                <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                Zero-Knowledge Proof Verified
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ─────────────────────────────────────────────── */}
      <div className="w-full overflow-hidden py-4 border-y border-white/5 bg-black/40">
        <div className="marquee-track">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} className="px-5 text-sm font-semibold tracking-widest uppercase whitespace-nowrap"
              style={{ color: item === '✦' ? '#a855f7' : '#6b7280' }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Features Section ───────────────────────────────────── */}
      <section className="py-24 px-6 sm:px-10 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">NightPass uses the Midnight blockchain to separate the public facts of an event from the private identities of the attendees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🚀', title: '1. Deploy', desc: 'Organizers deploy a smart contract defining the max guest list and entry fee. You get a unique contract address.' },
            { icon: '🕵️', title: '2. Private RSVP', desc: 'Attendees use the address to RSVP. A Zero-Knowledge proof secures your spot without revealing your wallet address.' },
            { icon: '✅', title: '3. Check-In', desc: 'When the party starts, attendees check in at the door. Only then is the entry fee paid and your identity revealed.' },
          ].map((feature, idx) => (
            <div key={idx} className="glass-card p-8 bg-card border-border hover:border-brand-glow transition-all">
              <div className="text-4xl mb-6">{feature.icon}</div>
              <h3 className="text-xl font-display font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Privacy Note ───────────────────────────────────────── */}
      <section className="py-16 px-6 sm:px-10 max-w-4xl mx-auto text-center">
        <div className="p-10 rounded-3xl border border-brand/20 bg-gradient-to-b from-brand/10 to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-brand to-transparent"></div>
          <h2 className="font-display text-2xl font-bold text-white mb-4">The Privacy Advantage</h2>
          <p className="text-zinc-300 leading-relaxed">
            In standard Web3 ticketing, everyone can see who is attending a party on the public ledger. With <strong>NightPass</strong>, 
            your intent to attend is stored as a cryptographic commitment. Nobody—not even the organizer—knows exactly who holds the RSVPs until the doors open.
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-white/5 bg-black/60 py-8 text-center text-xs text-zinc-600 tracking-widest uppercase">
        NightPass · Built on Midnight Network · 2026
      </footer>

    </div>
  );
}

