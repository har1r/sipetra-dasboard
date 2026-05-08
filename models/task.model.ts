import mongoose, {
  Schema,
  models,
  model,
  InferSchemaType,
  HydratedDocument,
} from "mongoose";
import {
  TASK_STAGES,
  TASK_STATUS,
  TASK_SERVICE,
  SUBDISTRICT_DATA,
} from "@/constants/task";
import { TaskStatus } from "@/types/task";

const taskSchema = new Schema(
  {
    serviceType: {
      type: String,
      enum: TASK_SERVICE,
      required: true,
    },
    nopel: {
      type: String,
      required: true,
      trim: true,
    },
    nop: {
      type: String,
      required: true,
      trim: true,
    },
    baseData: {
      taxpayerName: { type: String, trim: true },
      taxpayerAddress: { type: String, trim: true },
      taxpayerSubdistrict: { type: String, trim: true },
      taxpayerVillage: { type: String, trim: true },
      taxObjectAddress: { type: String, trim: true },
      taxObjectSubdistrict: {
        type: String,
        enum: Object.keys(SUBDISTRICT_DATA),
      },
      taxObjectVillage: {
        type: String,
        enum: Object.values(SUBDISTRICT_DATA).flat(),
      },
      landArea: { type: Number },
      buildingArea: { type: Number },
    },
    requestedData: {
      taxObjectAddress: { type: String, required: true, trim: true },
      taxObjectSubdistrict: {
        type: String,
        enum: Object.keys(SUBDISTRICT_DATA),
        required: true,
      },
      taxObjectVillage: {
        type: String,
        enum: Object.values(SUBDISTRICT_DATA).flat(),
        required: true,
      },
    },
    requestedChanges: [
      {
        taxpayerName: { type: String, required: true, trim: true },
        taxpayerAddress: { type: String, required: true, trim: true },
        taxpayerSubdistrict: { type: String, required: true, trim: true },
        taxpayerVillage: { type: String, required: true, trim: true },
        landArea: { type: Number, required: true },
        buildingArea: { type: Number, required: true },
        certificate: { type: String, required: true, trim: true },
        status: { type: String, enum: TASK_STATUS, default: "in_progress" },
        note: { type: String, trim: true },
      },
    ],
    attachments: [
      {
        driveLink: { type: String, trim: true },
        linkName: { type: String, trim: true },
        uploadBy: { type: String, trim: true },
        uploadAt: { type: Date },
      },
    ],
    approvals: [
      {
        stageOrder: { type: Number },
        stage: { type: String, enum: TASK_STAGES },
        approvedBy: { type: String, trim: true },
        approvedAt: { type: Date },
        status: { type: String, enum: TASK_STATUS, default: "in_progress" },
        note: { type: String, trim: true },
      },
    ],
    revisionHistory: [
      {
        revisedAct: { type: String, trim: true },
        revisedBy: { type: String, trim: true },
        revisedAt: { type: Date },
        stageAtRevision: { type: String, enum: TASK_STAGES },
        isResolved: { type: Boolean, default: false },
        note: { type: String, trim: true },
      },
    ],
    currentStage: {
      type: String,
      enum: TASK_STAGES,
      default: "penginputan",
    },
    overallStatus: {
      type: String,
      enum: TASK_STATUS,
      default: "in_progress",
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    reportId: {
      type: mongoose.Types.ObjectId,
      ref: "Report",
    },
  },
  { timestamps: true },
);

export type TaskSchemaType = InferSchemaType<typeof taskSchema>;
export type InitialDataType = InferSchemaType<typeof taskSchema> & {
  _id: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};
export type TaskDocument = HydratedDocument<TaskSchemaType>;

function calculateStatus(items: { status: string }[]): TaskStatus {
  if (!items.length) return "in_progress";
  if (items.some((i) => i.status === "rejected")) return "rejected";
  if (items.some((i) => i.status === "revised")) return "revised";
  if (items.every((i) => i.status === "approved")) return "approved";
  return "in_progress";
}

taskSchema.pre("save", function () {
  const doc = this as TaskDocument;

  const requested = doc.requestedChanges || [];
  const approvals = doc.approvals || [];

  if (requested.length > 0) {
    const stageStatus = calculateStatus(requested);

    const currentApproval = approvals.find((a) => a.stage === doc.currentStage);
    if (currentApproval) {
      currentApproval.status = stageStatus;
      currentApproval.approvedAt =
        stageStatus === "approved" ? new Date() : null;
    }
  }

  if (approvals.length > 0) {
    doc.overallStatus = calculateStatus(approvals);
  }
});

export const Task = models.Task || model("Task", taskSchema);
