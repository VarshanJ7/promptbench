import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Nav } from "@/components/Nav";
import AuthStatus from "./AuthStatus";
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
      <body className="flex min-h-full flex-col bg-canvas text-sm text-fg">
        <Nav
          auth={
            <Suspense
              fallback={
                <span className="h-6 w-20 animate-pulse rounded-full bg-surface-raised" />
              }
            >
              <AuthStatus />
            </Suspense>
          }
        />
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {children}
        </div>
      </body>
    </html>
  );
}
