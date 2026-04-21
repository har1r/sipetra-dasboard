export const KECAMATAN_DATA = {
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

export const LIST_KECAMATAN = Object.keys(KECAMATAN_DATA);

export const LIST_DESA = Object.values(KECAMATAN_DATA).flat();

export type Kecamatan = keyof typeof KECAMATAN_DATA;
export type Desa = (typeof LIST_DESA)[number];