"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Task } from "@/models/task";
import { requireRole } from "@/lib/auth/requireRole";
import { z } from "zod";
import { ITaskApproval } from "@/models/task";

const createTaskSchema = z.object({
  serviceType: z.string().min(1),
  nopel: z.string().min(1),
  nop: z.string().min(1),
  baseData: z.object({
    taxpayerName: z.string().min(1),
    taxpayerAddress: z.string().min(1),
    taxpayerVillage: z.string().min(1),
    taxpayerSubdistrict: z.string().min(1),
    taxObjectAddress: z.string().min(1),
    taxObjectVillage: z.string().min(1),
    taxObjectSubdistrict: z.string().min(1),
    landArea: z.coerce.number().min(0),
    buildingArea: z.coerce.number().min(0),
  }),
  requestedData: z.object({
    taxObjectAddress: z.string().min(1),
    taxObjectVillage: z.string().min(1),
    taxObjectSubdistrict: z.string().min(1),
  }),
  requestedChanges: z.array(z.any()).optional(),
  dynamicFields: z.record(z.string(), z.unknown()).optional(),
  attachments: z.array(z.any()).optional(),
});

export async function getTasks() {
  try {
    await requireRole([
      "admin",
      "penginput",
      "peneliti",
      "pengarsip",
      "pengirim",
      "pemeriksa",
    ]);

    await connectDB();

    const tasks = await Task.find({})
      .sort({ createdAt: -1 })
      .lean();

    return tasks;
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}

export async function getTaskById(id: string) {
  try {
    await requireRole([
      "admin",
      "penginput",
      "peneliti",
      "pengarsip",
      "pengirim",
      "pemeriksa",
    ]);

    await connectDB();

    const task = await Task.findById(id).lean();

    if (!task) {
      throw new Error("Task tidak ditemukan");
    }

    return task;
  } catch (error) {
    console.error("Database error:", error);
    return null;
  }
}

export async function createTask(rawData: any) {
  try {
    const user = await requireRole(["admin", "penginput"]);

    const validated = createTaskSchema.parse(rawData);

    await connectDB();

    const defaultApprovals: ITaskApproval[] = [
      {
        stageOrder: 1,
        stage: "penginputan",
        status: "approved",
        approvedBy: user._id,
        approvedAt: new Date(),
        note: "Penginputan selesai, lanjut ke tahap penelitian.",
      },
      {
        stageOrder: 2,
        stage: "penelitian",
        status: "in_progress",
        approvedBy: undefined,
        approvedAt: null,
        note: "",
      },
      {
        stageOrder: 3,
        stage: "pengarsipan",
        status: "in_progress",
        approvedBy: undefined,
        approvedAt: null,
        note: "",
      },
      {
        stageOrder: 4,
        stage: "pengiriman",
        status: "in_progress",
        approvedBy: undefined,
        approvedAt: null,
        note: "",
      },
      {
        stageOrder: 5,
        stage: "pemeriksaan",
        status: "in_progress",
        approvedBy: undefined,
        approvedAt: null,
        note: "",
      },
    ];

    const newTask = await Task.create({
      serviceType: validated.serviceType,
      nopel: validated.nopel,
      nop: validated.nop,
      baseData: validated.baseData,
      requestedData: validated.requestedData,
      requestedChanges: validated.requestedChanges || [],
      dynamicFields: validated.dynamicFields || {},
      attachments: validated.attachments || [],
      approvals: defaultApprovals,
      createdBy: user._id,
      currentStage: "penelitian",
      overallStatus: "in_progress",
      isLocked: false,
    });

    revalidatePath("/tasks");

    return { success: true, data: newTask };
  } catch (error: any) {
    console.error("Create Task Error:", error.message);

    if (error.message === "Unauthorized") {
      return { success: false, message: "Unauthorized" };
    }

    if (error.message === "Forbidden") {
      return { success: false, message: "Forbidden" };
    }

    if (error.code === 11000) {
      return {
        success: false,
        message: "Nomor Pelayanan (nopel) sudah terdaftar.",
      };
    }

    return { success: false, message: error.message };
  }
}