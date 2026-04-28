export const ROLES = [
  "admin",
  "penginput",
  "peneliti",
  "pengarsip",
  "pengirim",
  "pemeriksa",
] as const;

export const STAGES = [
  "penginputan",
  "penelitian",
  "pengarsipan",
  "pengiriman",
  "pemeriksaan",
] as const;

export const STATUS = [
  "in_progress",
  "approved",
  "revised",
  "rejected",
] as const;

export const SERVICE_TYPES = [
  "pengaktifan",
  "mutasi habis update",
  "mutasi habis reguler",
  "mutasi sebagian",
  "pembetulan",
  "objek pajak baru",
] as const;

export type Role = (typeof ROLES)[number];
export type Stage = (typeof STAGES)[number];
export type Status = (typeof STATUS)[number];
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const ROLE_STAGE_MAP: Record<Role, readonly Stage[]> = {
  admin: STAGES,
  penginput: ["penginputan"],
  peneliti: ["penelitian"],
  pengarsip: ["pengarsipan"],
  pengirim: ["pengiriman"],
  pemeriksa: ["pemeriksaan"],
};
