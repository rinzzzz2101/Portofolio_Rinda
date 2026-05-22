"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBlogs(publishedOnly = false) {
  try {
    const blogs = await prisma.blog.findMany({
      where: publishedOnly ? { isPublished: true } : {},
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: blogs };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function createBlog(data: {
  title: string;
  content: string;
  category: string;
  tags?: string;
  isPublished?: boolean;
}) {
  try {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
    const blog = await prisma.blog.create({
      data: { ...data, slug },
    });
    revalidatePath("/");
    revalidatePath("/dashboard/blogs");
    return { success: true, data: blog };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal membuat blog" };
  }
}

export async function updateBlog(id: string, data: {
  title: string;
  content: string;
  category: string;
  tags?: string;
  isPublished?: boolean;
}) {
  try {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
    await prisma.blog.update({
      where: { id },
      data: { ...data, slug },
    });
    revalidatePath("/");
    revalidatePath("/dashboard/blogs");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal mengupdate blog" };
  }
}

export async function deleteBlog(id: string) {
  try {
    await prisma.blog.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/dashboard/blogs");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
