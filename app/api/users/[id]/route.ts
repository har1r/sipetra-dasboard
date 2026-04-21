import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/user";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { ROLE_STAGE_MAP } from "@/lib/constants/roles";

const schema = z.object({
  role: z.enum([
    "admin",
    "penginput",
    "peneliti",
    "pengarsip",
    "pengirim",
    "pemeriksa",
  ]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    await connectDB();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await User.findOne({ clerkId: userId });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    if (currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", detail: parsed.error },
        { status: 400 },
      );
    }

    const role = parsed.data.role;
    const stages = ROLE_STAGE_MAP[role];

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: id },
      { role, stages },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("API Error:", error.message);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}