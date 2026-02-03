import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "./components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Anything AI",
  description: "Your AI-powered task management assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-zinc-100`}
      >
        {/* Ambient background glow */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
        </div>

        <Navbar />

        {/* Main content wrapper */}
        <main className="relative min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
