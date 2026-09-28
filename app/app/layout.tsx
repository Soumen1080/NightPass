import { WalletProvider } from '@/lib/WalletContext';
import AppNavbar from '@/components/AppNavbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <div className="min-h-screen flex flex-col relative bg-[#07050d] text-zinc-100 selection:bg-purple-500 selection:text-white">
        {/* Subtle Ambient Glow Elements */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="fixed bottom-0 right-0 w-[500px] h-[300px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
        
        <AppNavbar />
        
        <main className="flex-1 flex flex-col pt-24 pb-12 relative z-10">
          {children}
        </main>
      </div>
    </WalletProvider>
  );
}
