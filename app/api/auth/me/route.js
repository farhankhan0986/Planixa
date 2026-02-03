import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req) {
    const token = req.cookies.get("token")?.value;
    if(!token) {
        return NextResponse.json({ message: "Unauthorized", loggedIn: false }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await connectDB();

        const user = await User.findById(decoded.id).select("-password");
        if(!user) {
            return NextResponse.json({ message: "User not found", loggedIn: false }, { status: 404 });
        }
        return NextResponse.json({ loggedIn: true, user }, { status: 200 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Internal Server Error", loggedIn: false }, { status: 500 });
    }
}