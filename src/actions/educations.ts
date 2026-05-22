"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getEducations() {
  try {
    const edu = await prisma.education.findMany({ orderBy: { startDate: "desc" } });
    return { success: true, data: edu };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function createEducation(data: {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}) {
  try {
    const edu = await prisma.education.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
    revalidatePath("/");
    revalidatePath("/dashboard/education");
    return { success: true, data: edu };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal membuat data pendidikan" };
  }
}

export async function updateEducation(id: string, data: {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}) {
  try {
    await prisma.education.update({
      where: { id },
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
    revalidatePath("/");
    revalidatePath("/dashboard/education");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal mengupdate data pendidikan" };
  }
}

export async function deleteEducation(id: string) {
  try {
    await prisma.education.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/dashboard/education");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus data pendidikan" };
  }
}
