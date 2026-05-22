"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// FETCH: Mengambil semua projects
export async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
    // Parse technologies dari string CSV menjadi array
    const parsed = projects.map((p) => ({
      ...p,
      technologies: p.technologies ? p.technologies.split(",").map((t) => t.trim()) : [],
    }));
    return { success: true, data: parsed };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { success: false, data: [] };
  }
}

// CREATE: Menambah project baru
export async function createProject(data: {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  category: string;
  thumbnail?: string;
}) {
  try {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
    const newProject = await prisma.project.create({
      data: {
        title: data.title,
        slug: slug,
        description: data.description,
        technologies: data.technologies.join(","), // MySQL: simpan sebagai CSV
        githubUrl: data.githubUrl,
        demoUrl: data.demoUrl,
        category: data.category,
        thumbnail: data.thumbnail,
        date: new Date(),
      },
    });
    revalidatePath("/");
    revalidatePath("/dashboard/projects");
    return { success: true, data: newProject };
  } catch (error) {
    console.error("Error creating project:", error);
    return { success: false, error: "Gagal membuat project" };
  }
}

// DELETE: Menghapus project
export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false, error: "Gagal menghapus project" };
  }
}

// UPDATE: Mengubah project
export async function updateProject(id: string, data: {
  title?: string;
  description?: string;
  technologies?: string[];
  githubUrl?: string;
  demoUrl?: string;
  category?: string;
  isFeatured?: boolean;
  thumbnail?: string;
}) {
  try {
    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        technologies: data.technologies ? data.technologies.join(",") : undefined,
      },
    });
    revalidatePath("/");
    revalidatePath("/dashboard/projects");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating project:", error);
    return { success: false, error: "Gagal mengubah project" };
  }
}
