import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteSmith — one-page websites, filled in by AI",
  description:
    "Pick a template, answer four questions, and get a finished one-page website you can edit and download.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
