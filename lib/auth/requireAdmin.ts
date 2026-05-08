import { auth } from "@clerk/nextjs/server";
import { User } from "@/models/user";
import connectDB from "@/db/db";

export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await connectDB();

  const user = await User.findOne({ clerkId: userId });

  if (!user || user.role !== "admin") {
    throw new Error("Forbidden");
  }

  return user;
}
