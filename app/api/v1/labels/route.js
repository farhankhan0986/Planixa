import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Label from "@/models/Label";
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

  const labels = await Label.find({ user: decoded.id }).sort({ createdAt: -1 });
  return NextResponse.json({ labels }, { status: 200 });
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

  const { name, color } = await req.json();

  if (!name || !name.trim()) {
    return NextResponse.json(
      { message: "Label name is required" },
      { status: 400 }
    );
  }

  const label = await Label.create({
    name: name.trim(),
    color: color || "#e8a849",
    user: decoded.id,
  });

  return NextResponse.json(
    { message: "Label created successfully", label },
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
    return NextResponse.json({ message: "Label ID is required" }, { status: 400 });
  }

  const label = await Label.findOneAndDelete({ _id: id, user: decoded.id });

  if (!label) {
    return NextResponse.json({ message: "Label not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Label deleted successfully" }, { status: 200 });
}
