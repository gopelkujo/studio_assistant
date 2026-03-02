import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Studio Assistant',
  description: 'AI-powered internal tool for game studios',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-zinc-950 text-zinc-50 h-screen w-screen overflow-hidden flex font-sans">
        {children}
      </body>
    </html>
  );
}
