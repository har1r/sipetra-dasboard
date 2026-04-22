import { z } from "zod";

export const statusEnum = z.enum([
  "in_progress",
  "approved",
  "revised",
  "rejected",
]);

export const stageEnum = z.enum([
  "penginputan",
  "penelitian",
  "pengarsipan",
  "pengiriman",
  "pemeriksaan",
]);

export const serviceTypeEnum = z.enum([
  "pengaktifan",
  "mutasi habis update",
  "mutasi habis reguler",
  "mutasi sebagian",
  "pembetulan",
  "objek pajak baru",
]);

export const taskAttachmentSchema = z.object({
  driveLink: z.string(),
  linkName: z.string(),
  uploadedBy: z.string().optional(),
  uploadedAt: z.coerce.date().nullable().optional(),
});

export const requestedDataSchema = z.object({
  taxObjectAddress: z.string(),
  taxObjectVillage: z.string(),
  taxObjectSubdistrict: z.string(),
});

export const addRequestedDataSchema = z.object({
  taxpayerName: z.string(),
  taxpayerNameSearch: z.string().optional(),
  taxpayerAddress: z.string(),
  taxpayerVillage: z.string(),
  taxpayerSubdistrict: z.string(),
  landArea: z.coerce.number(),
  buildingArea: z.coerce.number(),
  certificate: z.string(),
});

export const taskApprovalSchema = z.object({
  stageOrder: z.number(),
  stage: stageEnum,
  approvedBy: z.string().optional(),
  approvedAt: z.coerce.date().nullable().optional(),
  status: statusEnum,
  note: z.string().optional(),
});

export const baseDataSchema = z.object({
  taxpayerName: z.string(),
  taxpayerNameSearch: z.string().optional(),
  taxpayerAddress: z.string(),
  taxpayerVillage: z.string(),
  taxpayerSubdistrict: z.string(),
  taxObjectAddress: z.string(),
  taxObjectVillage: z.string(),
  taxObjectSubdistrict: z.string(),
  landArea: z.coerce.number(),
  buildingArea: z.coerce.number(),
});

export const taskSchema = z.object({
  _id: z.string(),

  serviceType: serviceTypeEnum,
  nopel: z.string(),
  nop: z.string(),

  baseData: baseDataSchema,
  requestedData: requestedDataSchema,

  requestedChanges: z.array(addRequestedDataSchema).default([]),
  dynamicFields: z.record(z.string(), z.unknown()).default({}),

  attachments: z.array(taskAttachmentSchema).default([]),
  approvals: z.array(taskApprovalSchema).default([]),

  createdBy: z.string().optional(),

  currentStage: stageEnum,
  overallStatus: statusEnum,

  reportId: z.string().optional(),

  revisedHistories: z
    .array(
      z.object({
        revisedAct: z.string(),
        revisedBy: z.string().optional(),
        revisedNote: z.string(),
        revisedAt: z.coerce.date(),
        stageAtRevision: z.string(),
        isResolved: z.boolean(),
      }),
    )
    .default([]),

  isLocked: z.boolean(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const initialTaskForm = {
  serviceType: "objek pajak baru" as const,
  nop: "",
  nopel: "",

  baseData: {
    taxpayerName: "",
    taxpayerAddress: "",
    taxpayerSubdistrict: "",
    taxpayerVillage: "",
    taxObjectAddress: "",
    taxObjectSubdistrict: "",
    taxObjectVillage: "",
    landArea: 0,
    buildingArea: 0,
  },

  requestedData: {
    taxObjectAddress: "",
    taxObjectVillage: "",
    taxObjectSubdistrict: "",
  },

  requestedChanges: [],
  dynamicFields: {},
  attachments: [],
  approvals: [],
  revisedHistories: [],

  currentStage: "penginputan" as const,
  overallStatus: "in_progress" as const,

  isLocked: false,
} satisfies Partial<z.infer<typeof taskSchema>>;

export const baseDataFieldMeta: Record<
  string,
  { label: string; section: "wp" | "op" | "size" }
> = {
  taxpayerName: { label: "Nama", section: "wp" },
  taxpayerAddress: { label: "Alamat", section: "wp" },
  taxpayerVillage: { label: "Desa", section: "wp" },
  taxpayerSubdistrict: { label: "Kecamatan", section: "wp" },

  taxObjectAddress: { label: "Alamat", section: "op" },
  taxObjectVillage: { label: "Desa", section: "op" },
  taxObjectSubdistrict: { label: "Kecamatan", section: "op" },

  landArea: { label: "Luas Tanah", section: "size" },
  buildingArea: { label: "Luas Bangunan", section: "size" },
};

export const requestedDataFieldMeta: Record<
  string,
  { label: string; section: "op" }
> = {
  taxObjectAddress: {
    label: "Alamat OP Baru",
    section: "op",
  },
  taxObjectVillage: {
    label: "Desa OP Baru",
    section: "op",
  },
  taxObjectSubdistrict: {
    label: "Kecamatan OP Baru",
    section: "op",
  },
};

export const addRequestedDataFieldMeta: Record<
  string,
  { label: string; section: "wp" | "size" | "info" }
> = {
  taxpayerName: {
    label: "Nama WP Baru",
    section: "wp",
  },
  taxpayerAddress: {
    label: "Alamat WP Baru",
    section: "wp",
  },
  taxpayerVillage: {
    label: "Desa WP Baru",
    section: "wp",
  },
  taxpayerSubdistrict: {
    label: "Kecamatan WP Baru",
    section: "wp",
  },

  landArea: {
    label: "Luas Tanah Baru",
    section: "size",
  },
  buildingArea: {
    label: "Luas Bangunan Baru",
    section: "size",
  },

  certificate: {
    label: "Sertifikat",
    section: "info",
  },
  note: {
    label: "Catatan",
    section: "info",
  },
};
