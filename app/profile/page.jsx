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
      toast.error("Name is required");
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

  // Skeleton loader
  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-10">
        <div className="max-w-sm space-y-4">
          <div className="skeleton h-8 w-32" />
          <div className="rule" />
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-11 w-full" />
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-11 w-full" />
          <div className="skeleton h-11 w-full mt-4" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-6 lg:px-10 py-10"
    >
      <div className="max-w-sm">
        <h1 className="display" style={{ fontSize: '2rem' }}>Profile</h1>
        <div className="rule mt-4 mb-6" />

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mono block mb-2" style={{ color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="input-field"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mono block mb-2" style={{ color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Save button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={saving}
            type="submit"
            className="btn-primary w-full mt-2"
          >
            {saving ? "Saving..." : "Save Changes"}
          </motion.button>
        </form>

        <div className="rule mt-8 mb-4" />

        {/* Back */}
        <button
          onClick={() => router.push("/dashboard")}
          className="text-action"
          style={{ color: 'var(--text-faint)' }}
          onMouseEnter={(e) => e.target.style.color = 'var(--amber)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-faint)'}
        >
          ← Back to Dashboard
        </button>
      </div>
    </motion.div>
  );
}
