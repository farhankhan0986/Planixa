"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_COLORS = [
  "#e8a849", "#ef4444", "#f97316", "#3b82f6",
  "#a855f7", "#4a8c6f", "#ec4899", "#06b6d4",
];

export default function LabelsPage() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#e8a849");

  useEffect(() => {
    const loadLabels = async () => {
      try {
        const res = await fetch("/api/v1/labels", { credentials: "include" });
        if (!res.ok) {
          toast.error("Failed to load labels");
          return;
        }
        const result = await res.json();
        setLabels(result.labels || []);
      } catch {
        toast.error("Failed to load labels");
      } finally {
        setLoading(false);
      }
    };
    loadLabels();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Label name is required");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/v1/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, color }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message || "Failed to create label");
        return;
      }
      setLabels((prev) => [result.label, ...prev]);
      toast.success("Label created!");
      setName("");
      setColor("#e8a849");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/v1/labels?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        toast.error("Failed to delete label");
        return;
      }
      toast.success("Label deleted");
      setLabels((prev) => prev.filter((l) => l._id !== id));
    } catch {
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-10">
        <div className="max-w-3xl space-y-4">
          <div className="skeleton h-8 w-40" />
          <div className="skeleton h-4 w-64" />
          <div className="rule mt-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-12 w-full" />
          ))}
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
      <div className="max-w-3xl">
        <div>
          <h1 className="display" style={{ fontSize: "2rem" }}>Labels</h1>
          <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
            Create custom labels to categorize your tasks
          </p>
        </div>

        <div className="rule mt-6 mb-6" />

        {/* Create form */}
        <form onSubmit={handleCreate} className="mb-8 space-y-3">
          <span className="mono block mb-2" style={{ color: "var(--amber)", textTransform: "uppercase" }}>
            ◆ New Label
          </span>
          <div className="flex gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Label name (e.g., Work, Personal)"
              className="input-field flex-1"
            />
            <button type="submit" disabled={creating} className="btn-primary" style={{ flexShrink: 0 }}>
              {creating ? "Adding…" : "Add Label"}
            </button>
          </div>
          <div>
            <label className="mono block mb-1" style={{ fontSize: "0.6875rem" }}>Color</label>
            <div className="flex gap-2">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    background: c,
                    border: color === c ? "2px solid var(--text-primary)" : "1px solid var(--rule)",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
        </form>

        <div className="rule mb-6" />

        {/* Label list */}
        {labels.length === 0 ? (
          <p style={{ color: "var(--text-faint)" }}>No labels yet. Create one above.</p>
        ) : (
          <ul>
            <AnimatePresence>
              {labels.map((label) => (
                <motion.li
                  key={label._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="list-none py-3 flex items-center justify-between"
                  style={{ borderBottom: "1px solid var(--rule)" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        width: "0.75rem",
                        height: "0.75rem",
                        borderRadius: "50%",
                        background: label.color,
                        display: "inline-block",
                      }}
                    />
                    <span
                      className="mono"
                      style={{
                        fontSize: "0.875rem",
                        padding: "0.125rem 0.5rem",
                        background: `${label.color}22`,
                        color: label.color,
                        border: `1px solid ${label.color}33`,
                      }}
                    >
                      {label.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(label._id)}
                    className="text-action"
                    style={{ color: "var(--text-faint)" }}
                    onMouseEnter={(e) => (e.target.style.color = "var(--danger)")}
                    onMouseLeave={(e) => (e.target.style.color = "var(--text-faint)")}
                  >
                    Delete
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </motion.div>
  );
}
