import { z } from "zod";
import { LIST_KECAMATAN, LIST_DESA } from "@/lib/constants/region";

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

export const serviceTypeOptions = [
  "pengaktifan",
  "mutasi habis update",
  "mutasi habis reguler",
  "mutasi sebagian",
  "pembetulan",
  "objek pajak baru",
] as const;

export const serviceTypeEnum = z.enum(serviceTypeOptions);

const kecamatanEnum = z.enum(LIST_KECAMATAN as [string, ...string[]]);

const desaEnum = z.enum(LIST_DESA as [string, ...string[]]);

export const taskAttachmentSchema = z.object({
  driveLink: z.string().min(1, "Wajib diisi"),
  linkName: z.string().min(1, "Wajib diisi"),
});

export const requestedDataSchema = z.object({
  taxObjectAddress: z.string().min(1, "Wajib diisi"),
  taxObjectVillage: desaEnum,
  taxObjectSubdistrict: kecamatanEnum,
});

export const addRequestedDataSchema = z.object({
  taxpayerName: z.string().min(1, "Wajib diisi"),
  taxpayerAddress: z.string().min(1, "Wajib diisi"),
  taxpayerVillage: z.string().min(1, "Wajib diisi"),
  taxpayerSubdistrict: z.string().min(1, "Wajib diisi"),
  landArea: z.coerce.number().min(1, "Wajib diisi"),
  buildingArea: z.coerce.number().min(1, "Wajib diisi"),
  certificate: z.string().min(1, "Wajib diisi"),
  note: z.string().optional(),
});

export const baseDataSchema = z.object({
  taxpayerName: z.string().min(1, "Wajib diisi"),
  taxpayerAddress: z.string().min(1, "Wajib diisi"),
  taxpayerVillage: z.string().min(1, "Wajib diisi"),
  taxpayerSubdistrict: z.string().min(1, "Wajib diisi"),
  taxObjectAddress: z.string().min(1, "Wajib diisi"),
  taxObjectVillage: desaEnum,
  taxObjectSubdistrict: kecamatanEnum,
  landArea: z.coerce.number().min(1, "Wajib diisi"),
  buildingArea: z.coerce.number().min(1, "Wajib diisi"),
});

export const createTaskSchema = z.object({
  serviceType: serviceTypeEnum,
  nopel: z.string().min(1, "Wajib diisi"),
  nop: z.string().min(1, "Wajib diisi"),

  baseData: baseDataSchema,
  requestedData: requestedDataSchema,

  requestedChanges: z.array(addRequestedDataSchema).default([]),
  dynamicFields: z.record(z.string(), z.string()).default({}),

  attachments: z.array(taskAttachmentSchema).default([]),

  createdBy: z.string().optional(),

  reportId: z.string().optional(),
});

export const taskSchema = createTaskSchema.extend({
  _id: z.string(),

  approvals: z.array(
    z.object({
      stageOrder: z.number(),
      stage: z.string(),
      status: z.enum(["approved", "rejected", "in_progress", "revised"]),
      approvedBy: z.string().nullable().optional(),
      approvedAt: z.date().nullable().optional(),
      note: z.string().optional(),
    }),
  ),

  currentStage: z.string(),

  overallStatus: z.enum(["approved", "rejected", "in_progress", "revised"]),

  isLocked: z.boolean(),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
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
} satisfies Partial<z.infer<typeof createTaskSchema>>;

export const baseDataFieldMeta: Record<
  string,
  { label: string; section: "wp" | "op" | "size" }
> = {
  taxpayerName: { label: "Nama", section: "wp" },
  taxpayerAddress: { label: "Alamat", section: "wp" },
  taxpayerVillage: { label: "Desa", section: "wp" },
  taxpayerSubdistrict: { label: "Kecamatan", section: "wp" },

  taxObjectAddress: { label: "Alamat", section: "op" },
  taxObjectSubdistrict: { label: "Kecamatan", section: "op" },
  taxObjectVillage: { label: "Desa", section: "op" },

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
  taxObjectSubdistrict: {
    label: "Kecamatan OP Baru",
    section: "op",
  },
  taxObjectVillage: {
    label: "Desa OP Baru",
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
  taxpayerSubdistrict: {
    label: "Kecamatan WP Baru",
    section: "wp",
  },
  taxpayerVillage: {
    label: "Desa WP Baru",
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

export const taskAttachmentFieldMeta: Record<
  string,
  { label: string; section: "main" }
> = {
  linkName: { label: "Nama Dokumen", section: "main" },
  driveLink: { label: "Link Dokumen", section: "main" },
};
