import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import jwt from "jsonwebtoken";

export async function PUT(req, { params }) {
  await connectDB();

  const { id } = await params; // ✅ FIX

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

  const { title, description } = await req.json();

  if (!title || !title.trim()) {
    return NextResponse.json(
      { message: "Title is required" },
      { status: 400 }
    );
  }

  const task = await Task.findOneAndUpdate(
    { _id: id, user: decoded.id },
    { title, description },
    { new: true }
  );

  if (!task) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ task }, { status: 200 });
}
