"use server";

import prisma from "@/lib/prisma";

export async function getCvInitialData() {
  try {
    const [setting, educations, experiences, organizations, skills, certificates] = await Promise.all([
      prisma.setting.findUnique({ where: { id: "singleton" } }).catch(() => null),
      prisma.education.findMany({ orderBy: { startDate: "desc" } }).catch(() => []),
      prisma.experience.findMany({ orderBy: { startDate: "desc" } }).catch(() => []),
      prisma.organization.findMany({ orderBy: { startDate: "desc" } }).catch(() => []),
      prisma.skill.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }).catch(() => []),
      prisma.certificate.findMany({ orderBy: { issueDate: "desc" } }).catch(() => [])
    ]);

    const rawData = {
      setting,
      educations,
      experiences,
      organizations,
      skills,
      certificates
    };

    return {
      success: true,
      data: JSON.parse(JSON.stringify(rawData))
    };
  } catch (error) {
    console.error("Error getCvInitialData:", error);
    return {
      success: false,
      error: "Gagal mengambil data dari database",
      data: null
    };
  }
}
