export const ROLE_STAGE_MAP = {
  admin: [
    "penginputan",
    "penelitian",
    "pengarsipan",
    "pengiriman",
    "pemeriksaan",
  ],
  penginput: ["penginputan"],
  peneliti: ["penelitian"],
  pengarsip: ["pengarsipan"],
  pengirim: ["pengiriman"],
  pemeriksa: ["pemeriksaan"],
} as const;