"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_COLORS = [
  "#e8a849", "#ef4444", "#f97316", "#3b82f6",
  "#a855f7", "#4a8c6f", "#ec4899", "#06b6d4",
];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#e8a849");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch("/api/v1/projects", { credentials: "include" });
        if (!res.ok) {
          toast.error("Failed to load projects");
          return;
        }
        const result = await res.json();
        setProjects(result.projects || []);
      } catch {
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/v1/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description, color }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message || "Failed to create project");
        return;
      }
      setProjects((prev) => [result.project, ...prev]);
      toast.success("Project created!");
      setName("");
      setDescription("");
      setColor("#e8a849");
      setShowForm(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/v1/projects?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        toast.error("Failed to delete project");
        return;
      }
      toast.success("Project deleted");
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-10">
        <div className="max-w-3xl space-y-4">
          <div className="skeleton h-8 w-40" />
          <div className="skeleton h-4 w-64" />
          <div className="rule mt-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 w-full" />
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
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="display" style={{ fontSize: "2rem" }}>Projects</h1>
            <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
            style={{ height: "2.25rem", fontSize: "0.6875rem" }}
          >
            {showForm ? "Cancel" : "+ New Project"}
          </button>
        </div>

        <div className="rule mb-6" />

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreate}
              className="overflow-hidden mb-8 space-y-3"
            >
              <span className="mono block mb-2" style={{ color: "var(--amber)", textTransform: "uppercase" }}>
                ◆ New Project
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
                className="input-field"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="input-field"
                style={{ height: "auto", padding: "0.625rem 0.875rem" }}
              />
              <div>
                <label className="mono block mb-1" style={{ fontSize: "0.6875rem" }}>Color</label>
                <div className="flex gap-2">
                  {DEFAULT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{
                        width: "1.5rem",
                        height: "1.5rem",
                        background: c,
                        border: color === c ? "2px solid var(--text-primary)" : "1px solid var(--rule)",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              </div>
              <button type="submit" disabled={creating} className="btn-primary w-full">
                {creating ? "Creating…" : "Create Project"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Project list */}
        {projects.length === 0 ? (
          <p style={{ color: "var(--text-faint)" }}>No projects yet. Create one to get started.</p>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project._id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--rule)",
                  padding: "1rem",
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        width: "0.75rem",
                        height: "0.75rem",
                        borderRadius: "50%",
                        background: project.color || "var(--amber)",
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <h3
                        className="font-semibold cursor-pointer"
                        style={{ color: "var(--text-primary)", fontSize: "1rem" }}
                        onClick={() => router.push(`/tasks?project=${project._id}`)}
                        onMouseEnter={(e) => (e.target.style.color = "var(--amber)")}
                        onMouseLeave={(e) => (e.target.style.color = "var(--text-primary)")}
                      >
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="mt-0.5" style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="text-action"
                    style={{ color: "var(--text-faint)", flexShrink: 0 }}
                    onMouseEnter={(e) => (e.target.style.color = "var(--danger)")}
                    onMouseLeave={(e) => (e.target.style.color = "var(--text-faint)")}
                  >
                    Delete
                  </button>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3 mt-3">
                  <div style={{ flex: 1, height: "0.25rem", background: "var(--rule-strong)", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${project.progress || 0}%`,
                        height: "100%",
                        background: project.progress === 100 ? "var(--success)" : project.color || "var(--amber)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                    {project.doneTasks || 0}/{project.totalTasks || 0} tasks ({project.progress || 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
