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

  // Skeleton loader
  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-10">
        <div className="max-w-3xl space-y-4">
          <div className="skeleton h-8 w-40" />
          <div className="skeleton h-4 w-64" />
          <div className="rule mt-4 mb-4" />
          <div className="skeleton h-11 w-full" />
          <div className="rule" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="py-4 space-y-2">
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-3 w-3/4" />
              <div className="rule" />
            </div>
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

        {/* Header */}
        <div>
          <h1 className="display" style={{ fontSize: '2rem' }}>
            All Tasks
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="rule mt-6 mb-6" />

        {/* Search + Filter — inline, ruled */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field flex-1"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
            style={{ width: 'auto', minWidth: '10rem', cursor: 'pointer' }}
          >
            <option value="all">All tasks</option>
            <option value="with-desc">With description</option>
            <option value="no-desc">Without description</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <p className="mono mb-4" style={{ color: 'var(--danger)' }}>{error}</p>
        )}

        {/* Task List — ruled lines, not cards */}
        {filteredTasks.length === 0 ? (
          <p style={{ color: 'var(--text-faint)' }}>No matching tasks found.</p>
        ) : (
          <ul>
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

/* ━━ TASK ITEM — ruled row, not card ━━ */

function TaskItem({ task, router, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="list-none py-4"
      style={{ borderBottom: '1px solid var(--rule)' }}
    >
      {editing ? (
        <>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field mb-2"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="input-field mb-3"
            style={{ height: 'auto', padding: '0.625rem 0.875rem' }}
          />

          <div className="flex gap-2">
            <button
              onClick={() =>
                onUpdate(task._id, title, description, () =>
                  setEditing(false)
                )
              }
              className="btn-primary"
              style={{ height: '2rem', fontSize: '0.6875rem', padding: '0 0.75rem' }}
            >
              Save
            </button>

            <button
              onClick={() => setEditing(false)}
              className="btn-secondary"
              style={{ height: '2rem', fontSize: '0.6875rem', padding: '0 0.75rem' }}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h3
            onClick={() => router.push(`/tasks/${task._id}`)}
            className="font-semibold cursor-pointer"
            style={{
              color: 'var(--text-primary)',
              fontSize: '1rem',
              letterSpacing: '-0.01em',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--amber)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
          >
            {task.title}
          </h3>

          {task.description && (
            <p
              className="mt-1"
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {task.description}
            </p>
          )}

          <div className="flex gap-4 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              className="text-action"
              style={{ color: 'var(--amber-dim)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--amber)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--amber-dim)'}
            >
              Edit
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task._id);
              }}
              className="text-action"
              style={{ color: 'var(--text-faint)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--danger)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-faint)'}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </motion.li>
  );
}
