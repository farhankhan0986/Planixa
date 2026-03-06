import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import Label from "@/models/Label";
import Project from "@/models/Project";
import jwt from "jsonwebtoken";

export async function GET(req, { params }) {
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

    const task = await Task.findOne({
      _id: id,
      user: decoded.id,
    }).populate("labels").populate("project");

    if (!task) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    console.error("Error reading task:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
