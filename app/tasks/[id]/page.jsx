"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

const PRIORITY_CONFIG = {
  critical: { label: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  high: { label: "High", color: "#f97316", bg: "rgba(249,115,22,0.15)" },
  medium: { label: "Medium", color: "#e8a849", bg: "rgba(232,168,73,0.15)" },
  low: { label: "Low", color: "#4a8c6f", bg: "rgba(74,140,111,0.15)" },
};

const STATUS_CONFIG = {
  todo: { label: "To Do", color: "#8a8578" },
  "in-progress": { label: "In Progress", color: "#3b82f6" },
  "in-review": { label: "In Review", color: "#a855f7" },
  done: { label: "Done", color: "#4a8c6f" },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

function isDueSoon(dueDate) {
  if (!dueDate) return false;
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due - now;
  return diff > 0 && diff < 24 * 60 * 60 * 1000;
}

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

  const handleSubtaskToggle = async (index) => {
    const updated = [...(task.subtasks || [])].map((s, i) =>
      i === index ? { ...s, completed: !s.completed } : s
    );
    try {
      const res = await fetch(`/api/v1/tasks/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subtasks: updated }),
      });
      const result = await res.json();
      if (res.ok) setTask(result.task);
    } catch {
      toast.error("Failed to update subtask");
    }
  };

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

  const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const overdue = task.status !== "done" && isOverdue(task.dueDate);
  const dueSoon = task.status !== "done" && isDueSoon(task.dueDate);
  const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;
  const totalSubtasks = (task.subtasks || []).length;

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

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span
            className="mono"
            style={{
              fontSize: "0.6875rem",
              padding: "0.125rem 0.5rem",
              background: priorityCfg.bg,
              color: priorityCfg.color,
              border: `1px solid ${priorityCfg.color}33`,
              textTransform: "uppercase",
            }}
          >
            {priorityCfg.label}
          </span>
          <span
            className="mono"
            style={{
              fontSize: "0.6875rem",
              padding: "0.125rem 0.5rem",
              border: `1px solid ${statusCfg.color}55`,
              color: statusCfg.color,
              textTransform: "uppercase",
            }}
          >
            {statusCfg.label}
          </span>
          {overdue && (
            <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--danger)", textTransform: "uppercase" }}>
              ⚠ Overdue
            </span>
          )}
          {dueSoon && !overdue && (
            <span className="mono" style={{ fontSize: "0.6875rem", color: "#f97316", textTransform: "uppercase" }}>
              ⏰ Due Soon
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          className="display"
          style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            color: task.status === "done" ? "var(--text-faint)" : "var(--amber)",
            textDecoration: task.status === "done" ? "line-through" : "none",
          }}
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

        {/* Meta */}
        <div className="space-y-2">
          <span className="mono block">
            Created {new Date(task.createdAt).toLocaleString()}
          </span>

          {task.dueDate && (
            <span
              className="mono block"
              style={{ color: overdue ? "var(--danger)" : dueSoon ? "#f97316" : "var(--text-muted)" }}
            >
              Due {formatDate(task.dueDate)}
            </span>
          )}

          {task.project && (
            <span className="mono block" style={{ color: task.project.color || "var(--amber-dim)" }}>
              Project: {task.project.name}
            </span>
          )}

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {task.labels.map((l) => (
                <span
                  key={l._id || l}
                  className="mono"
                  style={{
                    fontSize: "0.6875rem",
                    padding: "0.125rem 0.375rem",
                    background: `${l.color || "var(--amber)"}22`,
                    color: l.color || "var(--amber)",
                    border: `1px solid ${l.color || "var(--amber)"}33`,
                  }}
                >
                  {l.name || "Label"}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Subtasks */}
        {totalSubtasks > 0 && (
          <>
            <div className="rule mt-6 mb-4" />
            <span className="mono block mb-3" style={{ color: 'var(--amber)', textTransform: 'uppercase' }}>
              ◆ Subtasks ({completedSubtasks}/{totalSubtasks})
            </span>

            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-4">
              <div style={{ flex: 1, height: '0.375rem', background: 'var(--rule-strong)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(completedSubtasks / totalSubtasks) * 100}%`,
                    height: '100%',
                    background: completedSubtasks === totalSubtasks ? 'var(--success)' : 'var(--amber)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <span className="mono" style={{ fontSize: '0.6875rem', color: 'var(--text-primary)' }}>
                {Math.round((completedSubtasks / totalSubtasks) * 100)}%
              </span>
            </div>

            <div className="space-y-2">
              {(task.subtasks || []).map((st, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => handleSubtaskToggle(i)}
                    style={{ accentColor: "var(--amber)" }}
                  />
                  <span
                    style={{
                      color: st.completed ? "var(--text-faint)" : "var(--text-primary)",
                      textDecoration: st.completed ? "line-through" : "none",
                      fontSize: "0.9375rem",
                    }}
                  >
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
