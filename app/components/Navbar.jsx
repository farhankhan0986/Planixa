"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data.loggedIn ? data.user : null);
      } catch {
        setUser(null);
      }
    };
    fetchMe();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-semibold tracking-wide text-gradient"
          >
            <span className="font-bold">Plan</span>ixa
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-6 text-sm">
            {user ? (
              <>
                <motion.div whileHover={{ y: -1 }}>
                  <Link
                    href="/dashboard"
                    className={`transition ${
                      pathname === "/dashboard"
                        ? "text-emerald-400"
                        : "text-zinc-300 hover:text-zinc-100"
                    }`}
                  >
                    Dashboard
                  </Link>
                </motion.div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-black font-medium
                  bg-linear-to-r from-emerald-500 to-amber-500
                  hover:brightness-110 transition"
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <motion.div whileHover={{ y: -1 }}>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-black font-medium
                  bg-linear-to-r from-emerald-500 to-amber-500
                  hover:brightness-110 transition"
                >
                  Login
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
