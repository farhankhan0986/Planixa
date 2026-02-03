"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Something went wrong");
        toast.error(data.message || "Something went wrong");
        return;
      }

      router.refresh();
      router.push("/dashboard");
      toast.success("Login successful!");
    } catch {
      setError("Internal Server Error, please try again later.");
      toast.error("Internal Server Error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0f1115] to-black px-4">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass w-full max-w-md p-8 flex flex-col gap-5"
      >
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-2xl font-semibold text-center text-gradient"
        >
          Welcome Back
        </motion.h2>

        <p className="text-sm text-center text-zinc-400">
          Sign in to continue to your dashboard
        </p>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg"
          >
            {error}
          </motion.p>
        )}

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-300">Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="h-12 px-4 rounded-lg bg-[#0f1115] border border-white/10 text-zinc-200
            focus:outline-none focus:border-emerald-400/60 transition"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-300">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="h-12 w-full px-4 pr-10 rounded-lg bg-[#0f1115] border border-white/10 text-zinc-200
              focus:outline-none focus:border-emerald-400/60 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
            >
              👁
            </button>
          </div>
        </div>

        {/* Remember / Forgot */}
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-emerald-500" />
            Remember me
          </label>
          <span className="hover:text-emerald-400 cursor-pointer transition">
            Forgot password?
          </span>
        </div>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className={`h-12 rounded-lg font-medium transition-all
          ${
            loading
              ? "bg-zinc-700 cursor-not-allowed"
              : "bg-linear-to-r from-emerald-500 to-amber-500 hover:brightness-110 text-black"
          }`}
        >
          {loading ? "Signing in..." : "Sign In"}
        </motion.button>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-400">
          Don&apos;t have an account?
          <a
            href="/signup"
            className="ml-1 text-emerald-400 hover:text-emerald-300 transition"
          >
            Sign Up
          </a>
        </p>
      </motion.form>
    </div>
  );
}
