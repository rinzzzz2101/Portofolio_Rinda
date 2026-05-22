"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getOrganizations() {
  try {
    const org = await prisma.organization.findMany({ orderBy: { startDate: "desc" } });
    return { success: true, data: org };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function createOrganization(data: {
  name: string;
  role: string;
  startDate: string;
  endDate?: string;
  description?: string;
}) {
  try {
    const org = await prisma.organization.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
    revalidatePath("/");
    revalidatePath("/dashboard/organizations");
    return { success: true, data: org };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal membuat data organisasi" };
  }
}

export async function updateOrganization(id: string, data: {
  name: string;
  role: string;
  startDate: string;
  endDate?: string;
  description?: string;
}) {
  try {
    await prisma.organization.update({
      where: { id },
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
    revalidatePath("/");
    revalidatePath("/dashboard/organizations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal mengupdate data organisasi" };
  }
}

export async function deleteOrganization(id: string) {
  try {
    await prisma.organization.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/dashboard/organizations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus data organisasi" };
  }
}
