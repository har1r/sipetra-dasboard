import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/user";

// GET: Mendapatkan daftar seluruh user
export async function GET() {
  try {
    await connectDB();

    // Kita ambil data user, urutkan dari yang terbaru daftar
    const users = await User.find({}).sort({ createdAt: -1 });

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error Get Users:", error.message);
    return NextResponse.json(
      { error: "Gagal mengambil daftar user" },
      { status: 500 },
    );
  }
}
