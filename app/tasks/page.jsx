"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function TasksPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | with-desc | no-desc

  //  Load tasks
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await fetch("/api/v1/tasks/list", {
          credentials: "include",
        });

        const result = await res.json();

        if (!res.ok) {
          setError(result.message || "Failed to load tasks");
          return;
        }

        setTasks(result.tasks || []);
      } catch {
        setError("Something went wrong");
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  //  Search + filter
  const filteredTasks = tasks.filter((task) => {
    if (!task) return false;

    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    if (filter === "with-desc") return matchesSearch && task.description;
    if (filter === "no-desc") return matchesSearch && !task.description;

    return matchesSearch;
  });

  //  Delete
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/v1/tasks/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        toast.error("Failed to delete task");
        return;
      }

      toast.success("Task deleted successfully");
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  //  Update
  const handleUpdate = async (id, title, description, stopEdit) => {
    try {
      const res = await fetch(`/api/v1/tasks/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description }),
      });

      const result = await res.json();
      if (!res.ok) {    
        toast.error("Failed to update task");
        return;
      }
        toast.success("Task updated successfully");
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? result.task : t))
      );

      stopEdit();
    } catch (err) {
      console.log(err);
    }
  };

  // 🔹 Skeleton loader
  if (loading) {
    return (
      <div className="min-h-screen px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 w-40 bg-white/10 rounded" />

          <div className="glass p-4 flex gap-3">
            <div className="h-10 flex-1 bg-white/5 rounded-lg" />
            <div className="h-10 w-48 bg-white/5 rounded-lg" />
          </div>

          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass p-4 space-y-3">
              <div className="h-4 w-1/2 bg-white/10 rounded" />
              <div className="h-3 w-3/4 bg-white/5 rounded" />
            </div>
          ))}
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
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-gradient">
            All Tasks
          </h1>
          <p className="text-zinc-400 mt-1">
            Browse and search through all your tasks
          </p>
        </div>

        {/* Search + Filter */}
        <div className="glass p-4 flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 h-10 px-4 rounded-lg bg-black/40 border border-white/10 text-zinc-200
            focus:outline-none focus:border-emerald-400/60"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-10 px-4 rounded-lg bg-black/40 border border-white/10 text-zinc-200
            focus:outline-none focus:border-emerald-400/60"
          >
            <option value="all">All tasks</option>
            <option value="with-desc">With description</option>
            <option value="no-desc">Without description</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <p className="text-zinc-400">No matching tasks found.</p>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence>
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  router={router}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </motion.div>
  );
}

/* ---------------- TASK ITEM ---------------- */

function TaskItem({ task, router, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -2 }}
      className="glass p-4 hover:border-emerald-400/40 transition"
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
                onUpdate(task._id, title, description, () =>
                  setEditing(false)
                )
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
            <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex gap-4 mt-3 text-sm">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              className="text-emerald-400 hover:text-emerald-300"
            >
              Edit
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task._id);
              }}
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
