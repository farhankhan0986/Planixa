"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
    } catch {
      setCreateError("Something went wrong");
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  };


  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-10">
        <div className="max-w-3xl space-y-6">
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
      <div className="max-w-3xl">
        {/* Header — left-aligned, utilitarian */}
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

        {/* Create Task — ruled form, no card wrapper */}
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

