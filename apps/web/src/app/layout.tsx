import { GoogleAnalytics } from "@/components/common/GoogleAnalytics";
import { clientConfig } from "@/rollbar";
import { Provider as RollbarProvider } from "@rollbar/react";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "세상을 발견하는 솔직한 방법, 폴리아",
  description: "첫 감각이 가장 솔직한 마음!",
  icons: {
    icon: [
      { url: "/images/favicon-32.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/images/favicon-48.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  },
  openGraph: {
    title: "세상을 발견하는 솔직한 방법, 폴리아",
    description: "첫 감각이 가장 솔직한 마음!",
    images: ["/images/opengraph.png"],
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RollbarProvider config={clientConfig}>
      <html lang="ko">
        <head>
          <link
            href="https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css"
            rel="stylesheet"
          />
        </head>
        <body className="antialiased">
          <GoogleAnalytics />
          {children}
        </body>
      </html>
    </RollbarProvider>
  );
}
