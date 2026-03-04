import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import jwt from "jsonwebtoken";

export async function POST(req) {
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

  const { title, description, priority, dueDate, status, labels, subtasks, project } = await req.json();

  if (!title || !title.trim()) {
    return NextResponse.json(
      { message: "Title is required" },
      { status: 400 }
    );
  }

  const taskData = {
    title,
    description: description || "",
    user: decoded.id,
  };

  if (priority) taskData.priority = priority;
  if (dueDate) taskData.dueDate = new Date(dueDate);
  if (status) taskData.status = status;
  if (labels && Array.isArray(labels)) taskData.labels = labels;
  if (subtasks && Array.isArray(subtasks)) taskData.subtasks = subtasks;
  if (project) taskData.project = project;

  const task = await Task.create(taskData);

  return NextResponse.json(
    {
      message: "Task created successfully",
      task,
    },
    { status: 201 }
  );
}
