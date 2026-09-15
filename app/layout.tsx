import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import PwaRegister from "./pwa-register";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI 퀴즈 생성기",
  description: "OpenAI 로 문제를 만들고 Neon 에 저장하는 객관식 퀴즈 앱",
  applicationName: "AI 퀴즈",
  appleWebApp: { capable: true, title: "AI 퀴즈", statusBarStyle: "black-translucent" },
  icons: { apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4f46e5" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0f" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PwaRegister />
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
            <Link href="/" className="text-base font-semibold tracking-tight">
              AI 퀴즈 생성기
            </Link>
            <span className="text-xs text-muted">OpenAI × Neon × Vercel</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">{children}</main>
        <footer className="border-t border-border">
          <div className="mx-auto max-w-3xl px-5 py-4 text-xs text-muted">
            문제는 생성형 AI 가 만들며 사실과 다를 수 있습니다.
          </div>
        </footer>
      </body>
    </html>
  );
}
