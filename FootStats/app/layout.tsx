import type { Metadata } from 'next';
import './globals.css';
import { SearchBar } from '@/components/SearchBar';

export const metadata: Metadata = {
  title: 'FootStats',
  description: 'Pesquise jogadores, times e ligas com TheSportsDB'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
          <div className="container-base py-4">
            <SearchBar />
          </div>
        </header>
        <main className="container-base py-8">{children}</main>
      </body>
    </html>
  );
}
