import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PromptBench",
  description: "LLM evaluation workbench",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="flex gap-6 border-b border-gray-800 px-8 py-3 text-sm">
          <Link href="/" className="font-semibold">
            PromptBench
          </Link>
          <Link href="/test-sets">Test sets</Link>
          <Link href="/prompts">Prompts</Link>
          <Link href="/runs">Runs</Link>
          <Link href="/results">Results</Link>
          <Link href="/playground">Playground</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
