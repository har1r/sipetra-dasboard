import mongoose, { Schema, Model, models, model } from "mongoose";

const KECAMATAN_DATA = {
  Pakuhaji: [
    "Kalibaru",
    "Surya Bahari",
    "Sukawali",
    "Kramat",
    "Kohod",
    "Gaga",
    "Kiara Payung",
    "Buaran Bambu",
    "Paku Alam",
    "Buaran Mangga",
    "Pakuhaji",
    "Bunisari",
    "Laksana",
    "Rawaboni",
  ],
  Kosambi: [
    "Salembaran Jaya",
    "Salembaran Jati",
    "Kosambi Barat",
    "Kosambi Timur",
    "Dadap",
    "Jatimulya",
    "Cengklong",
    "Blimbing",
    "Rawa Burung",
    "Rawa Rengas",
  ],
  Teluknaga: [
    "Bojong Renged",
    "Kebon Cau",
    "Teluknaga",
    "Babakan Asem",
    "Kamp Melayu T",
    "Kamp Melayu B",
    "Kampung Besar",
    "Lemo",
    "Tegal Angus",
    "Pangkalan",
    "Tanjung Burung",
    "Tanjung Pasir",
    "Muara",
  ],
  "Sepatan Timur": [
    "Kedaung Barat",
    "Lebak Wangi",
    "Tanah Merah",
    "Jati Mulya",
    "Gempolsari",
    "Sangiang",
    "Pondok Kelor",
    "Kampung Kelor",
  ],
  Sepatan: [
    "Mekarjaya",
    "Karet",
    "Pondok Jaya",
    "Sepatan",
    "Pisangan Jaya",
    "Sarakan",
    "Kayu Agung",
    "Kayu Bongkok",
  ],
};

const LIST_KECAMATAN = Object.keys(KECAMATAN_DATA);
const LIST_DESA = Object.values(KECAMATAN_DATA).flat();

export interface ITaskAttachment {
  driveLink: string;
  linkName: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
}

export interface IRequestedData {
  taxObjectAddress: string;
  taxObjectVillage: string;
  taxObjectSubdistrict: string;
}

export interface IAddRequestedData {
  taxpayerName: string;
  taxpayerNameSearch?: string;
  taxpayerAddress: string;
  taxpayerVillage: string;
  taxpayerSubdistrict: string;
  landArea: number;
  buildingArea: number;
  certificate: string;
  status: "in_progress" | "approved" | "revised" | "rejected";
  note?: string;
}

export interface ITaskApproval {
  stageOrder: number;
  stage:
    | "penginputan"
    | "penelitian"
    | "pengarsipan"
    | "pengiriman"
    | "pemeriksaan";
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date | null;
  status: "in_progress" | "approved" | "revised" | "rejected";
  note?: string;
}

export interface ITask {
  serviceType:
    | "pengaktifan"
    | "mutasi habis update"
    | "mutasi habis reguler"
    | "mutasi sebagian"
    | "pembetulan"
    | "objek pajak baru";

  nopel: string;
  nop: string;

  baseData: {
    taxpayerName: string;
    taxpayerNameSearch?: string;
    taxpayerAddress: string;
    taxpayerVillage: string;
    taxpayerSubdistrict: string;
    taxObjectAddress: string;
    taxObjectVillage: string;
    taxObjectSubdistrict: string;
    landArea: number;
    buildingArea: number;
  };

  requestedData: IRequestedData;
  requestedChanges: IAddRequestedData[];

  dynamicFields: Map<string, any>;
  attachments: ITaskAttachment[];
  approvals: ITaskApproval[];

  createdBy: mongoose.Types.ObjectId;
  currentStage: ITaskApproval["stage"];
  overallStatus: "in_progress" | "approved" | "rejected" | "revised";

  reportId?: mongoose.Types.ObjectId;

  revisedHistories: Array<{
    revisedAct: string;
    revisedBy: mongoose.Types.ObjectId;
    revisedNote: string;
    revisedAt: Date;
    stageAtRevision: string;
    isResolved: boolean;
  }>;

  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  uploadedAt: { type: Date, default: Date.now },
});

const addRequestedDataSchema = new Schema<IAddRequestedData>(
  {
    taxpayerName: { type: String, required: true, trim: true },
    taxpayerNameSearch: { type: String, lowercase: true, trim: true },
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
      enum: [
        "penginputan",
        "penelitian",
        "pengarsipan",
        "pengiriman",
        "pemeriksaan",
      ],
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
    serviceType: { type: String, required: true },
    nopel: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    nop: { type: String, required: true },

    baseData: {
      taxpayerName: { type: String, required: true },
      taxpayerNameSearch: { type: String },
      taxpayerAddress: { type: String, required: true },
      taxpayerVillage: { type: String, required: true, trim: true },
      taxpayerSubdistrict: {
        type: String,
        required: true,
        trim: true,
      },
      taxObjectAddress: { type: String, required: true },
      taxObjectVillage: { type: String, required: true, enum: LIST_DESA },
      taxObjectSubdistrict: {
        type: String,
        required: true,
        enum: LIST_KECAMATAN,
      },
      landArea: { type: Number, required: true },
      buildingArea: { type: Number, required: true },
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
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    currentStage: { type: String, default: "penginputan" },
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
        stageAtRevision: String,
        isResolved: { type: Boolean, default: false },
      },
    ],
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

taskSchema.pre("save", function () {
  const doc = this as mongoose.HydratedDocument<ITask>;

  if (doc.baseData?.taxpayerName) {
    doc.baseData.taxpayerNameSearch = doc.baseData.taxpayerName.toLowerCase();
  }

  if (doc.requestedChanges && doc.requestedChanges.length > 0) {
    doc.requestedChanges.forEach((item) => {
      if (item.taxpayerName) {
        item.taxpayerNameSearch = item.taxpayerName.toLowerCase();
      }
    });
  }

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

const Task: Model<ITask> = models.Task || model<ITask>("Task", taskSchema);

export default Task;