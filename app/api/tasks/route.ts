import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Task } from "@/models/task";
import { requireRole } from "@/lib/auth/requireRole";
import { createTaskSchema } from "@/lib/constants/initialTask";
import { ITaskApproval } from "@/models/task";

export async function GET(req: Request) {
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

    const tasks = await Task.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: tasks });
  } catch (error: any) {
    console.error("Get Tasks Error:", error.message);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Gagal mengambil data task" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireRole(["admin", "penginput"]);
    console.log("Membuat task baru oleh user:", user);

    await connectDB();

    const raw = await req.json();
    const parsed = createTaskSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", detail: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

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
      ...data,
      requestedChanges: data.requestedChanges ?? [],
      dynamicFields: data.dynamicFields ?? {},
      attachments: data.attachments ?? [],
      approvals: defaultApprovals,
      createdBy: user._id,
      currentStage: "penelitian",
      overallStatus: "in_progress",
      isLocked: false,
    });

    return NextResponse.json({ success: true, data: newTask }, { status: 201 });
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
