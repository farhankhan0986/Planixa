"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

  if (loading) {
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-3xl mx-auto animate-pulse space-y-6">
        
        {/* Title skeleton */}
        <div className="h-10 w-3/4 rounded-lg bg-white/10" />

        {/* Description skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-white/5" />
          <div className="h-4 w-11/12 rounded bg-white/5" />
          <div className="h-4 w-5/6 rounded bg-white/5" />
        </div>

        {/* Meta skeleton */}
        <div className="h-4 w-1/3 rounded bg-white/5" />

        {/* Action button skeleton */}
        <div className="h-10 w-24 rounded-lg bg-white/10 mt-6" />
      </div>
    </div>
  );
}


  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 max-w-md text-center"
        >
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 rounded-lg font-medium
            bg-linear-to-r from-emerald-500 to-amber-500 text-black hover:brightness-110"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen px-6 py-12"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass p-8"
        >
          {/* Title */}
          <h1 className="text-3xl font-semibold text-emerald-400 mb-4">
            {task.title}
          </h1>

          {/* Description */}
          {task.description ? (
            <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed mb-6">
              {task.description}
            </p>
          ) : (
            <p className="text-zinc-500 italic mb-6">
              No description provided.
            </p>
          )}

          {/* Meta */}
          <p className="text-sm text-zinc-500 mb-8">
            Created on{" "}
            {new Date(task.createdAt).toLocaleString()}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/tasks")}
              className="px-5 py-2 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition"
            >
              Back
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
