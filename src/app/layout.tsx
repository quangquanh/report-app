import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientLayout from "./ClientLayout";
import { ConfigProvider } from "antd";
import './globals.css'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ogival IP Protection",
  description: "Ogival IP Protection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geistSans.variable + " " + geistMono.variable}>
        <ConfigProvider wave={{ disabled: true }}>
          <ClientLayout>{children}</ClientLayout>
        </ConfigProvider>
      </body>
    </html>
  );
}
