import type { Metadata } from "next";
import { Poppins, Merriweather } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ClientAuthDebug from "@/components/debug/ClientAuthDebug";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ['400', '700'],
  variable: '--font-merriweather',
});

export const metadata: Metadata = {
  title: "BookStore | Your Online Book Shop",
  description: "Discover your next favorite book at BookStore - the ultimate destination for book lovers with a vast collection of titles across all genres.",
  keywords: "books, online bookstore, ebooks, reading, literature, fiction, non-fiction",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${merriweather.variable}`}>
      <body className={`${poppins.className} m-0 p-0`}>
        <Providers>
          {children}
          <ClientAuthDebug />
        </Providers>
      </body>
    </html>
  );
}
