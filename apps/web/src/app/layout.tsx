import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "세상을 발견하는 솔직한 방법, 폴리아",
  description: "첫 감각이 가장 솔직한 마음!",
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
        <div className="max-w-lg min-h-screen mx-auto">{children}</div>
      </body>
    </html>
  );
}
