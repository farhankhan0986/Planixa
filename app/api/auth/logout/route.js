import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function POST(req) {
    try {
        await connectDB();

        const response = NextResponse.json({ message: "Logout Successful"}, { status: 200 });

        response.cookies.set("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0,
            path: "/",
        })
        return response;
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}