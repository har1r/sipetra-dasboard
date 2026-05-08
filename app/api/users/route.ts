import { NextResponse } from "next/server";
import connectDB from "@/db/db";
import { User } from "@/models/user";
import { requireRole } from "@/lib/auth/requireRole";

export async function GET() {
  try {
    await requireRole(["admin"]);
    await connectDB();

    const users = await User.find({}).sort({ createdAt: -1 }).lean();

    const safeUsers = users.map((user: any) => ({
      id: user.clerkId,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));

    return NextResponse.json(safeUsers, { status: 200 });
  } catch (error: any) {
    console.error("Error Get Users:", error.message);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Gagal mengambil daftar user" },
      { status: 500 },
    );
  }
}
