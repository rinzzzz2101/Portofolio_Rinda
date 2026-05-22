"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getExperiences() {
  try {
    const exp = await prisma.experience.findMany({ orderBy: { startDate: "desc" } });
    return { success: true, data: exp };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function createExperience(data: {
  position: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description: string;
}) {
  try {
    const exp = await prisma.experience.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
    revalidatePath("/");
    revalidatePath("/dashboard/experience");
    return { success: true, data: exp };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal membuat experience" };
  }
}

export async function updateExperience(id: string, data: {
  position: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description: string;
}) {
  try {
    await prisma.experience.update({
      where: { id },
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
    revalidatePath("/");
    revalidatePath("/dashboard/experience");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal mengupdate experience" };
  }
}

export async function deleteExperience(id: string) {
  try {
    await prisma.experience.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/dashboard/experience");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus experience" };
  }
}
