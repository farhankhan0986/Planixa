"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ReadTaskPage() {
  const router = useRouter();
  const { id } = useParams();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`/api/v1/tasks/read/${id}`, {
          credentials: "include",
        });

        const result = await res.json();

        if (!res.ok) {
          setError(result.message || "Failed to load task");
          toast.error(result.message || "Failed to load task");
          return;
        }

        setTask(result.task);
      } catch {
        setError("Something went wrong");
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTask();
  }, [id]);

  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-10">
        <div className="max-w-3xl space-y-4">
          <div className="skeleton h-10 w-3/4" />
          <div className="rule" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-11/12" />
          <div className="skeleton h-4 w-5/6" />
          <div className="rule mt-6" />
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-10 w-24 mt-4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center px-6 lg:px-10 py-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-md"
        >
          <p className="mono mb-4" style={{ color: 'var(--danger)' }}>{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </motion.div>
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
        {/* Back link */}
        <button
          onClick={() => router.push("/tasks")}
          className="text-action mb-6 block"
          style={{ color: 'var(--text-faint)' }}
          onMouseEnter={(e) => e.target.style.color = 'var(--amber)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-faint)'}
        >
          ← Back to Tasks
        </button>

        {/* Title — large, editorial */}
        <h1
          className="display"
          style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'var(--amber)' }}
        >
          {task.title}
        </h1>

        <div className="rule mt-4 mb-6" />

        {/* Description */}
        {task.description ? (
          <p
            style={{
              color: 'var(--text-primary)',
              fontSize: '1.0625rem',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap',
              maxWidth: '36rem',
            }}
          >
            {task.description}
          </p>
        ) : (
          <p style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>
            No description provided.
          </p>
        )}

        <div className="rule mt-8 mb-4" />

        {/* Meta — monospace readout */}
        <span className="mono">
          Created {new Date(task.createdAt).toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}
