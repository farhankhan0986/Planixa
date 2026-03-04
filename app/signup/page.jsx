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
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--ink)' }}
    >
      {/* Left panel: decorative type — visible on large screens */}
      <div
        className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--rule)' }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="select-none"
          style={{ paddingLeft: '3rem' }}
        >
          <div
            className="display"
            style={{
              fontSize: '8rem',
              color: 'var(--rule-strong)',
              lineHeight: '0.9',
            }}
          >
            New
            <br />
            <span style={{ color: 'var(--amber)', opacity: 0.3 }}>Start</span>
          </div>
          <p className="mono mt-4" style={{ color: 'var(--text-faint)' }}>
            create your account
          </p>
        </motion.div>
      </div>

      {/* Right panel: form */}
      <div className="w-full lg:w-1/2 flex items-center px-6 lg:px-16 py-12">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Brand mark */}
          <div className="flex items-center gap-2 mb-12">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--amber)' }} />
            <span className="mono" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Planixa
            </span>
          </div>

          <h2 className="display" style={{ fontSize: '2rem' }}>
            Create Account
          </h2>
          <p className="mt-2 mb-8" style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            Join us and start your journey
          </p>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3"
              style={{
                background: 'rgba(200, 92, 74, 0.1)',
                borderLeft: '2px solid var(--danger)',
                color: 'var(--danger)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Name */}
          <div className="mb-4">
            <label className="mono block mb-2" style={{ color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="mono block mb-2" style={{ color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="mono block mb-2" style={{ color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                minLength={6}
                onChange={handleChange}
                className="input-field"
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 mono"
                style={{ color: 'var(--text-faint)', fontSize: '0.6875rem', cursor: 'pointer' }}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="mono block mb-2" style={{ color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="repeat_password"
              placeholder="••••••••"
              value={formData.repeat_password}
              minLength={6}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Terms agreement */}
          <div className="flex items-center gap-2 mb-6">
            <input
              type="checkbox"
              required
              style={{ accentColor: 'var(--amber)' }}
            />
            <span className="mono" style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>
              I agree to the{" "}
              <a href="/terms" style={{ color: 'var(--amber)' }}>
                Terms of Service
              </a>
            </span>
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="btn-primary w-full"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </motion.button>

          {/* Footer */}
          <p className="mt-6" style={{ color: 'var(--text-faint)', fontSize: '0.875rem' }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: 'var(--amber)', textDecoration: 'none' }}>
              Sign In
            </a>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
