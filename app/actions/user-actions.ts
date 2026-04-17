"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getUserData() {
  try {
    const res = await fetch(`${API_URL}/api/users`, {
      cache: "no-store",
    });

    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

export async function updateUserDetails(
  id: string,
  payload: { role?: string; stages?: string[] },
) {
  try {
    const targetUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`;
    console.log("🚀 Calling URL:", targetUrl); // Debugging

    const res = await fetch(targetUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("❌ Server responded with:", errorData);
      throw new Error(errorData.error || "Gagal memperbarui database");
    }

    revalidatePath("/team"); // Pastikan path ini benar (apakah /team atau /dashboard?)
    return { success: true };
  } catch (error: any) {
    console.error("❌ Action error:", error.message);
    return { success: false, message: error.message };
  }
}
