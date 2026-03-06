import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import Label from "@/models/Label";
import Project from "@/models/Project";
import jwt from "jsonwebtoken";

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

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

    const body = await req.json();
    const { title, description, priority, dueDate, status, labels, subtasks, project } = body;

    if (title !== undefined && (!title || !title.trim())) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (status !== undefined) updateData.status = status;
    if (labels !== undefined) updateData.labels = labels;
    if (subtasks !== undefined) updateData.subtasks = subtasks;
    if (project !== undefined) updateData.project = project || null;

    const task = await Task.findOneAndUpdate(
      { _id: id, user: decoded.id },
      updateData,
      { new: true }
    ).populate("labels").populate("project");

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
