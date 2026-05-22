"use server";

import prisma from "@/lib/prisma";

export async function registerProfileView() {
  try {
    await prisma.profileView.create({ data: {} });
    return { success: true };
  } catch (error) {
    console.error("Error registering profile view:", error);
    return { success: false };
  }
}
