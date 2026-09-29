"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSkills() {
  try {
    const skills = await prisma.skill.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
    return { success: true, data: skills };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function createSkill(data: {
  name: string;
  icon?: string;
  level: number;
  category: string;  // "Hard Skill" | "Soft Skill"
}) {
  try {
    const skill = await prisma.skill.create({ data });
    revalidatePath("/");
    revalidatePath("/dashboard", "layout");
    return { success: true, data: skill };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal membuat skill" };
  }
}

export async function updateSkill(id: string, data: {
  name: string;
  icon?: string;
  level: number;
  category: string;
}) {
  try {
    await prisma.skill.update({
      where: { id },
      data,
    });
    revalidatePath("/");
    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal mengupdate skill" };
  }
}

export async function deleteSkill(id: string) {
  try {
    await prisma.skill.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus skill" };
  }
}
