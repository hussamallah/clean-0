import { GeistSans } from "geist/font/sans";
import { Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react";
import "./../styles/globals.css";

import TopNav from "@/components/TopNav";
import GlobalMenu from "@/components/GlobalMenu";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  title: "Point Zero",
  description: "Understand how you operate in 7 minutes — a clear personality profile and identity blueprint.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${fraunces.variable}`}>
      <body className={`${GeistSans.className} bg-canvas text-ink antialiased`}>
        <Suspense fallback={null}>
          <TopNav />
        </Suspense>
        <GlobalMenu />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
