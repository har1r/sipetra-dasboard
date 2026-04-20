"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getTasks() {
  try {
    const res = await fetch(`${API_URL}/api/tasks`, {
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Gagal mengambil data task");
    }

    return await res.json();
  } catch (error) {
    console.error("Fetch Tasks Error:", error);
    return { success: false, data: [] };
  }
}

export async function getTaskById(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/tasks/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Task tidak ditemukan");
    }

    return await res.json();
  } catch (error) {
    console.error("Fetch Task Detail Error:", error);
    return { success: false, data: null };
  }
}

export async function createTask(formData: any) {
  try {
    const res = await fetch(`${API_URL}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "Gagal membuat task baru");
    }

    revalidatePath("/tasks"); 
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}