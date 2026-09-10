'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import OtpRelayWatcher from '@/components/OtpRelayWatcher/OtpRelayWatcher';

export default function PortalLayout({ children }) {
  const pathname = usePathname() || '';
  const isConsoleRoute = pathname.startsWith('/admin') || pathname.startsWith('/operator');

  if (isConsoleRoute) {
    // Dedicated isolated console portal: strictly no citizen header or footer
    return (
      <div className="console-portal-wrapper" style={{ minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'clip' }}>
        {children}
      </div>
    );
  }

  // Standard citizen public/user portal
  return (
    <>
      <Header />
      <main id="main-content" className="page-wrapper">
        {children}
      </main>
      <Footer />
      <OtpRelayWatcher />
    </>
  );
}
