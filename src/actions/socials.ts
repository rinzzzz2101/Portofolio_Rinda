"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSocialLinks() {
  try {
    const links = await prisma.socialLink.findMany({
      orderBy: { createdAt: "asc" }
    });
    return { success: true, data: links };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function createSocialLink(data: {
  platform: string;
  url: string;
}) {
  try {
    const link = await prisma.socialLink.create({ data });
    revalidatePath("/");
    revalidatePath("/dashboard/settings");
    return { success: true, data: link };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal menambahkan link sosial media" };
  }
}

export async function deleteSocialLink(id: string) {
  try {
    await prisma.socialLink.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal menghapus link sosial media" };
  }
}
