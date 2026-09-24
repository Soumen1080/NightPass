import { WalletProvider } from '@/lib/WalletContext';
import AppNavbar from '@/components/AppNavbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <AppNavbar />
      <div className="min-h-screen flex flex-col pt-24 pb-12">
        {children}
      </div>
    </WalletProvider>
  );
}

