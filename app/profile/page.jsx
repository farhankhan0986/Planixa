"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/v1/me", {
          credentials: "include",
        });

        const result = await res.json();

        if (!res.ok) {
          router.push("/login");
          return;
        }

        setName(result.user.name || "");
        setEmail(result.user.email || "");
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/v1/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Skeleton loader
  if (loading) {
    return (
      <div className="min-h-screen px-6 py-12">
        <div className="max-w-xl mx-auto glass p-8 animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-white/10" />
          <div className="h-11 w-full rounded bg-white/5" />
          <div className="h-11 w-full rounded bg-white/5" />
          <div className="h-11 w-40 rounded bg-white/10 mt-4" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen px-6 py-12"
    >
      <div className="max-w-xl mx-auto">
        <div className="glass p-8">
          <h1 className="text-2xl font-semibold text-gradient mb-6">
            Profile
          </h1>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm text-zinc-300">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full h-11 px-4 mt-1 rounded-lg bg-black/40 border border-white/10 text-zinc-200
                focus:outline-none focus:border-emerald-400/60"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-zinc-300">Email</label>
              <input
                value={email}
                 onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 mt-1 rounded-lg bg-black/40 border border-white/10 text-zinc-200
                focus:outline-none focus:border-emerald-400/60"
              />
            </div>

            {/* Save button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={saving}
              className={`w-full h-11 mt-4 rounded-lg font-medium transition
                ${
                  saving
                    ? "bg-zinc-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-amber-500 text-black hover:brightness-110"
                }`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </motion.button>
          </form>

          {/* Back */}
          <button
            onClick={() => router.push("/dashboard")}
            className="px-5 py-2 mt-8 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition"
          >
            Back 
          </button>
        </div>
      </div>
    </motion.div>
  );
}
