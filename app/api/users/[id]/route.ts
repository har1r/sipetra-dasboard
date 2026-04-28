import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/user";
import { requireRole } from "@/lib/auth/requireRole";
import { z } from "zod";
import { ROLES } from "@/lib/constants/constant-user";

const schema = z.object({
  role: z.enum(ROLES),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["admin"]);
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", detail: parsed.error },
        { status: 400 },
      );
    }

    const { role } = parsed.data;

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: id },
      { role },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).lean();

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    const safeUser = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error: any) {
    console.error("API Error:", error.message);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
