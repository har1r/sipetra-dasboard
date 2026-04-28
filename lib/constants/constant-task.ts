import { z } from "zod";
import { LIST_KECAMATAN, LIST_DESA } from "@/lib/constants/constant-region";
import { STAGES, STATUS, SERVICE_TYPES } from "./constant-user";

export const kecamatanEnum = z.enum(LIST_KECAMATAN as [string, ...string[]]);
export const desaEnum = z.enum(LIST_DESA as [string, ...string[]]);
export const statusEnum = z.enum(STATUS);
export const stageEnum = z.enum(STAGES);
export const serviceTypeEnum = z.enum(SERVICE_TYPES);

export const baseDataSchema = z.object({
  taxpayerName: z.string().min(1, "Wajib diisi"),
  taxpayerAddress: z.string().min(1, "Wajib diisi"),
  taxpayerSubdistrict: z.string().min(1, "Wajib diisi"),
  taxpayerVillage: z.string().min(1, "Wajib diisi"),
  taxObjectAddress: z.string().min(1, "Wajib diisi"),
  taxObjectSubdistrict: kecamatanEnum,
  taxObjectVillage: desaEnum,
  landArea: z.coerce
    .number()
    .min(0, "Tidak boleh negatif")
    .refine((val) => !isNaN(val), "Harus angka valid"),
  buildingArea: z.coerce
    .number()
    .min(0, "Tidak boleh negatif")
    .refine((val) => !isNaN(val), "Harus angka valid"),
});

export const requestedDataSchema = z.object({
  taxObjectAddress: z.string().min(1, "Wajib diisi"),
  taxObjectVillage: desaEnum,
  taxObjectSubdistrict: kecamatanEnum,
});

export const addRequestedDataSchema = z.object({
  taxpayerName: z.string().min(1, "Wajib diisi"),
  taxpayerAddress: z.string().min(1, "Wajib diisi"),
  taxpayerSubdistrict: z.string().min(1, "Wajib diisi"),
  taxpayerVillage: z.string().min(1, "Wajib diisi"),
  landArea: z.coerce
    .number()
    .min(0, "Tidak boleh negatif")
    .refine((val) => !isNaN(val), "Harus angka valid"),
  buildingArea: z.coerce
    .number()
    .min(0, "Tidak boleh negatif")
    .refine((val) => !isNaN(val), "Harus angka valid"),
  certificate: z.string().min(1, "Wajib diisi"),
  note: z.string().optional(),
});

export const taskAttachmentSchema = z.object({
  driveLink: z.string().min(1, "Wajib diisi"),
  linkName: z.string().min(1, "Wajib diisi"),
});

const OPTIONAL_BASEDATA_SERVICES: Set<(typeof SERVICE_TYPES)[number]> = new Set(
  ["objek pajak baru", "pengaktifan"],
);

export const createTaskSchema = z
  .object({
    serviceType: serviceTypeEnum,
    nopel: z.string().min(1, "Wajib diisi"),
    nop: z.string().min(1, "Wajib diisi"),
    baseData: baseDataSchema.optional(),
    requestedData: requestedDataSchema,
    requestedChanges: z.array(addRequestedDataSchema).default([]),
    attachments: z.array(taskAttachmentSchema).optional().default([]),
    dynamicFields: z.record(z.string(), z.string()).default({}),
  })
  .superRefine((data, ctx) => {
    const isBaseDataOptional = OPTIONAL_BASEDATA_SERVICES.has(data.serviceType);

    if (!isBaseDataOptional) {
      if (!data.baseData) {
        ctx.addIssue({
          code: "custom",
          path: ["baseData"],
          message: "Base data wajib diisi untuk layanan ini",
        });
      }
    }
  });

export const taskSchema = createTaskSchema.extend({
  _id: z.string(),
  approvals: z.array(
    z.object({
      stageOrder: z.number(),
      stage: stageEnum,
      status: statusEnum,
      approvedBy: z.string().nullable().optional(),
      approvedAt: z.date().nullable().optional(),
      note: z.string().optional(),
    }),
  ),
  currentStage: stageEnum,
  overallStatus: statusEnum,
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
    taxObjectSubdistrict: "",
    taxObjectVillage: "",
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
  taxpayerSubdistrict: { label: "Kecamatan", section: "wp" },
  taxpayerVillage: { label: "Desa", section: "wp" },

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
