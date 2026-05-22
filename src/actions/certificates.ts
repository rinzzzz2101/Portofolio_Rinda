"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCertificates() {
  try {
    const certs = await prisma.certificate.findMany({ orderBy: { issueDate: "desc" } });
    return { success: true, data: certs };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function createCertificate(data: {
  name: string;
  issuer: string;
  pdfUrl?: string;
  thumbnail?: string;
  issueDate: string;
}) {
  try {
    const cert = await prisma.certificate.create({
      data: {
        ...data,
        issueDate: new Date(data.issueDate),
      },
    });
    revalidatePath("/");
    revalidatePath("/dashboard/certificates");
    return { success: true, data: cert };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal membuat sertifikat" };
  }
}

export async function updateCertificate(id: string, data: {
  name: string;
  issuer: string;
  pdfUrl?: string;
  thumbnail?: string;
  issueDate: string;
}) {
  try {
    await prisma.certificate.update({
      where: { id },
      data: {
        ...data,
        issueDate: new Date(data.issueDate),
      },
    });
    revalidatePath("/");
    revalidatePath("/dashboard/certificates");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal mengupdate sertifikat" };
  }
}

export async function deleteCertificate(id: string) {
  try {
    await prisma.certificate.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/dashboard/certificates");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus sertifikat" };
  }
}
