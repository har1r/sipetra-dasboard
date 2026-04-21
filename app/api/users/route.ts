import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/user";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const currentUser = await User.findOne({ clerkId: userId });

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await User.find({}).sort({ createdAt: -1 });

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error("Error Get Users:", error.message);
    return NextResponse.json(
      { error: "Gagal mengambil daftar user" },
      { status: 500 },
    );
  }
}
