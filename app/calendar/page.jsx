"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

const PRIORITY_CONFIG = {
  critical: { color: "#ef4444" },
  high: { color: "#f97316" },
  medium: { color: "#e8a849" },
  low: { color: "#4a8c6f" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

export default function CalendarPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // month | week

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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Build calendar grid
  const calendarDays = [];
  // Fill blanks before first day
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(year, month, d));
  }

  // Get week days
  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }
    return days;
  };

  const weekDays = view === "week" ? getWeekDays() : [];

  const getTasksForDay = (date) => {
    if (!date) return [];
    return tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), date));
  };

  const today = new Date();

  const handleDayClick = (date) => {
    if (!date) return;
    const dateStr = date.toISOString().slice(0, 10);
    router.push(`/dashboard?dueDate=${dateStr}`);
  };

  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-10">
        <div className="space-y-4">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-4 w-64" />
          <div className="rule mt-4" />
          <div className="skeleton h-96 w-full mt-4" />
        </div>
      </div>
    );
  }

  const displayDays = view === "week" ? weekDays : calendarDays;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-6 lg:px-10 py-10"
    >
      <div className="max-w-5xl">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="display" style={{ fontSize: "2rem" }}>Calendar</h1>
            <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
              {MONTHS[month]} {year}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setView(view === "month" ? "week" : "month")} className="btn-secondary" style={{ height: "2.25rem", fontSize: "0.6875rem" }}>
              {view === "month" ? "Week View" : "Month View"}
            </button>
            <button onClick={goToToday} className="btn-secondary" style={{ height: "2.25rem", fontSize: "0.6875rem" }}>
              Today
            </button>
            <button onClick={prevMonth} className="btn-secondary" style={{ height: "2.25rem", fontSize: "0.6875rem", padding: "0 0.75rem" }}>
              ←
            </button>
            <button onClick={nextMonth} className="btn-secondary" style={{ height: "2.25rem", fontSize: "0.6875rem", padding: "0 0.75rem" }}>
              →
            </button>
          </div>
        </div>

        <div className="rule mb-6" />

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-px mb-1">
          {DAYS.map((day) => (
            <div key={day} className="text-center">
              <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px" style={{ background: "var(--rule)" }}>
          {displayDays.map((date, i) => {
            const dayTasks = getTasksForDay(date);
            const isToday = date && isSameDay(date, today);

            return (
              <div
                key={i}
                onClick={() => handleDayClick(date)}
                style={{
                  background: date ? "var(--surface)" : "var(--ink)",
                  minHeight: view === "week" ? "12rem" : "6rem",
                  padding: "0.375rem",
                  cursor: date ? "pointer" : "default",
                  border: isToday ? "1px solid var(--amber)" : "none",
                }}
              >
                {date && (
                  <>
                    <span
                      className="mono block mb-1"
                      style={{
                        fontSize: "0.6875rem",
                        color: isToday ? "var(--amber)" : "var(--text-muted)",
                        fontWeight: isToday ? 700 : 400,
                      }}
                    >
                      {date.getDate()}
                    </span>

                    {dayTasks.slice(0, 3).map((task) => {
                      const pColor = PRIORITY_CONFIG[task.priority]?.color || "var(--amber)";
                      return (
                        <div
                          key={task._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/tasks/${task._id}`);
                          }}
                          style={{
                            fontSize: "0.625rem",
                            padding: "0.125rem 0.25rem",
                            marginBottom: "0.125rem",
                            background: `${pColor}15`,
                            borderLeft: `2px solid ${pColor}`,
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            cursor: "pointer",
                          }}
                        >
                          {task.title}
                        </div>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <span className="mono" style={{ fontSize: "0.5625rem", color: "var(--text-faint)" }}>
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
