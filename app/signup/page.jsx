"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    repeat_password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.repeat_password) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/auth/signup", {
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

      router.push("/login");
      toast.success("Account created successfully! Please log in.");
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
          Create Account
        </motion.h2>

        <p className="text-sm text-center text-zinc-400">
          Join us and start your journey
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

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-300">Name</label>
          <input
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            className="h-12 px-4 rounded-lg bg-[#0f1115] border border-white/10 text-zinc-200
            focus:outline-none focus:border-emerald-400/60 transition"
          />
        </div>

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
              minLength={6}
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

        {/* Confirm Password */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-300">Confirm Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="repeat_password"
            placeholder="••••••••"
            value={formData.repeat_password}
            minLength={6}
            onChange={handleChange}
            className="h-12 px-4 rounded-lg bg-[#0f1115] border border-white/10 text-zinc-200
            focus:outline-none focus:border-emerald-400/60 transition"
          />
        </div>

        <div className="flex items-center justify-between text-sm text-zinc-400">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-emerald-500" required />
            I agree to the <a href="/terms" className="text-emerald-400 hover:text-emerald-300 transition">
              Terms of Service
            </a>
          </label>
          
        </div>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className={`h-12 rounded-lg font-medium transition-all
          ${
            loading
              ? "bg-zinc-700 cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-500 to-amber-500 hover:brightness-110 text-black"
          }`}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </motion.button>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-400">
          Already have an account?
          <a
            href="/login"
            className="ml-1 text-emerald-400 hover:text-emerald-300 transition"
          >
            Sign In
          </a>
        </p>
      </motion.form>
    </div>
  );
}
