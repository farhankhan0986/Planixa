"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"];
const PRIORITY_CONFIG = {
  critical: { label: "Critical", color: "#ef4444" },
  high: { label: "High", color: "#f97316" },
  medium: { label: "Medium", color: "#e8a849" },
  low: { label: "Low", color: "#4a8c6f" },
};
const STATUS_CONFIG = {
  todo: { label: "To Do", color: "#8a8578" },
  "in-progress": { label: "In Progress", color: "#3b82f6" },
  "in-review": { label: "In Review", color: "#a855f7" },
  done: { label: "Done", color: "#4a8c6f" },
};

export default function Dashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newTask, setNewTask] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDueDate, setNewDueDate] = useState("");

  //  Load user
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetch("/api/v1/auth/me", { credentials: "include" });
        const result = await res.json();
        if (!res.ok) {
          toast.error("Failed to load user data");
          return router.push("/");
        }
        setData(result);
      } catch {
        toast.error("Failed to load user data");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [router]);

  //  Load tasks
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setTasksLoading(true);
        const res = await fetch("/api/v1/tasks/list", {
          credentials: "include",
        });
        if (!res.ok) {
          toast.error("Unable to load tasks");
          throw new Error();
        }
        const result = await res.json();
        setTasks(result.tasks || []);
      } catch {
        setTasksError("Unable to load tasks");
        toast.error("Unable to load tasks");
      } finally {
        setTasksLoading(false);
      }
    };
    loadTasks();
  }, []);

  //  Create task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreateError("");

    if (!newTask.trim()) {
      setCreateError("Task title cannot be empty");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/v1/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: newTask,
          description: newDescription,
          priority: newPriority,
          dueDate: newDueDate || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.task) {
        setCreateError(result.message || "Failed to create task");
        toast.error(result.message || "Failed to create task");
        return;
      }

      setTasks((prev) => [result.task, ...prev]);
      toast.success("Task created successfully!");
      setNewTask("");
      setNewDescription("");
      setNewPriority("medium");
      setNewDueDate("");
    } catch {
      setCreateError("Something went wrong");
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  // Stats
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done"
  ).length;
  const dueTodayTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) >= todayStart &&
      new Date(t.dueDate) < todayEnd &&
      t.status !== "done"
  ).length;
  const completedThisWeek = tasks.filter(
    (t) => t.status === "done" && new Date(t.updatedAt) >= weekAgo
  ).length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Status counts
  const statusCounts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    "in-review": tasks.filter((t) => t.status === "in-review").length,
    done: doneTasks,
  };


  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-10">
        <div className="max-w-4xl space-y-6">
          {/* Header skeleton */}
          <div className="space-y-2">
            <div className="skeleton h-8 w-48" />
            <div className="skeleton h-4 w-64" />
          </div>
          <div className="rule" />
          {/* Form skeleton */}
          <div className="space-y-3">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-11 w-full" />
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-11 w-full" />
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
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="display" style={{ fontSize: '2rem' }}>Dashboard</h1>
            <p className="mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              Welcome back, {data?.user?.name || "User"}
            </p>
          </div>
          <button
            onClick={() => router.push("/profile")}
            className="btn-secondary"
            style={{ height: '2.25rem', fontSize: '0.6875rem' }}
          >
            Profile
          </button>
        </div>

        <div className="rule mt-6 mb-8" />

        {/* Summary Widgets */}
        {!tasksLoading && (
          <div className="mb-10">
            <span className="mono block mb-4" style={{ color: 'var(--amber)', textTransform: 'uppercase' }}>
              ◆ Overview
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <StatWidget label="Due Today" value={dueTodayTasks} color={dueTodayTasks > 0 ? "#f97316" : "var(--text-primary)"} />
              <StatWidget label="Overdue" value={overdueTasks} color={overdueTasks > 0 ? "var(--danger)" : "var(--text-primary)"} />
              <StatWidget label="Done This Week" value={completedThisWeek} color="var(--success)" />
              <StatWidget label="Total Tasks" value={totalTasks} color="var(--text-primary)" />
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-4">
              <span className="mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Overall Progress
              </span>
              <div style={{ flex: 1, height: '0.375rem', background: 'var(--rule-strong)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ height: '100%', background: 'var(--success)' }}
                />
              </div>
              <span className="mono" style={{ fontSize: '0.6875rem', color: 'var(--text-primary)' }}>
                {completionRate}%
              </span>
            </div>

            {/* Status breakdown */}
            <div className="flex flex-wrap gap-4">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <span key={key} className="mono" style={{ fontSize: '0.6875rem' }}>
                  <span style={{ color: cfg.color }}>●</span>{' '}
                  <span style={{ color: 'var(--text-muted)' }}>{cfg.label}:</span>{' '}
                  <span style={{ color: 'var(--text-primary)' }}>{statusCounts[key]}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="rule mb-8" />

        {/* Create Task */}
        <div className="mb-10">
          <span className="mono block mb-4" style={{ color: 'var(--amber)', textTransform: 'uppercase' }}>
            ◆ New Task
          </span>

          <form onSubmit={handleCreateTask} className="space-y-3">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Task title"
              className="input-field"
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Task description (optional)"
              rows={2}
              className="input-field"
              style={{ height: 'auto', padding: '0.625rem 0.875rem' }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mono block mb-1" style={{ fontSize: '0.6875rem' }}>Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="input-field"
                  style={{ cursor: 'pointer' }}
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mono block mb-1" style={{ fontSize: '0.6875rem' }}>Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="input-field"
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={creating}
              type="submit"
              className="btn-primary w-full"
            >
              {creating ? "Adding…" : "Add Task"}
            </motion.button>

            {createError && (
              <p className="mono" style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>
                {createError}
              </p>
            )}
          </form>
        </div>

      </div>
    </motion.div>
  );
}

function StatWidget({ label, value, color }) {
  return (
    <div
      className="p-3"
      style={{ background: 'var(--surface)', border: '1px solid var(--rule)' }}
    >
      <span className="mono block" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span
        className="display block mt-1"
        style={{ fontSize: '1.5rem', color }}
      >
        {value}
      </span>
    </div>
  );
}
