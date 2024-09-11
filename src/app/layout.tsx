import type { Metadata } from 'next';

import { UIProvider } from './providers/UIProvider';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'El Gachámetro',
  description: '¿Hace día de gachas? Comprueba la previsión del tiempo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='es'>
      <body className={inter.className}>
        <UIProvider>{children} </UIProvider>
      </body>
    </html>
  );
}
