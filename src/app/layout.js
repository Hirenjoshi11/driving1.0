import './globals.css';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import { AppProvider } from '@/contexts/AppContext';
import PortalLayout from '@/components/PortalLayout';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://drivinglicenseform.com'),
  title: 'Driving License Form — Gujarat, Rajasthan & Uttar Pradesh',
  description: 'Apply for a Learner Licence or New Driving Licence. Guided step-by-step application with document assistance for Gujarat, Rajasthan and Uttar Pradesh.',
  keywords: 'driving licence, learner licence, RTO, Gujarat, Rajasthan, Uttar Pradesh, DL application, new licence',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/logo-app.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Driving License Form — Your Driving Licence Application, Made Simple',
    description: 'Prepare your licence application with guided steps, document assistance and a clear application process.',
    type: 'website',
    images: [
      {
        url: '/logo-website.png',
        width: 1024,
        height: 330,
        alt: 'Driving License Form',
      },
    ],
  },
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get('dlf_lang')?.value || 'en';

  return (
    <html lang={lang} className={inter.className}>
      <body className={inter.className}>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <AppProvider initialLang={lang}>
          <PortalLayout>
            {children}
          </PortalLayout>
        </AppProvider>
      </body>
    </html>
  );
}
