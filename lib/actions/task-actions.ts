"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function getTasks() {
  try {
    const headersList = await headers();

    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const res = await fetch(`${protocol}://${host}/api/tasks`, {
      method: "GET",
      headers: {
        cookie: headersList.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    const result = await res.json();

    if (!res.ok) {
      return [];
    }

    return result.data;
  } catch (error: any) {
    console.error("Get Tasks Error:", error.message);
    return [];
  }
}

export async function createTask(data: any) {
  try {
    const headersList = await headers();

    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const res = await fetch(`${protocol}://${host}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: headersList.get("cookie") ?? "",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: result.error || "Gagal membuat task",
      };
    }

    revalidatePath("/tasks");

    return result;
  } catch (error: any) {
    console.error("Server Action Error:", error.message);

    return {
      success: false,
      message: "Terjadi kesalahan saat menghubungi server",
    };
  }
}
