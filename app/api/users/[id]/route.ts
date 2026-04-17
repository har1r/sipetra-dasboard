import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/user";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // Gunakan Promise jika Next.js 15
) {
  try {
    const { id } = await params; // Await params
    const body = await req.json();
    const { role, stages } = body;

    await connectDB();

    // Pastikan ID valid sebelum query
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role, stages },
      { new: true, runValidators: true }, // 'new: true' sama dengan returnDocument: 'after'
    );

    if (!updatedUser) {
      console.log("⚠️ User tidak ditemukan di DB dengan ID:", id);
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("❌ API Route Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
