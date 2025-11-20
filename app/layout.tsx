import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SIP Callcenter Control",
  description: "Панель управления колл-центром для sip.xho.biz",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
