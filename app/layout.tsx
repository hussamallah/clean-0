export const metadata = {
  title: "Ground Zero — Per-Domain Assessment",
  description: "Deterministic Big Five per-domain assessment",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  }
};

import "../styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}


