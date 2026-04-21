"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { User } from "@/models/user";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { z } from "zod";
import { ROLES } from "@/lib/constants/roles";

const updateSchema = z.object({
  role: z.enum(ROLES),
});

export async function getUserData() {
  try {
    await requireAdmin();
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

    return safeUsers;
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}

export async function updateUserDetails(id: string, rawData: any) {
  try {
    await requireAdmin();

    const validatedData = updateSchema.parse(rawData);

    await connectDB();

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: id },
      {
        role: validatedData.role,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).lean();

    if (!updatedUser) {
      throw new Error("User tidak ditemukan");
    }

    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    console.error("Update error:", error.message);

    if (error.message === "Unauthorized") {
      return { success: false, message: "Unauthorized" };
    }

    if (error.message === "Forbidden") {
      return { success: false, message: "Forbidden" };
    }

    return { success: false, message: error.message };
  }
}
