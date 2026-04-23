import { auth } from "@clerk/nextjs/server";
import { User } from "@/models/user";
import connectDB from "@/lib/db";
import { Role } from "@/lib/constants/roles";

export async function requireRole(allowedRoles: Role[]) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await connectDB();

  const user = await User.findOne({ clerkId: userId });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }

  return user;
}
