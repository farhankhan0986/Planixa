"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

const STATUS_CONFIG = {
  todo: { label: "To Do", color: "#8a8578" },
  "in-progress": { label: "In Progress", color: "#3b82f6" },
  "in-review": { label: "In Review", color: "#a855f7" },
  done: { label: "Done", color: "#4a8c6f" },
};

const PRIORITY_CONFIG = {
  critical: { label: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  high: { label: "High", color: "#f97316", bg: "rgba(249,115,22,0.15)" },
  medium: { label: "Medium", color: "#e8a849", bg: "rgba(232,168,73,0.15)" },
  low: { label: "Low", color: "#4a8c6f", bg: "rgba(74,140,111,0.15)" },
};

const STATUS_ORDER = ["todo", "in-progress", "in-review", "done"];

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function KanbanPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await fetch("/api/v1/tasks/list", { credentials: "include" });
        if (!res.ok) {
          toast.error("Failed to load tasks");
          return;
        }
        const result = await res.json();
        setTasks(result.tasks || []);
      } catch {
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const handleDragStart = (e, taskId) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedTask) return;

    const task = tasks.find((t) => t._id === draggedTask);
    if (!task || task.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === draggedTask ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`/api/v1/tasks/update/${draggedTask}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        toast.error("Failed to update task status");
        // Revert
        setTasks((prev) =>
          prev.map((t) => (t._id === draggedTask ? { ...t, status: task.status } : t))
        );
      } else {
        const result = await res.json();
        setTasks((prev) => prev.map((t) => (t._id === draggedTask ? result.task : t)));
        toast.success(`Moved to ${STATUS_CONFIG[newStatus].label}`);
      }
    } catch {
      toast.error("Failed to update task status");
    }

    setDraggedTask(null);
  };

  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-10">
        <div className="space-y-4">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-4 w-64" />
          <div className="rule mt-4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="skeleton h-6 w-24" />
                <div className="skeleton h-24 w-full" />
                <div className="skeleton h-24 w-full" />
              </div>
            ))}
          </div>
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
      <div>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="display" style={{ fontSize: "2rem" }}>Kanban Board</h1>
            <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
              Drag tasks between columns to change status
            </p>
          </div>
          <button
            onClick={() => router.push("/tasks")}
            className="btn-secondary"
            style={{ height: "2.25rem", fontSize: "0.6875rem" }}
          >
            List View
          </button>
        </div>

        <div className="rule mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style={{ minHeight: "60vh" }}>
          {STATUS_ORDER.map((status) => {
            const cfg = STATUS_CONFIG[status];
            const columnTasks = tasks.filter((t) => t.status === status);

            return (
              <div
                key={status}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--rule)",
                  padding: "1rem",
                  minHeight: "200px",
                }}
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: "0.5rem",
                        height: "0.5rem",
                        borderRadius: "50%",
                        background: cfg.color,
                        display: "inline-block",
                      }}
                    />
                    <span className="mono" style={{ fontSize: "0.75rem", color: cfg.color, textTransform: "uppercase" }}>
                      {cfg.label}
                    </span>
                  </div>
                  <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-faint)" }}>
                    {columnTasks.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {columnTasks.map((task) => {
                    const pCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                    return (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task._id)}
                        onClick={() => router.push(`/tasks/${task._id}`)}
                        style={{
                          background: "var(--surface-raised)",
                          border: "1px solid var(--rule)",
                          padding: "0.75rem",
                          cursor: "grab",
                          opacity: draggedTask === task._id ? 0.5 : 1,
                          transition: "opacity 0.15s ease",
                        }}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <span
                            className="mono"
                            style={{
                              fontSize: "0.5625rem",
                              padding: "0.0625rem 0.25rem",
                              background: pCfg.bg,
                              color: pCfg.color,
                              textTransform: "uppercase",
                            }}
                          >
                            {pCfg.label}
                          </span>
                        </div>

                        <h4
                          style={{
                            color: "var(--text-primary)",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {task.title}
                        </h4>

                        {task.description && (
                          <p
                            style={{
                              color: "var(--text-muted)",
                              fontSize: "0.75rem",
                              lineHeight: "1.4",
                              marginTop: "0.25rem",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {task.dueDate && (
                            <span className="mono" style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <span className="mono" style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>
                              ☑ {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
