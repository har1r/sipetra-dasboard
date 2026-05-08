export const TASK_ROLES = [
  "admin",
  "penginput",
  "peneliti",
  "pengarsip",
  "pengirim",
  "pemeriksa",
] as const;

export const TASK_STAGES = [
  "penginputan",
  "penelitian",
  "pengarsipan",
  "pengiriman",
  "pemeriksaan",
] as const;

export const TASK_STATUS = [
  "in_progress",
  "approved",
  "revised",
  "rejected",
] as const;

export const TASK_SERVICE = [
  "pengaktifan",
  "mutasi habis update",
  "mutasi habis reguler",
  "mutasi sebagian",
  "pembetulan",
  "objek pajak baru",
] as const;

export const SUBDISTRICT_DATA = {
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
} as const;

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

export const requestedChangesFieldMeta: Record<
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

export const taskAttachmentsFieldMeta: Record<
  string,
  { label: string; section: "main" }
> = {
  linkName: { label: "Nama Dokumen", section: "main" },
  driveLink: { label: "Link Dokumen", section: "main" },
};