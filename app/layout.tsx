import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveCommodityTicker from '@/components/LiveCommodityTicker';

export const metadata: Metadata = {
  title: 'BUILDMART | Heavy Industrial Materials & Equipment Marketplace',
  description: 'First-party and verified vendor construction materials, structural steel Fe 550D, OPC 53 cement, heavy plant machinery, and project bulk engineering procurement.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Inline chunk error recovery to prevent stale HMR chunk timeout crashes */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                var msg = (e && e.message) || '';
                if (msg.indexOf('ChunkLoadError') !== -1 || msg.indexOf('Loading chunk') !== -1 || (msg.indexOf('timeout: http') !== -1 && msg.indexOf('_next/static/chunks') !== -1)) {
                  console.warn('Recovering from dynamic chunk timeout:', msg);
                  if (!window.__chunkReloaded) {
                    window.__chunkReloaded = true;
                    setTimeout(function() { window.location.reload(); }, 300);
                  }
                }
              }, true);
            `,
          }}
        />
      </head>
      <body className="bg-industrial-950 text-industrial-100 flex flex-col min-h-screen font-sans selection:bg-safety-orange selection:text-white">
        <AppProvider>
          <Navbar />
          <LiveCommodityTicker />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
