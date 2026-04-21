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

export type Role = (typeof ROLES)[number];
export type Stage = (typeof STAGES)[number];

export const ROLE_STAGE_MAP: Record<Role, readonly Stage[]> = {
  admin: STAGES,
  penginput: ["penginputan"],
  peneliti: ["penelitian"],
  pengarsip: ["pengarsipan"],
  pengirim: ["pengiriman"],
  pemeriksa: ["pemeriksaan"],
};
