import type { Metadata } from "next";
import "./globals.css";
import { BottomCTALayout } from "@repo/ui/components";

export const metadata: Metadata = {
  title: "Pollia - 실시간 투표 플랫폼",
  description: "쉽고 빠른 실시간 투표를 만들고 참여하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <BottomCTALayout className="max-w-lg min-h-screen mx-auto">
          {children}
        </BottomCTALayout>
      </body>
    </html>
  );
}
