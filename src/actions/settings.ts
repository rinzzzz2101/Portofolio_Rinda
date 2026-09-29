"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const SINGLETON_ID = "singleton";

export async function getSettings() {
  try {
    const setting = await prisma.setting.findUnique({ where: { id: SINGLETON_ID } });
    if (!setting) {
      return {
        success: true,
        data: {
          id: SINGLETON_ID,
          siteTitle: "Portfolio.",
          faviconUrl: null,
          name: "", role: "", hireStatus: "", description: "", about: "",
          email: "", phone: "", location: "",
          github: "", linkedin: "", instagram: "", twitter: "",
          cvUrl: "", cvFileName: "",
          cvActive: true,
          socialActive: true,
          overviewActive: true,
          projectsActive: true,
          skillsActive: true,
          experienceActive: true,
          educationActive: true,
          organizationsActive: true,
          certificatesActive: true,
          blogsActive: true,
          messagesActive: true,
        }
      };
    }
    const { adminPassword, ...safeSetting } = setting;
    return { success: true, data: safeSetting };
  } catch (error) {
    return { success: false, data: null };
  }
}

export async function saveSettings(data: {
  siteTitle?: string;
  faviconUrl?: string;
  name: string;
  role: string;
  hireStatus: string;
  description: string;
  about: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  instagram: string;
  twitter: string;
  cvUrl: string;
  cvFileName: string;
  cvActive?: boolean;
  socialActive?: boolean;
  overviewActive?: boolean;
  projectsActive?: boolean;
  skillsActive?: boolean;
  experienceActive?: boolean;
  educationActive?: boolean;
  organizationsActive?: boolean;
  certificatesActive?: boolean;
  blogsActive?: boolean;
  messagesActive?: boolean;
}) {
  try {
    await prisma.setting.upsert({
      where: { id: SINGLETON_ID },
      update: data,
      create: { id: SINGLETON_ID, ...data },
    });
    revalidatePath("/");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal menyimpan pengaturan" };
  }
}
