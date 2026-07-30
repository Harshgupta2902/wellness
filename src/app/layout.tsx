import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manovyatha - Employee Wellness Platform",
  description:
    "AI-powered employee wellness assessment and insights platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
