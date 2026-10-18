import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'BUILDMART | Heavy Construction & Infrastructure Procurement',
  description: 'Industrial e-commerce platform for first-party and verified vendor construction materials, structural steel, cement, plant machinery, and project bulk quotations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-industrial-950 text-industrial-100 flex flex-col min-h-screen">
        <AppProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
