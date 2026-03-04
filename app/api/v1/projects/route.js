import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
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

  const projects = await Project.find({ user: decoded.id }).sort({ createdAt: -1 });

  // Get task counts for each project
  const projectsWithStats = await Promise.all(
    projects.map(async (project) => {
      const totalTasks = await Task.countDocuments({ project: project._id, user: decoded.id });
      const doneTasks = await Task.countDocuments({ project: project._id, user: decoded.id, status: "done" });
      return {
        ...project.toObject(),
        totalTasks,
        doneTasks,
        progress: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
      };
    })
  );

  return NextResponse.json({ projects: projectsWithStats }, { status: 200 });
}

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

  const { name, description, color } = await req.json();

  if (!name || !name.trim()) {
    return NextResponse.json(
      { message: "Project name is required" },
      { status: 400 }
    );
  }

  const project = await Project.create({
    name: name.trim(),
    description: description || "",
    color: color || "#e8a849",
    user: decoded.id,
  });

  return NextResponse.json(
    { message: "Project created successfully", project: { ...project.toObject(), totalTasks: 0, doneTasks: 0, progress: 0 } },
    { status: 201 }
  );
}

export async function DELETE(req) {
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
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
  }

  const project = await Project.findOneAndDelete({ _id: id, user: decoded.id });

  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  // Remove project reference from tasks
  await Task.updateMany({ project: id, user: decoded.id }, { project: null });

  return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
}
