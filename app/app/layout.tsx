import { WalletProvider } from '@/lib/WalletContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <div className="min-h-screen flex flex-col pt-20 pb-10">
        {children}
      </div>
    </WalletProvider>
  );
}
