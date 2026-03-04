"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

const STATUS_OPTIONS = ["todo", "in-progress", "in-review", "done"];
const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"];

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

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TasksPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [labels, setLabels] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterLabel, setFilterLabel] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Load tasks, labels, projects
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksRes, labelsRes, projectsRes] = await Promise.all([
          fetch("/api/v1/tasks/list", { credentials: "include" }),
          fetch("/api/v1/labels", { credentials: "include" }),
          fetch("/api/v1/projects", { credentials: "include" }),
        ]);

        const tasksResult = await tasksRes.json();
        const labelsResult = await labelsRes.json();
        const projectsResult = await projectsRes.json();

        if (!tasksRes.ok) {
          setError(tasksResult.message || "Failed to load tasks");
          return;
        }

        setTasks(tasksResult.tasks || []);
        setLabels(labelsResult.labels || []);
        setProjects(projectsResult.projects || []);
      } catch {
        setError("Something went wrong");
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and sort
  const filteredTasks = tasks
    .filter((task) => {
      if (!task) return false;
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === "all" || task.status === filterStatus;
      const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
      const matchesLabel =
        filterLabel === "all" ||
        (task.labels && task.labels.some((l) => (l._id || l) === filterLabel));
      const matchesProject =
        filterProject === "all" ||
        (filterProject === "none" ? !task.project : (task.project?._id || task.project) === filterProject);
      return matchesSearch && matchesStatus && matchesPriority && matchesLabel && matchesProject;
    })
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      let cmp = 0;
      if (sortBy === "priority") {
        cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === "dueDate") {
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        cmp = aDate - bDate;
      } else if (sortBy === "title") {
        cmp = a.title.localeCompare(b.title);
      } else {
        cmp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sortOrder === "asc" ? -cmp : cmp;
      }
      return sortOrder === "desc" ? -cmp : cmp;
    });

  // Delete
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

  // Update
  const handleUpdate = async (id, updateData, stopEdit) => {
    try {
      const res = await fetch(`/api/v1/tasks/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error("Failed to update task");
        return;
      }
      toast.success("Task updated successfully");
      setTasks((prev) => prev.map((t) => (t._id === id ? result.task : t)));
      if (stopEdit) stopEdit();
    } catch (err) {
      console.log(err);
    }
  };

  // Quick status change
  const handleStatusChange = async (id, newStatus) => {
    await handleUpdate(id, { status: newStatus });
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-10">
        <div className="max-w-4xl space-y-4">
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

  const activeFilters = [filterStatus, filterPriority, filterLabel, filterProject].filter(
    (f) => f !== "all"
  ).length;

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
            <h1 className="display" style={{ fontSize: "2rem" }}>
              All Tasks
            </h1>
            <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
              {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        <div className="rule mt-6 mb-6" />

        {/* Search + Filter Toggle */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field flex-1"
          />

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary"
            style={{ height: "2.75rem", fontSize: "0.6875rem", position: "relative" }}
          >
            Filters{activeFilters > 0 && ` (${activeFilters})`}
          </button>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div
                className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                style={{ background: "var(--surface)", border: "1px solid var(--rule)" }}
              >
                <div>
                  <label className="mono block mb-1" style={{ fontSize: "0.6875rem" }}>Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input-field"
                    style={{ cursor: "pointer" }}
                  >
                    <option value="all">All statuses</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mono block mb-1" style={{ fontSize: "0.6875rem" }}>Priority</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="input-field"
                    style={{ cursor: "pointer" }}
                  >
                    <option value="all">All priorities</option>
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mono block mb-1" style={{ fontSize: "0.6875rem" }}>Label</label>
                  <select
                    value={filterLabel}
                    onChange={(e) => setFilterLabel(e.target.value)}
                    className="input-field"
                    style={{ cursor: "pointer" }}
                  >
                    <option value="all">All labels</option>
                    {labels.map((l) => (
                      <option key={l._id} value={l._id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mono block mb-1" style={{ fontSize: "0.6875rem" }}>Project</label>
                  <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    className="input-field"
                    style={{ cursor: "pointer" }}
                  >
                    <option value="all">All projects</option>
                    <option value="none">No project</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mono block mb-1" style={{ fontSize: "0.6875rem" }}>Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-field"
                    style={{ cursor: "pointer" }}
                  >
                    <option value="createdAt">Created Date</option>
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="title">Alphabetical</option>
                  </select>
                </div>

                <div>
                  <label className="mono block mb-1" style={{ fontSize: "0.6875rem" }}>Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="input-field"
                    style={{ cursor: "pointer" }}
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <p className="mono mb-4" style={{ color: "var(--danger)" }}>{error}</p>
        )}

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <p style={{ color: "var(--text-faint)" }}>No matching tasks found.</p>
        ) : (
          <ul>
            <AnimatePresence>
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  labels={labels}
                  projects={projects}
                  router={router}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </motion.div>
  );
}

/* ━━ TASK ITEM ━━ */

function TaskItem({ task, labels, projects, router, onDelete, onUpdate, onStatusChange }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority || "medium");
  const [status, setStatus] = useState(task.status || "todo");
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : "");
  const [taskLabels, setTaskLabels] = useState(
    (task.labels || []).map((l) => l._id || l)
  );
  const [project, setProject] = useState(task.project?._id || task.project || "");
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [newSubtask, setNewSubtask] = useState("");
  const [showSubtasks, setShowSubtasks] = useState(false);

  const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const overdue = task.status !== "done" && isOverdue(task.dueDate);
  const dueSoon = task.status !== "done" && isDueSoon(task.dueDate);

  const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;
  const totalSubtasks = (task.subtasks || []).length;

  const handleSave = () => {
    onUpdate(
      task._id,
      { title, description, priority, status, dueDate: dueDate || null, labels: taskLabels, subtasks, project: project || null },
      () => setEditing(false)
    );
  };

  const toggleSubtask = async (index) => {
    const updated = [...(task.subtasks || [])].map((s, i) =>
      i === index ? { ...s, completed: !s.completed } : s
    );
    await onUpdate(task._id, { subtasks: updated });
  };

  const addSubtask = async () => {
    if (!newSubtask.trim()) return;
    const updated = [...(task.subtasks || []), { title: newSubtask.trim(), completed: false }];
    await onUpdate(task._id, { subtasks: updated });
    setNewSubtask("");
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="list-none py-4"
      style={{ borderBottom: "1px solid var(--rule)" }}
    >
      {editing ? (
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Task title" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input-field" style={{ height: "auto", padding: "0.625rem 0.875rem" }} placeholder="Description" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mono block mb-1" style={{ fontSize: "0.6875rem" }}>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field" style={{ cursor: "pointer" }}>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mono block mb-1" style={{ fontSize: "0.6875rem" }}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field" style={{ cursor: "pointer" }}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mono block mb-1" style={{ fontSize: "0.6875rem" }}>Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-field" style={{ cursor: "pointer" }} />
            </div>
            <div>
              <label className="mono block mb-1" style={{ fontSize: "0.6875rem" }}>Project</label>
              <select value={project} onChange={(e) => setProject(e.target.value)} className="input-field" style={{ cursor: "pointer" }}>
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Label selection */}
          {labels.length > 0 && (
            <div>
              <label className="mono block mb-1" style={{ fontSize: "0.6875rem" }}>Labels</label>
              <div className="flex flex-wrap gap-2">
                {labels.map((l) => (
                  <button
                    key={l._id}
                    type="button"
                    onClick={() => {
                      setTaskLabels((prev) =>
                        prev.includes(l._id) ? prev.filter((id) => id !== l._id) : [...prev, l._id]
                      );
                    }}
                    className="mono"
                    style={{
                      padding: "0.25rem 0.5rem",
                      fontSize: "0.6875rem",
                      border: `1px solid ${taskLabels.includes(l._id) ? l.color : "var(--rule)"}`,
                      background: taskLabels.includes(l._id) ? `${l.color}22` : "transparent",
                      color: taskLabels.includes(l._id) ? l.color : "var(--text-muted)",
                      cursor: "pointer",
                    }}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subtask editing */}
          <div>
            <label className="mono block mb-1" style={{ fontSize: "0.6875rem" }}>Subtasks</label>
            {subtasks.map((st, i) => (
              <div key={i} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  checked={st.completed}
                  onChange={() => {
                    const updated = subtasks.map((s, idx) =>
                      idx === i ? { ...s, completed: !s.completed } : s
                    );
                    setSubtasks(updated);
                  }}
                  style={{ accentColor: "var(--amber)" }}
                />
                <input
                  value={st.title}
                  onChange={(e) => {
                    const updated = subtasks.map((s, idx) =>
                      idx === i ? { ...s, title: e.target.value } : s
                    );
                    setSubtasks(updated);
                  }}
                  className="input-field"
                  style={{ height: "2rem", fontSize: "0.8125rem" }}
                />
                <button
                  type="button"
                  onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))}
                  className="text-action"
                  style={{ color: "var(--danger)", flexShrink: 0 }}
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add subtask..."
                className="input-field flex-1"
                style={{ height: "2rem", fontSize: "0.8125rem" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newSubtask.trim()) {
                      setSubtasks([...subtasks, { title: newSubtask.trim(), completed: false }]);
                      setNewSubtask("");
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newSubtask.trim()) {
                    setSubtasks([...subtasks, { title: newSubtask.trim(), completed: false }]);
                    setNewSubtask("");
                  }
                }}
                className="btn-secondary"
                style={{ height: "2rem", fontSize: "0.6875rem", padding: "0 0.5rem" }}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary" style={{ height: "2rem", fontSize: "0.6875rem", padding: "0 0.75rem" }}>
              Save
            </button>
            <button onClick={() => setEditing(false)} className="btn-secondary" style={{ height: "2rem", fontSize: "0.6875rem", padding: "0 0.75rem" }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Title row with priority + status badges */}
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {/* Priority badge */}
                <span
                  className="mono"
                  style={{
                    fontSize: "0.625rem",
                    padding: "0.125rem 0.375rem",
                    background: priorityCfg.bg,
                    color: priorityCfg.color,
                    border: `1px solid ${priorityCfg.color}33`,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    lineHeight: "1.4",
                  }}
                >
                  {priorityCfg.label}
                </span>

                {/* Status badge */}
                <span
                  className="mono"
                  style={{
                    fontSize: "0.625rem",
                    padding: "0.125rem 0.375rem",
                    border: `1px solid ${statusCfg.color}55`,
                    color: statusCfg.color,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    lineHeight: "1.4",
                  }}
                >
                  {statusCfg.label}
                </span>

                {/* Overdue / Due Soon */}
                {overdue && (
                  <span className="mono" style={{ fontSize: "0.625rem", color: "var(--danger)", textTransform: "uppercase" }}>
                    ⚠ Overdue
                  </span>
                )}
                {dueSoon && !overdue && (
                  <span className="mono" style={{ fontSize: "0.625rem", color: "#f97316", textTransform: "uppercase" }}>
                    ⏰ Due Soon
                  </span>
                )}
              </div>

              <h3
                onClick={() => router.push(`/tasks/${task._id}`)}
                className="font-semibold cursor-pointer"
                style={{
                  color: task.status === "done" ? "var(--text-faint)" : "var(--text-primary)",
                  fontSize: "1rem",
                  letterSpacing: "-0.01em",
                  transition: "color 0.15s ease",
                  textDecoration: task.status === "done" ? "line-through" : "none",
                }}
                onMouseEnter={(e) => (e.target.style.color = "var(--amber)")}
                onMouseLeave={(e) => (e.target.style.color = task.status === "done" ? "var(--text-faint)" : "var(--text-primary)")}
              >
                {task.title}
              </h3>

              {task.description && (
                <p
                  className="mt-1"
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.875rem",
                    lineHeight: "1.5",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {task.description}
                </p>
              )}

              {/* Meta row: due date, labels, project, subtask progress */}
              <div className="flex items-center gap-3 flex-wrap mt-2">
                {task.dueDate && (
                  <span
                    className="mono"
                    style={{
                      fontSize: "0.6875rem",
                      color: overdue ? "var(--danger)" : dueSoon ? "#f97316" : "var(--text-muted)",
                    }}
                  >
                    Due {formatDate(task.dueDate)}
                  </span>
                )}

                {task.project && (
                  <span className="mono" style={{ fontSize: "0.6875rem", color: task.project.color || "var(--amber-dim)" }}>
                    ◆ {task.project.name || "Project"}
                  </span>
                )}

                {/* Labels */}
                {task.labels && task.labels.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {task.labels.map((l) => (
                      <span
                        key={l._id || l}
                        className="mono"
                        style={{
                          fontSize: "0.6rem",
                          padding: "0.0625rem 0.3rem",
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

                {/* Subtask progress */}
                {totalSubtasks > 0 && (
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: "3rem",
                        height: "0.25rem",
                        background: "var(--rule-strong)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${(completedSubtasks / totalSubtasks) * 100}%`,
                          height: "100%",
                          background: completedSubtasks === totalSubtasks ? "var(--success)" : "var(--amber)",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                    <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                      {completedSubtasks}/{totalSubtasks}
                    </span>
                  </div>
                )}
              </div>

              {/* Inline subtask list (expandable) */}
              {totalSubtasks > 0 && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowSubtasks(!showSubtasks)}
                    className="text-action"
                    style={{ color: "var(--text-faint)", fontSize: "0.6875rem" }}
                  >
                    {showSubtasks ? "▾ Hide subtasks" : "▸ Show subtasks"}
                  </button>
                  {showSubtasks && (
                    <div className="mt-1 ml-2 space-y-1">
                      {(task.subtasks || []).map((st, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => toggleSubtask(i)}
                            style={{ accentColor: "var(--amber)" }}
                          />
                          <span
                            className="mono"
                            style={{
                              fontSize: "0.8125rem",
                              color: st.completed ? "var(--text-faint)" : "var(--text-primary)",
                              textDecoration: st.completed ? "line-through" : "none",
                            }}
                          >
                            {st.title}
                          </span>
                        </div>
                      ))}
                      {/* Quick add subtask */}
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                          placeholder="Add subtask..."
                          className="input-field"
                          style={{ height: "1.75rem", fontSize: "0.75rem" }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSubtask();
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick status dropdown */}
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task._id, e.target.value)}
              className="input-field"
              style={{
                width: "auto",
                height: "1.75rem",
                fontSize: "0.6875rem",
                padding: "0 0.5rem",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
                setSubtasks(task.subtasks || []);
              }}
              className="text-action"
              style={{ color: "var(--amber-dim)" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--amber)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--amber-dim)")}
            >
              Edit
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task._id);
              }}
              className="text-action"
              style={{ color: "var(--text-faint)" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--danger)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-faint)")}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </motion.li>
  );
}
