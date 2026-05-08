import { z } from 'zod';
import { TASK_SERVICE, SUBDISTRICT_DATA } from '@/constants/task';

export const createTaskSchema = z.object({
    serviceType: z.enum(TASK_SERVICE).describe('Jenis permohonan harus diisi'),
    nopel: z.string().min(11, 'NOPEL harus diisi'),
    nop: z.string().min(18, 'NOP harus diisi'),
    baseData: z.object({
        taxpayerName: z.string().describe('Nama wajib diisi'),
        taxpayerAddress: z.string().describe('Alamat wajib diisi'),
        taxpayerSubdistrict: z.string().describe('Kecamatan wajib diisi'),
        taxpayerVillage: z.string().describe('Kelurahan wajib diisi'),
        taxObjectAddress: z.string().describe('Alamat objek pajak wajib diisi'),
        taxObjectSubdistrict: z.enum(Object.keys(SUBDISTRICT_DATA)).describe('Kecamatan objek pajak wajib diisi'),
        taxObjectVillage: z.enum(Object.values(SUBDISTRICT_DATA).flat()).describe('Kelurahan objek pajak wajib diisi'),
        landArea: z.number().positive('Luas tanah harus lebih besar dari 0').describe('Luas tanah wajib diisi'),
        buildingArea: z.number().positive('Luas bangunan harus lebih besar dari 0').describe('Luas bangunan wajib diisi'),
    }).optional().describe('Data dasar boleh tidak diisi jika jenis permohonan objek pajak baru dan pengaktifan'),
    requestedData: z.object({
        taxObjectAddress: z.string().describe('Alamat objek pajak wajib diisi'),
        taxObjectSubdistrict: z.enum(Object.keys(SUBDISTRICT_DATA)).describe('Kecamatan objek pajak wajib diisi'),
        taxObjectVillage: z.enum(Object.values(SUBDISTRICT_DATA).flat()).describe('Kelurahan objek pajak wajib diisi'),
    }),
    requestedChanges: z.array(z.object({
        taxpayerName: z.string().describe('Nama wajib diisi'),
        taxpayerAddress: z.string().describe('Alamat wajib diisi'),
        taxpayerSubdistrict: z.string().describe('Kecamatan wajib diisi'),
        taxpayerVillage: z.string().describe('Kelurahan wajib diisi'),
        landArea: z.number().positive('Luas tanah harus lebih besar dari 0').describe('Luas tanah wajib diisi'),
        buildingArea: z.number().positive('Luas bangunan harus lebih besar dari 0').describe('Luas bangunan wajib diisi'),
        certificate: z.string().describe('Sertifikat wajib diisi'),
        note: z.string().optional().describe('Catatan jika diperlukan'),
    })).min(1, "Minimal harus ada satu permohonan perubahan"),
    attachments: z.array(z.object({
        driveLink: z.url('Link harus berupa URL').describe('Link drive wajib diisi'),
        linkName: z.string().describe('Nama link wajib diisi'),
    })).optional().describe('Lampiran diisi pada tahap pengarsipan'),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;