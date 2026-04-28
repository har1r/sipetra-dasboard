import mongoose, { Schema, Model, models, model, Document } from "mongoose";
import { LIST_KECAMATAN, LIST_DESA } from "@/lib/constants/constant-region";
import {
  SERVICE_TYPES,
  STAGES,
  Status,
  Stage,
  ServiceType,
} from "@/lib/constants/constant-user";

export interface IRequestedData {
  taxObjectAddress: string;
  taxObjectVillage: string;
  taxObjectSubdistrict: string;
}

export interface IAddRequestedData {
  taxpayerName: string;
  taxpayerAddress: string;
  taxpayerSubdistrict: string;
  taxpayerVillage: string;
  landArea: number;
  buildingArea: number;
  certificate: string;
  status: Status;
  note?: string;
}

export interface ITaskApproval {
  stageOrder: number;
  stage: Stage;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date | null;
  status: Status;
  note?: string;
}

export interface ITaskAttachment {
  driveLink: string;
  linkName: string;
  uploadedBy?: mongoose.Types.ObjectId;
  uploadedAt?: Date | null;
}

export interface ITask extends Document {
  serviceType: ServiceType;
  nopel: string;
  nop: string;
  baseData?: {
    taxpayerName?: string;
    taxpayerAddress?: string;
    taxpayerVillage?: string;
    taxpayerSubdistrict?: string;
    taxObjectAddress?: string;
    taxObjectSubdistrict?: string;
    taxObjectVillage?: string;
    landArea?: number;
    buildingArea?: number;
  };
  requestedData: IRequestedData;
  requestedChanges: IAddRequestedData[];
  approvals: ITaskApproval[];
  currentStage: Stage;
  overallStatus: Status;
  reportId?: mongoose.Types.ObjectId;
  dynamicFields: Map<string, string>;
  attachments: ITaskAttachment[];
  revisedHistories: Array<{
    revisedAct: string;
    revisedBy?: mongoose.Types.ObjectId;
    revisedNote: string;
    revisedAt?: Date | null;
    stageAtRevision: Stage;
    isResolved: boolean;
  }>;
  isLocked: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

function calculateStatus(
  items: { status: string }[],
): "in_progress" | "approved" | "revised" | "rejected" {
  if (!items.length) return "in_progress";
  if (items.some((i) => i.status === "rejected")) return "rejected";
  if (items.some((i) => i.status === "revised")) return "revised";
  if (items.every((i) => i.status === "approved")) return "approved";
  return "in_progress";
}

const taskAttachmentSchema = new Schema<ITaskAttachment>({
  driveLink: { type: String, required: true, trim: true },
  linkName: { type: String, required: true, trim: true },
});

const addRequestedDataSchema = new Schema<IAddRequestedData>(
  {
    taxpayerName: { type: String, required: true, trim: true },
    taxpayerAddress: { type: String, required: true, trim: true },
    taxpayerVillage: {
      type: String,
      required: true,
      trim: true,
    },
    taxpayerSubdistrict: {
      type: String,
      required: true,
      trim: true,
    },
    landArea: { type: Number, required: true, min: 0 },
    buildingArea: { type: Number, required: true, min: 0 },
    certificate: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["in_progress", "approved", "revised", "rejected"],
      default: "in_progress",
    },
    note: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const taskApprovalSchema = new Schema<ITaskApproval>(
  {
    stageOrder: { type: Number, required: true },
    stage: {
      type: String,
      enum: STAGES,
      default: "penginputan",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["in_progress", "approved", "revised", "rejected"],
      default: "in_progress",
    },
    note: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const taskSchema = new Schema<ITask>(
  {
    serviceType: { type: String, enum: SERVICE_TYPES, required: true },
    nopel: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true,
    },
    nop: { type: String, required: true, trim: true },
    baseData: {
      taxpayerName: { type: String, trim: true },
      taxpayerAddress: { type: String, trim: true },
      taxpayerSubdistrict: { type: String, trim: true },
      taxpayerVillage: { type: String, trim: true },
      taxObjectAddress: { type: String, trim: true },
      taxObjectSubdistrict: {
        type: String,
        enum: LIST_KECAMATAN,
      },
      taxObjectVillage: { type: String, enum: LIST_DESA },
      landArea: { type: Number },
      buildingArea: { type: Number },
    },

    requestedData: {
      taxObjectAddress: { type: String, required: true, trim: true },
      taxObjectVillage: {
        type: String,
        required: true,
        trim: true,
        enum: LIST_DESA,
      },
      taxObjectSubdistrict: {
        type: String,
        required: true,
        trim: true,
        enum: LIST_KECAMATAN,
      },
    },

    requestedChanges: [addRequestedDataSchema],

    dynamicFields: { type: Map, of: Schema.Types.Mixed, default: {} },
    attachments: [taskAttachmentSchema],
    approvals: [taskApprovalSchema],
    currentStage: {
      type: String,
      enum: STAGES,
      default: "penginputan",
    },
    overallStatus: {
      type: String,
      enum: ["in_progress", "approved", "rejected", "revised"],
      default: "in_progress",
    },
    reportId: { type: Schema.Types.ObjectId, ref: "Report" },
    revisedHistories: [
      {
        revisedAct: String,
        revisedBy: { type: Schema.Types.ObjectId, ref: "User" },
        revisedNote: String,
        revisedAt: { type: Date, default: Date.now },
        stageAtRevision: {
          type: String,
          enum: STAGES,
        },
        isResolved: { type: Boolean, default: false },
      },
    ],
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

taskSchema.pre("save", function () {
  const doc = this as mongoose.HydratedDocument<ITask>;

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

export const Task: Model<ITask> =
  models.Task || model<ITask>("Task", taskSchema);
