import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Task from "@/models/task";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      serviceType,
      nopel,
      nop,
      baseData,
      requestedData,
      requestedChanges,
      dynamicFields,
      attachments,
      createdBy,
    } = body;

    const defaultApprovals = [
      {
        stageOrder: 1,
        stage: "penginputan",
        status: "approved",
        approvedBy: createdBy,
        approvedAt: new Date(),
        note: "Data pertama kali diinput",
      },
      {
        stageOrder: 2,
        stage: "penelitian",
        status: "in_progress",
        approvedBy: null,
        approvedAt: null,
        note: "",
      },
      {
        stageOrder: 3,
        stage: "pengarsipan",
        status: "in_progress",
        approvedBy: null,
        approvedAt: null,
        note: "",
      },
      {
        stageOrder: 4,
        stage: "pengiriman",
        status: "in_progress",
        approvedBy: null,
        approvedAt: null,
        note: "",
      },
      {
        stageOrder: 5,
        stage: "pemeriksaan",
        status: "in_progress",
        approvedBy: null,
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
      createdBy,
      currentStage: "penelitian",
      overallStatus: "in_progress",
      isLocked: false,
    });

    const savedTask = await newTask.save();

    return NextResponse.json(
      { success: true, data: savedTask },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Create Task Error:", error.message);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Nomor Pelayanan (nopel) sudah terdaftar." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat membuat task." },
      { status: 500 }
    );
  }
}