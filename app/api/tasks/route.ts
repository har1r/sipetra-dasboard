import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Task } from "@/models/task";
import { requireRole } from "@/lib/auth/requireRole";
import { z } from "zod";
import { ITaskApproval } from "@/models/task";

export const createTaskSchema = z.object({
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

export async function POST(req: Request) {
  try {
    const user = await requireRole(["admin", "penginput"]);

    await connectDB();

    const raw = await req.json();
    const parsed = createTaskSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", detail: parsed.error },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const {
      serviceType,
      nopel,
      nop,
      baseData,
      requestedData,
      requestedChanges,
      dynamicFields,
      attachments,
    } = body;

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

    const newTask = new Task({
      serviceType,
      nopel,
      nop,
      baseData: {
        taxpayerName: baseData.taxpayerName,
        taxpayerAddress: baseData.taxpayerAddress,
        taxpayerVillage: baseData.taxpayerVillage,
        taxpayerSubdistrict: baseData.taxpayerSubdistrict,
        taxObjectAddress: baseData.taxObjectAddress,
        taxObjectVillage: baseData.taxObjectVillage,
        taxObjectSubdistrict: baseData.taxObjectSubdistrict,
        landArea: baseData.landArea,
        buildingArea: baseData.buildingArea,
      },
      requestedData: {
        taxObjectAddress: requestedData.taxObjectAddress,
        taxObjectVillage: requestedData.taxObjectVillage,
        taxObjectSubdistrict: requestedData.taxObjectSubdistrict,
      },
      requestedChanges: requestedChanges || [],
      dynamicFields: dynamicFields || {},
      attachments: attachments || [],
      approvals: defaultApprovals,
      createdBy: user._id,
      currentStage: "penelitian",
      overallStatus: "in_progress",
      isLocked: false,
    });

    const savedTask = await newTask.save();

    return NextResponse.json(
      { success: true, data: savedTask },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Create Task Error:", error.message);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Nomor Pelayanan (nopel) sudah terdaftar." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat membuat task." },
      { status: 500 },
    );
  }
}
