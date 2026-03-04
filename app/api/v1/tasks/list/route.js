import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import jwt from "jsonwebtoken";

export async function GET(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = { user: decoded.id };

  // Filter by status
  const status = searchParams.get("status");
  if (status) query.status = status;

  // Filter by priority
  const priority = searchParams.get("priority");
  if (priority) query.priority = priority;

  // Filter by project
  const project = searchParams.get("project");
  if (project) query.project = project;

  // Filter by label
  const label = searchParams.get("label");
  if (label) query.labels = label;

  // Search by title or description
  const search = searchParams.get("search");
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Due date range
  const dueBefore = searchParams.get("dueBefore");
  const dueAfter = searchParams.get("dueAfter");
  if (dueBefore || dueAfter) {
    query.dueDate = {};
    if (dueAfter) query.dueDate.$gte = new Date(dueAfter);
    if (dueBefore) query.dueDate.$lte = new Date(dueBefore);
  }

  // Sort
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

  let tasks = await Task.find(query)
    .populate("labels")
    .populate("project")
    .sort({ [sortBy]: sortOrder });

  // Sort by priority manually if requested
  if (sortBy === "priority") {
    tasks = tasks.sort((a, b) => {
      const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return sortOrder === 1 ? diff : -diff;
    });
  }

  return NextResponse.json({ tasks }, { status: 200 });
}
