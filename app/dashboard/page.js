"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const result = await res.json();
        if (!res.ok) return router.push("/");
        setData(result);
      } catch {
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
        const res = await fetch("/api/tasks/list", { credentials: "include" });
        if (!res.ok) throw new Error();
        const result = await res.json();
        setTasks(result.tasks || []);
      } catch {
        setTasksError("Unable to load tasks");
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
      const res = await fetch("/api/tasks/create", {
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
        return;
      }

      setTasks((prev) => [result.task, ...prev]);
      setNewTask("");
      setNewDescription("");
    } catch {
      setCreateError("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  //  Delete task
  const handleDeleteTask = async (id) => {
    try {
      const res = await fetch(`/api/tasks/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t?._id !== id));
      }
    } catch {}
  };

  // ✏️ Update task
  const handleUpdateTask = async (id, title, description, done) => {
    try {
      const res = await fetch(`/api/tasks/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description }),
      });

      const result = await res.json();
      if (!res.ok) return;

      setTasks((prev) => prev.map((t) => (t._id === id ? result.task : t)));
      done();
    } catch {}
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
          <h1 className="text-3xl font-semibold text-gradient">
            Dashboard
          </h1>
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

        {/* Tasks List */}
        <div className="glass p-6">
          <h2 className="text-lg font-medium mb-4 text-zinc-200">
            Your Tasks
          </h2>

          {tasksLoading ? (
            <p className="text-zinc-400">Loading tasks…</p>
          ) : tasksError ? (
            <p className="text-red-400">{tasksError}</p>
          ) : tasks.length === 0 ? (
            <p className="text-zinc-400">No tasks yet.</p>
          ) : (
            <ul className="space-y-3">
              <AnimatePresence>
                {tasks.filter(Boolean).map((task) => (
                  <TaskItem
                    key={task._id}
                    task={task}
                    onDelete={handleDeleteTask}
                    onUpdate={handleUpdateTask}
                    router={router}
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TaskItem({ task, onDelete, onUpdate, router }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="glass p-4 hover-lift"
    >
      {editing ? (
        <>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-2 h-10 px-3 rounded bg-black/40 border border-white/10 text-zinc-200"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full mb-3 px-3 py-2 rounded bg-black/40 border border-white/10 text-zinc-200"
          />
          <div className="flex gap-2">
            <button
              onClick={() =>
                onUpdate(task._id, title, description, () => setEditing(false))
              }
              className="px-4 py-1.5 rounded bg-emerald-500 text-black font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-1.5 rounded bg-zinc-700 text-zinc-200"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h3
            onClick={() => router.push(`/tasks/${task._id}`)}
            className="font-medium cursor-pointer text-zinc-200 hover:text-emerald-400 transition"
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-sm text-zinc-400 mt-1">
              {task.description}
            </p>
          )}

          <div className="flex gap-4 mt-3 text-sm">
            <button
              onClick={() => setEditing(true)}
              className="text-emerald-400 hover:text-emerald-300"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </motion.li>
  );
}
