"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMessages() {
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    return { success: true, data: messages };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function createMessage(data: {
  name: string;
  email: string;
  message: string;
}) {
  try {
    const msg = await prisma.contactMessage.create({ data });
    revalidatePath("/dashboard/messages");
    return { success: true, data: msg };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal mengirim pesan" };
  }
}

export async function markMessageRead(id: string) {
  try {
    await prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
    revalidatePath("/dashboard/messages");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteMessage(id: string) {
  try {
    await prisma.contactMessage.delete({ where: { id } });
    revalidatePath("/dashboard/messages");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
