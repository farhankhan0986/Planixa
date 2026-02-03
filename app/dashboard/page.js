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
      <div className="min-h-screen px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
          {/* Header skeleton */}
          <div className="space-y-3">
            <div className="h-8 w-48 rounded-lg bg-white/10" />
            <div className="h-4 w-64 rounded bg-white/5" />
          </div>

          {/* Create task skeleton */}
          <div className="glass p-6 space-y-4">
            <div className="h-5 w-32 rounded bg-white/10" />
            <div className="h-11 w-full rounded-lg bg-white/5" />
            <div className="h-20 w-full rounded-lg bg-white/5" />
            <div className="h-11 w-full rounded-lg bg-white/10" />
          </div>

          {/* Task list skeleton */}
          <div className="glass p-6 space-y-4">
            <div className="h-5 w-32 rounded bg-white/10" />

            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 p-4 space-y-3"
              >
                <div className="h-4 w-1/3 rounded bg-white/10" />
                <div className="h-3 w-2/3 rounded bg-white/5" />
                <div className="h-3 w-1/2 rounded bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen px-6 py-10"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 justify-between">
            <h1 className="text-3xl font-semibold text-gradient">Dashboard</h1>
            <button
              onClick={() => router.push("/profile")}
              className="mt-4 px-4 py-2 rounded-lg font-medium bg-linear-to-r from-emerald-500 to-amber-500 text-black hover:brightness-110"
            >
              <span className="text-zinc-900">Profile</span>
            </button>
          </div>
          <p className="text-zinc-400 mt-1">
            Welcome back, {data?.user?.name || "User"}
          </p>
        </div>

        {/* Create Task */}
        <div className="glass p-6">
          <h2 className="text-lg font-medium mb-4 text-zinc-200">
            Create Task
          </h2>

          <form onSubmit={handleCreateTask} className="space-y-3">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Task title"
              className="w-full h-11 px-4 rounded-lg bg-black/40 border border-white/10 text-zinc-200
              focus:outline-none focus:border-emerald-400/60"
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Task description"
              rows={2}
              className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-zinc-200
              focus:outline-none focus:border-emerald-400/60"
            />

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={creating}
              className={`w-full h-11 rounded-lg font-medium transition
                ${
                  creating
                    ? "bg-zinc-700 cursor-not-allowed"
                    : "bg-linear-to-r from-emerald-500 to-amber-500 text-black hover:brightness-110"
                }`}
            >
              {creating ? "Adding…" : "Add Task"}
            </motion.button>

            {createError && (
              <p className="text-sm text-red-400">{createError}</p>
            )}
          </form>
        </div>

      </div>
    </motion.div>
  );
}

