import { NextRequest } from "next/server";
import  connectDB  from "@/db/db";
import {
  createTaskSchema,
} from "@/validations/task.validation";
import {
  createTaskService,
  getTasksService,
} from "@/services/task.service";
import {
  errorResponse,
  successResponse,
} from "@/lib/response";
import { ZodError } from "zod";
import { formatZodError } from "@/utils/zod-error";
import { requireRole } from "@/lib/auth/requireRole";

export async function POST(
  req: NextRequest
) {
  try {
    const user = await requireRole(["admin"]);
    
    await connectDB();
    const body = await req.json();

    const validatedData =
      createTaskSchema.parse(body);

    const initialApprovals = [
      {
        stageOrder: 1,
        stage: "penginputan",
        approvedBy: user.name,
        approvedAt: new Date(),
        status: "approved",
        note: "Input sistem berhasil",
      },
      { stageOrder: 2, stage: "penelitian", status: "in_progress" },
      { stageOrder: 3, stage: "pemeriksaan", status: "in_progress" },
      { stageOrder: 4, stage: "pengarsipan", status: "in_progress" },
      { stageOrder: 5, stage: "pengiriman", status: "in_progress" },
    ];

    const createdTaskData = {
      ...validatedData,
      approvals: initialApprovals,
    };
    const task =
      await createTaskService(
        createdTaskData,
      );

    return successResponse(task, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        JSON.stringify(
          formatZodError(error)
        ),
        400
      );
    }

    return errorResponse(
      "Internal server error"
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const tasks =
      await getTasksService();

    return successResponse(tasks);
  } catch (error) {
    return errorResponse(
      "Internal server error"
    );
  }
}