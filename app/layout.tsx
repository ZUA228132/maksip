import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "SIP Callcenter Dashboard",
  description: "Панель управления колл-центром для SIP-телефонии"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
