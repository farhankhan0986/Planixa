"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/v1/auth/me", { credentials: "include" });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data.loggedIn ? data.user : null);
      } catch {
        toast.error("Failed to load user data");
        setUser(null);
      }
    };
    fetchMe();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/v1/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        router.push("/login");
        toast.success("Logged out successfully");
      }
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Logout failed");
    }
  };

  /* Hide navbar on auth pages — they have their own header */
  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50"
      style={{
        background: 'var(--ink)',
        borderBottom: '1px solid var(--rule)',
        height: '3.5rem',
      }}
    >
      <div className="h-full px-6 lg:px-10 flex items-center justify-between">
        {/* Logo — monospace, amber dot as a brand mark */}
        <Link href="/" className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: 'var(--amber)' }}
          />
          <span
            className="text-sm font-semibold tracking-wide"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            Planixa
          </span>
        </Link>

        {/* Right navigation — monospace link strip */}
        <div className="flex items-center gap-5">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-action"
                style={{
                  color: pathname === "/dashboard" ? 'var(--amber)' : 'var(--text-muted)',
                }}
              >
                Dashboard
              </Link>

              <Link
                href="/tasks"
                className="text-action"
                style={{
                  color: pathname === "/tasks" ? 'var(--amber)' : 'var(--text-muted)',
                }}
              >
                Tasks
              </Link>

              {/* Separator rule */}
              <span
                className="hidden sm:block w-px h-4"
                style={{ background: 'var(--rule-strong)' }}
              />

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                className="text-action"
                style={{ color: 'var(--text-faint)' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--danger)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-faint)'}
              >
                Logout
              </motion.button>
            </>
          ) : (
            <Link href="/login" className="btn-primary" style={{ height: '2rem', fontSize: '0.6875rem', padding: '0 1rem' }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
