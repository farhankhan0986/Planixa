import Navbar from "./components/Navbar";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "Planixa — Precision Task Management",
  description: "A focused, utilitarian task management tool built for clarity.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Navbar />

        {/* Content area — full width, no ambient effects */}
        <main className="relative min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
        <Toaster
          richColors
          toastOptions={{
            style: {
              background: 'var(--surface)',
              border: '1px solid var(--rule)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
            },
          }}
        />
      </body>
    </html>
  );
}
