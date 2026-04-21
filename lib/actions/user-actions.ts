"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { User } from "@/models/user";
import { auth } from "@clerk/nextjs/server";

export async function getUserData() {
  try {
    const { userId } = await auth();
    console.log("Authenticated User ID:", userId);
    if (!userId) return [];

    await connectDB();

    const currentUser = await User.findOne({ clerkId: userId });

    if (!currentUser || currentUser.role !== "admin") {
      return [];
    }

    const users = await User.find({}).sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}

export async function updateUserDetails(
  id: string,
  payload: { role?: string; stages?: string[] },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    await connectDB();

    const currentUser = await User.findOne({ clerkId: userId });

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Forbidden");
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: id },
      { $set: payload },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new Error("User tidak ditemukan");
    }

    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    console.error("Update error:", error.message);
    return { success: false, message: error.message };
  }
}