export const metadata = {
  title: "Ground Zero — Per-Domain Assessment",
  description: "Deterministic Big Five per-domain assessment",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

import "../styles/globals.css";
import { Suspense } from "react";
import TopNav from "@/components/TopNav";
import AnalyticsWrapper from "@/components/Analytics";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <script src="https://cdn.vercel-insights.com/v1/script.debug.js" data-vercel-analytics="true"></script>
      </head>
      <body>
        <Suspense fallback={null}>
          <TopNav />
        </Suspense>
        {children}
      </body>
    </html>
  );
}


