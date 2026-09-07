import './globals.css';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import { AppProvider } from '@/contexts/AppContext';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  title: 'Driving License Form — Gujarat, Rajasthan & Uttar Pradesh',
  description: 'Apply for Learner Licence, New Driving Licence, Renewal, Duplicate DL and more. Guided step-by-step application with document assistance for Gujarat, Rajasthan and Uttar Pradesh.',
  keywords: 'driving licence, learner licence, RTO, Gujarat, Rajasthan, Uttar Pradesh, DL application, renewal, duplicate',
  openGraph: {
    title: 'Driving License Form — Your Driving Licence Application, Made Simple',
    description: 'Prepare your licence application with guided steps, document assistance and a clear application process.',
    type: 'website',
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
          <Header />
          <main id="main-content" className="page-wrapper">
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
