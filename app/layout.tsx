import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thống kê sản lượng Chinh Thái - Tam Phát",
  description: "Enterprise production dashboard for Chinh Thái - Tam Phát",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
