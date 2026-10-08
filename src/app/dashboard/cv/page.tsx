"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  FileBadge, 
  GraduationCap, 
  Briefcase, 
  Building2, 
  User, 
  Download, 
  RotateCcw, 
  Plus, 
  Trash2, 
  X, 
  ZoomIn, 
  ZoomOut, 
  CheckCircle2, 
  Eye,
  Move,
  FileText,
  Printer,
  Sparkles,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast-provider";
import { getCvInitialData } from "@/actions/cv";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface EducationItem {
  id: string;
  institution: string;
  major: string;
  period: string;
}

interface ExperienceBullet {
  id: string;
  text: string;
  year?: string;
}

interface ExperienceItem {
  id: string;
  title: string;
  period?: string;
  bullets: ExperienceBullet[];
}

interface OrganizationItem {
  id: string;
  name: string;
  role: string;
  period: string;
}

const DEFAULT_CV_DATA = {
  name: "RINDA",
  email: "rinda.dev21@gmail.com",
  phone: "(+62)8121-413-7112",
  location: "Kec. Kawali, Kab. Ciamis",
  about: "Saya merupakan lulusan SMK jurusan Rekayasa Perangkat Lunak yang memiliki semangat kerja tinggi, disiplin, jujur, dan bertanggung jawab dalam bekerja. Mampu bekerja sama dalam tim maupun individu, cepat belajar hal baru, serta siap bekerja di bawah tekanan dan target kerja perusahaan. Saya juga siap bekerja shift dan mengikuti aturan perusahaan dengan baik.",
  educations: [
    {
      id: "edu-1",
      institution: "SMKN 1 Kawali Jurusan Rekayasa Perangkat Lunak",
      major: "",
      period: "2023 - 2026"
    },
    {
      id: "edu-2",
      institution: "SMPN 1 Kawali",
      major: "",
      period: "2020 - 2023"
    }
  ] as EducationItem[],
  experiences: [
    {
      id: "exp-1",
      title: "PKL PT.Inovindo Digital Media",
      period: "SEPTEMBER 2025 - FEBRUARI 2026",
      bullets: [
        { id: "b-1", text: "Membantu pengelolaan aplikasi dan website" },
        { id: "b-2", text: "Membuat UI/UX sederhana" },
        { id: "b-3", text: "Belajar kedisiplinan dan tanggung jawab kerja" }
      ]
    },
    {
      id: "exp-2",
      title: "Pelatihan SMKN 1 Kawali",
      period: "",
      bullets: [
        { id: "b-4", text: "Mengikuti zoom pelatihan membuat landing page", year: "2025" },
        { id: "b-5", text: "Berpartisipasi dalam pengembangan fathschool", year: "2025" },
        { id: "b-6", text: "Mengikuti program digitalisasi pendidikan pandi bersama dinas pendidikan Jawa Barat", year: "2024" }
      ]
    }
  ] as ExperienceItem[],
  organizations: [
    {
      id: "org-1",
      name: "Himpunan PPLG",
      role: "Anggota korlap Himpunan PPLG",
      period: "2024 - 2025"
    },
    {
      id: "org-2",
      name: "Ekstrakurikuler IT",
      role: "Ketua divisi ICT pada ekstrakurikuler IT",
      period: "2023 - 2025"
    }
  ] as OrganizationItem[],
  hardSkills: [
    "Memahami dasar proses produksi",
    "Mampu bekerja sesuai target kerja",
    "Memahami dasar Quality Control",
    "Penggunaan komputer dasar (Microsoft Office)",
    "Memahami standar K3 lingkungan kerja",
    "Mampu mengoperasikan perangkat komputer"
  ],
  softSkills: [
    "Disiplin dan bertanggung jawab",
    "Mampu bekerja sama dalam tim",
    "Cepat belajar dan mudah beradaptasi",
    "Teliti dan fokus dalam bekerja",
    "Mampu bekerja di bawah tekanan",
    "Memiliki komunikasi yang baik"
  ]
};

export default function CvEditorPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [cvData, setCvData] = useState(DEFAULT_CV_DATA);
  const [zoomScale, setZoomScale] = useState<number>(1);

  // State Modal Pembesar Preview (Full A4) persis seperti Surat Lamaran
  const [isEnlargedOpen, setIsEnlargedOpen] = useState(false);
  
  // State Floating Mini Preview (Bisa digeser & di-resize, default tersembunyi)
  const [isMiniPreviewVisible, setIsMiniPreviewVisible] = useState(false);
  const [miniPos, setMiniPos] = useState<{ x: number; y: number } | null>(null);
  const [miniSize, setMiniSize] = useState<{ width: number; height: number }>({ width: 190, height: 268 });

  // Modal Download PDF CV Saja
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("CV_Rinda.pdf");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Ref canvas
  const cvPrintRef = useRef<HTMLDivElement>(null);

  // Helper batas sisi kanan sidebar agar floating preview tidak menutupi sidebar
  const getSidebarBoundary = () => {
    if (typeof document === "undefined") return 256;
    const aside = document.querySelector("aside");
    if (aside) {
      const rect = aside.getBoundingClientRect();
      if (rect.right > 0 && rect.width > 0) {
        return rect.right;
      }
    }
    return typeof window !== "undefined" && window.innerWidth >= 768 ? 256 : 0;
  };

  // Inisialisasi awal posisi floating mini preview di pojok kanan atas
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const defaultW = 190;
      const minX = getSidebarBoundary() + 10;
      setMiniPos({
        x: Math.max(minX, window.innerWidth - defaultW - 24),
        y: 84,
      });
    }
  }, []);

  // Monitor resize window untuk floating mini preview
  useEffect(() => {
    const handleWindowResize = () => {
      setMiniPos((prev) => {
        if (!prev) return null;
        const minX = getSidebarBoundary() + 10;
        const maxX = Math.max(minX, window.innerWidth - miniSize.width - 10);
        return {
          x: Math.max(minX, Math.min(maxX, prev.x)),
          y: Math.max(10, Math.min(window.innerHeight - 80, prev.y)),
        };
      });
    };
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [miniSize.width]);

  // Drag logic untuk memindahkan mini preview
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);

  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isDraggingRef.current = false;
    const currentX = miniPos?.x ?? (typeof window !== "undefined" ? window.innerWidth - miniSize.width - 24 : 0);
    const currentY = miniPos?.y ?? 84;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: currentX,
      initY: currentY,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      isDraggingRef.current = true;
    }
    const maxW = typeof window !== "undefined" ? window.innerWidth : 1200;
    const maxH = typeof window !== "undefined" ? window.innerHeight : 800;

    const minX = getSidebarBoundary() + 10;
    const maxX = Math.max(minX, maxW - miniSize.width - 10);

    const newX = Math.max(minX, Math.min(maxX, dragStartRef.current.initX + dx));
    const newY = Math.max(10, Math.min(maxH - 80, dragStartRef.current.initY + dy));
    setMiniPos({ x: newX, y: newY });
  };

  const handleDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      dragStartRef.current = null;
    }
  };

  // Resize logic untuk mini preview dari pojok
  const resizeRef = useRef<{
    startX: number;
    initW: number;
    initX: number;
    corner: "bottom-right" | "bottom-left";
  } | null>(null);

  const handleResizeStart = (e: React.PointerEvent, corner: "bottom-right" | "bottom-left") => {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const currentX = miniPos?.x ?? (typeof window !== "undefined" ? window.innerWidth - miniSize.width - 24 : 0);
    resizeRef.current = {
      startX: e.clientX,
      initW: miniSize.width,
      initX: currentX,
      corner,
    };
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    const { startX, initW, initX, corner } = resizeRef.current;
    const minX = getSidebarBoundary() + 10;
    const maxViewportW = typeof window !== "undefined" ? window.innerWidth : 1200;

    let newW = initW;
    if (corner === "bottom-right") {
      const currentLeft = miniPos?.x ?? initX;
      const maxAvailableW = Math.max(140, maxViewportW - currentLeft - 10);
      const dx = e.clientX - startX;
      newW = Math.max(140, Math.min(maxAvailableW, initW + dx));
    } else {
      const currentRightEdge = initX + initW;
      const maxAllowedW = Math.max(140, currentRightEdge - minX);
      const dx = startX - e.clientX;
      newW = Math.max(140, Math.min(maxAllowedW, initW + dx));
      const newX = currentRightEdge - newW;
      setMiniPos((prev) => ({ x: newX, y: prev?.y ?? 84 }));
    }
    const newH = Math.round(newW * 1.414);
    setMiniSize({ width: newW, height: newH });
  };

  const handleResizeEnd = (e: React.PointerEvent) => {
    if (resizeRef.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      resizeRef.current = null;
    }
  };

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isEnlargedOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isEnlargedOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEnlargedOpen) setIsEnlargedOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEnlargedOpen]);

  // Auto-load saat halaman dibuka: Muat dari localStorage atau langsung sinkron database
  useEffect(() => {
    const initCv = async () => {
      try {
        const savedCv = localStorage.getItem("cv_editor_draft");
        if (savedCv) {
          setCvData(JSON.parse(savedCv));
        } else {
          // Otomatis sinkron dari database portfolio
          const res = await getCvInitialData();
          if (res.success && res.data) {
            const { setting, educations, experiences, organizations, skills } = res.data;
            const updatedCv: typeof DEFAULT_CV_DATA = {
              name: setting?.name ? setting.name.toUpperCase() : DEFAULT_CV_DATA.name,
              email: setting?.email || DEFAULT_CV_DATA.email,
              phone: setting?.phone || DEFAULT_CV_DATA.phone,
              location: setting?.location || DEFAULT_CV_DATA.location,
              about: setting?.about || setting?.description || DEFAULT_CV_DATA.about,
              educations: educations.length > 0 ? educations.map((e: any) => ({
                id: e.id,
                institution: `${e.institution} ${e.degree ? `(${e.degree})` : ""} ${e.fieldOfStudy ? `Jurusan ${e.fieldOfStudy}` : ""}`.trim(),
                major: e.fieldOfStudy || "",
                period: `${new Date(e.startDate).getFullYear()} - ${e.endDate ? new Date(e.endDate).getFullYear() : "Sekarang"}`
              })) : DEFAULT_CV_DATA.educations,
              experiences: experiences.length > 0 ? experiences.map((exp: any) => ({
                id: exp.id,
                title: `${exp.position} ${exp.company ? `di ${exp.company}` : ""}`.trim(),
                period: `${new Date(exp.startDate).toLocaleDateString("id-ID", { month: "short", year: "numeric" }).toUpperCase()} - ${exp.endDate ? new Date(exp.endDate).toLocaleDateString("id-ID", { month: "short", year: "numeric" }).toUpperCase() : "SEKARANG"}`,
                bullets: exp.description ? exp.description.split("\n").filter(Boolean).map((line: string, idx: number) => ({
                  id: `b-${idx}`,
                  text: line.replace(/^[•\-\*]\s*/, "")
                })) : [{ id: "b-default", text: exp.position }]
              })) : DEFAULT_CV_DATA.experiences,
              organizations: organizations.length > 0 ? organizations.map((org: any) => ({
                id: org.id,
                name: org.name,
                role: `${org.role} pada ${org.name}`,
                period: `${new Date(org.startDate).getFullYear()} - ${org.endDate ? new Date(org.endDate).getFullYear() : "Sekarang"}`
              })) : DEFAULT_CV_DATA.organizations,
              hardSkills: skills.filter((s: any) => s.category?.toLowerCase().includes("hard") || s.category?.toLowerCase().includes("tech")).map((s: any) => s.name).length > 0
                ? skills.filter((s: any) => s.category?.toLowerCase().includes("hard") || s.category?.toLowerCase().includes("tech")).map((s: any) => s.name)
                : DEFAULT_CV_DATA.hardSkills,
              softSkills: skills.filter((s: any) => s.category?.toLowerCase().includes("soft")).map((s: any) => s.name).length > 0
                ? skills.filter((s: any) => s.category?.toLowerCase().includes("soft")).map((s: any) => s.name)
                : DEFAULT_CV_DATA.softSkills
            };
            setCvData(updatedCv);
            localStorage.setItem("cv_editor_draft", JSON.stringify(updatedCv));
          }
        }
      } catch (e) {
        console.error("Init CV error:", e);
      }
    };
    initCv();
  }, []);

  // Otomatis Simpan Perubahan ke LocalStorage setiap kali form diubah
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("cv_editor_draft", JSON.stringify(cvData));
    } catch (e) {
      console.error("Auto-save error:", e);
    }
  }, [cvData, mounted]);

  const resetCvToDefault = () => {
    setCvData(DEFAULT_CV_DATA);
    localStorage.removeItem("cv_editor_draft");
    toast("Format CV direset ke template bawaan", "info");
  };

  const handleOpenDownloadModal = () => {
    const cleanName = (cvData.name || "Pelamar").replace(/[^a-zA-Z0-9]/g, "_");
    setPdfFileName(`CV_${cleanName}.pdf`);
    setIsDownloadModalOpen(true);
  };

  const handleDownloadCvOnly = async () => {
    if (!cvPrintRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfPageWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      const cvClone = cvPrintRef.current.cloneNode(true) as HTMLElement;
      cvClone.style.transform = "none";
      cvClone.style.position = "fixed";
      cvClone.style.left = "-9999px";
      cvClone.style.top = "0";
      cvClone.style.width = "794px";
      cvClone.style.minHeight = "1123px";
      cvClone.style.backgroundColor = "#ffffff";
      cvClone.style.color = "#000000";
      cvClone.style.display = "block";
      document.body.appendChild(cvClone);

      const cvCanvas = await html2canvas(cvClone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false
      });
      document.body.removeChild(cvClone);

      const cvImgData = cvCanvas.toDataURL("image/png");
      const cvImgHeight = (cvCanvas.height * pdfPageWidth) / cvCanvas.width;

      pdf.addImage(cvImgData, "PNG", 0, 0, pdfPageWidth, Math.min(cvImgHeight, pdfPageHeight));
      
      const finalName = pdfFileName.trim().endsWith(".pdf") ? pdfFileName.trim() : `${pdfFileName.trim()}.pdf`;
      pdf.save(finalName);

      toast(`File "${finalName}" berhasil diunduh!`, "success");
      setIsDownloadModalOpen(false);
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast("Terjadi kesalahan saat mengunduh CV.", "error");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Helper CRUD CV
  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: "Nama Sekolah / Kampus",
      major: "Jurusan",
      period: "2024 - 2027"
    };
    setCvData(prev => ({ ...prev, educations: [...prev.educations, newEdu] }));
  };

  const handleRemoveEducation = (id: string) => {
    setCvData(prev => ({ ...prev, educations: prev.educations.filter(e => e.id !== id) }));
  };

  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      title: "Nama Tempat / Posisi Pengalaman",
      period: "2025 - 2026",
      bullets: [{ id: `b-${Date.now()}`, text: "Deskripsi tanggung jawab atau pencapaian kerja" }]
    };
    setCvData(prev => ({ ...prev, experiences: [...prev.experiences, newExp] }));
  };

  const handleRemoveExperience = (id: string) => {
    setCvData(prev => ({ ...prev, experiences: prev.experiences.filter(e => e.id !== id) }));
  };

  const handleAddExpBullet = (expId: string) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => {
        if (exp.id === expId) {
          return {
            ...exp,
            bullets: [...exp.bullets, { id: `b-${Date.now()}`, text: "Poin kegiatan / tanggung jawab baru" }]
          };
        }
        return exp;
      })
    }));
  };

  const handleRemoveExpBullet = (expId: string, bulletId: string) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => {
        if (exp.id === expId) {
          return {
            ...exp,
            bullets: exp.bullets.filter(b => b.id !== bulletId)
          };
        }
        return exp;
      })
    }));
  };

  const handleAddOrganization = () => {
    const newOrg: OrganizationItem = {
      id: `org-${Date.now()}`,
      name: "Nama Organisasi",
      role: "Peran / Jabatan dalam Organisasi",
      period: "2024 - 2025"
    };
    setCvData(prev => ({ ...prev, organizations: [...prev.organizations, newOrg] }));
  };

  const handleRemoveOrganization = (id: string) => {
    setCvData(prev => ({ ...prev, organizations: prev.organizations.filter(o => o.id !== id) }));
  };

  const handleAddHardSkill = () => {
    setCvData(prev => ({ ...prev, hardSkills: [...prev.hardSkills, "Keahlian teknis baru"] }));
  };

  const handleRemoveHardSkill = (index: number) => {
    setCvData(prev => ({ ...prev, hardSkills: prev.hardSkills.filter((_, i) => i !== index) }));
  };

  const handleAddSoftSkill = () => {
    setCvData(prev => ({ ...prev, softSkills: [...prev.softSkills, "Kemampuan interpersonal baru"] }));
  };

  const handleRemoveSoftSkill = (index: number) => {
    setCvData(prev => ({ ...prev, softSkills: prev.softSkills.filter((_, i) => i !== index) }));
  };

  // Render Lembar CV Kertas A4
  const renderA4CvContent = () => (
    <div
      ref={cvPrintRef}
      className="w-[794px] min-h-[1123px] bg-white text-black p-[50px] font-sans shadow-2xl flex flex-col justify-between"
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#111827"
      }}
    >
      <div className="space-y-4">
        {/* 1. Header Nama & Kontak */}
        <div className="text-center pb-2">
          <h1 className="text-3xl font-black tracking-widest text-[#1e3a8a] mb-1.5 uppercase">
            {cvData.name || "RINDA"}
          </h1>
          <div className="text-[12.5px] text-gray-800 font-medium tracking-tight flex items-center justify-center flex-wrap gap-x-2">
            <span>{cvData.email}</span>
            <span>|</span>
            <span>{cvData.phone}</span>
            <span>|</span>
            <span>{cvData.location}</span>
          </div>
          <div className="w-full border-b-[1.5px] border-[#1e3a8a] mt-3"></div>
        </div>

        {/* 2. TENTANG SAYA */}
        <div className="space-y-1">
          <h2 className="text-[14.5px] font-extrabold tracking-wide text-[#1e3a8a] uppercase">
            TENTANG SAYA
          </h2>
          <div className="w-full border-b border-gray-900 mb-2"></div>
          <p className="text-[12px] leading-relaxed text-justify text-gray-900 font-normal">
            {cvData.about}
          </p>
        </div>

        {/* 3. PENDIDIKAN */}
        <div className="space-y-1">
          <h2 className="text-[14.5px] font-extrabold tracking-wide text-[#1e3a8a] uppercase">
            PENDIDIKAN
          </h2>
          <div className="w-full border-b border-gray-900 mb-2"></div>
          <div className="space-y-1.5">
            {cvData.educations.map((edu, idx) => (
              <div key={edu.id || idx} className="flex justify-between items-baseline text-[12px]">
                <span className="font-bold text-gray-900 pr-4">{edu.institution}</span>
                <span className="font-bold text-gray-900 whitespace-nowrap">{edu.period}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. PENGALAMAN */}
        <div className="space-y-1">
          <h2 className="text-[14.5px] font-extrabold tracking-wide text-[#1e3a8a] uppercase">
            PENGALAMAN
          </h2>
          <div className="w-full border-b border-gray-900 mb-2"></div>
          <div className="space-y-3">
            {cvData.experiences.map((exp, idx) => (
              <div key={exp.id || idx} className="space-y-1">
                <div className="flex justify-between items-baseline text-[12px]">
                  <span className="font-bold text-gray-900">{exp.title}</span>
                  {exp.period && (
                    <span className="font-bold text-gray-900 whitespace-nowrap text-[11px] uppercase">
                      {exp.period}
                    </span>
                  )}
                </div>
                <ul className="space-y-1 pl-4">
                  {exp.bullets.map((b, bIdx) => (
                    <li key={b.id || bIdx} className="flex justify-between items-baseline text-[11.5px] leading-snug">
                      <span className="text-gray-900 before:content-['•'] before:mr-2 before:text-gray-900">
                        {b.text}
                      </span>
                      {b.year && (
                        <span className="font-bold text-gray-900 whitespace-nowrap pl-4 text-[11px]">
                          {b.year}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 5. ORGANISASI */}
        <div className="space-y-1">
          <h2 className="text-[14.5px] font-extrabold tracking-wide text-[#1e3a8a] uppercase">
            ORGANISASI
          </h2>
          <div className="w-full border-b border-gray-900 mb-2"></div>
          <div className="space-y-1.5">
            {cvData.organizations.map((org, idx) => (
              <div key={org.id || idx} className="flex justify-between items-baseline text-[12px]">
                <span className="text-gray-900 before:content-['•'] before:mr-2 before:text-gray-900 font-medium">
                  {org.role}
                </span>
                <span className="font-bold text-gray-900 whitespace-nowrap">{org.period}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. HARD SKILL */}
        <div className="space-y-1">
          <h2 className="text-[14.5px] font-extrabold tracking-wide text-[#1e3a8a] uppercase">
            HARD SKILL
          </h2>
          <div className="w-full border-b border-gray-900 mb-2"></div>
          <ol className="space-y-0.5 pl-4 text-[12px] text-gray-900">
            {cvData.hardSkills.map((skill, idx) => (
              <li key={idx} className="leading-snug">
                {idx + 1}. {skill}
              </li>
            ))}
          </ol>
        </div>

        {/* 7. SOFT SKILL */}
        <div className="space-y-1">
          <h2 className="text-[14.5px] font-extrabold tracking-wide text-[#1e3a8a] uppercase">
            SOFT SKILL
          </h2>
          <div className="w-full border-b border-gray-900 mb-2"></div>
          <ol className="space-y-0.5 pl-4 text-[12px] text-gray-900">
            {cvData.softSkills.map((skill, idx) => (
              <li key={idx} className="leading-snug">
                {idx + 1}. {skill}
              </li>
            ))}
          </ol>
        </div>

      </div>
    </div>
  );

  if (!mounted) return null;

  return (
    <div className="min-h-full flex flex-col bg-background text-foreground transition-colors">
      
      {/* ===================== STICKY TOP ACTION BAR (PERSIS SEPERTI SURAT LAMARAN) ===================== */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-zinc-700/10 border border-zinc-600/20 text-foreground">
              <FileBadge className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Edit Curriculum Vitae (CV)
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Format ATS-friendly elegan sesuai standar resmi dengan warna aksen biru navy.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Top */}
        <div className="flex items-center gap-2">
          {/* Tombol Toggle Floating Mini Preview */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsMiniPreviewVisible(!isMiniPreviewVisible)}
            className="border-border bg-muted text-foreground hover:text-foreground text-xs h-9"
            title={isMiniPreviewVisible ? "Sembunyikan pratinjau CV" : "Tampilkan pratinjau CV mengambang"}
          >
            <Eye className="w-3.5 h-3.5 mr-1.5 text-foreground" />
            <span>Lihat Hasil</span>
            {isMiniPreviewVisible ? (
              <span className="w-1.5 h-1.5 ml-1.5 rounded-full bg-blue-400 animate-pulse" />
            ) : (
              <span className="w-1.5 h-1.5 ml-1.5 rounded-full bg-zinc-500" />
            )}
          </Button>

          {/* Tombol Download PDF CV Saja */}
          <Button
            type="button"
            size="sm"
            onClick={handleOpenDownloadModal}
            className="bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs h-9 shadow-lg shadow-md"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download CV Saja
          </Button>

          {/* Tombol Menuju Download Berkas Lengkap (+Sertifikat) */}
          <Link href="/dashboard/download-berkas">
            <Button
              type="button"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 shadow-md flex items-center gap-1.5"
              title="Atur Susunan & Download Dokumen Lengkap beserta Sertifikat"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Berkas (+Sertifikat)</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* ===================== FLOATING MINI PREVIEW (BISA DIGESER & DIRESIZE DARI POJOK BAWAH) ===================== */}
      {isMiniPreviewVisible && (
        <div 
          className="no-print fixed z-30 select-none"
          style={
            miniPos 
              ? { left: `${miniPos.x}px`, top: `${miniPos.y}px` } 
              : { right: "24px", top: "84px" }
          }
        >
          <div 
            className="flex flex-col rounded-xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.7)] border-2 border-border/90 bg-card backdrop-blur-md transition-shadow hover:border-zinc-500/80 ring-1 ring-white/10"
            style={{ width: `${miniSize.width}px` }}
          >
            {/* Header Drag Bar (Bisa di-drag untuk memindahkan posisi) */}
            <div
              onPointerDown={handleDragStart}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
              onPointerCancel={handleDragEnd}
              className="flex items-center justify-between px-2.5 py-1.5 bg-card border-b border-border cursor-grab active:cursor-grabbing select-none touch-none hover:bg-muted/60 transition-colors"
              title="Tahan dan geser untuk memindahkan pratinjau"
            >
              <div className="flex items-center gap-1.5 text-foreground pointer-events-none">
                <Move className="w-3.5 h-3.5 text-foreground" />
                <span className="text-[10px] font-semibold tracking-wide text-foreground">Pratinjau CV</span>
                <span className="text-[9px] text-muted-foreground font-mono">({Math.round(miniSize.width)}px)</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setIsEnlargedOpen(true)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition"
                  title="Perbesar penuh"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMiniPreviewVisible(false)}
                  className="p-1 text-muted-foreground hover:text-red-400 rounded hover:bg-muted transition"
                  title="Tutup pratinjau"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card Content Preview */}
            <div
              onClick={() => {
                if (!isDraggingRef.current) {
                  setIsEnlargedOpen(true);
                }
              }}
              style={{
                width: `${miniSize.width}px`,
                height: `${miniSize.height}px`,
              }}
              className="group relative bg-white overflow-hidden cursor-pointer select-none"
              title="Klik untuk membuka pratinjau penuh"
            >
              <div
                className="origin-top-left pointer-events-none select-none"
                style={{
                  transform: `scale(${miniSize.width / 794})`,
                  width: "794px",
                }}
              >
                {renderA4CvContent()}
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 p-2 text-foreground pointer-events-none">
                <div className="w-9 h-9 rounded-full bg-zinc-700/20 border border-zinc-400/50 flex items-center justify-center text-foreground shadow-xl transform group-hover:scale-110 transition-transform">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-foreground bg-muted/90 px-2.5 py-0.5 rounded-full border border-zinc-500/40 text-center shadow-lg">
                  Buka Penuh
                </span>
              </div>
            </div>

            {/* Footer Bottom Bar with Corner Resizers */}
            <div className="relative h-5 bg-card border-t border-border flex items-center justify-between px-2 select-none touch-none">
              <div
                onPointerDown={(e) => handleResizeStart(e, "bottom-left")}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeEnd}
                onPointerCancel={handleResizeEnd}
                className="cursor-nesw-resize p-1 -ml-2 text-muted-foreground hover:text-foreground active:text-foreground group flex items-center justify-center transition-colors"
                title="Tarik pojok kiri bawah untuk mengubah ukuran"
              >
                <div className="w-2.5 h-2.5 border-b-2 border-l-2 border-current rounded-bl-sm group-hover:scale-125 transition-transform" />
              </div>

              <span className="text-[8px] text-muted-foreground tracking-wider uppercase font-semibold">Tarik pojok untuk resize</span>

              <div
                onPointerDown={(e) => handleResizeStart(e, "bottom-right")}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeEnd}
                onPointerCancel={handleResizeEnd}
                className="cursor-nwse-resize p-1 -mr-2 text-muted-foreground hover:text-foreground active:text-foreground group flex items-center justify-center transition-colors"
                title="Tarik pojok kanan bawah untuk mengubah ukuran"
              >
                <div className="w-2.5 h-2.5 border-b-2 border-r-2 border-current rounded-br-sm group-hover:scale-125 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== FORM UTAMA DI TENGAH LAYAR (PERSIS SEPERTI SURAT LAMARAN) ===================== */}
      <main className="no-print flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 space-y-6">
        
        {/* Card 1: Data Diri & Header Kontak */}
        <Card className="panel shadow-lg">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-700/10 border border-zinc-600/20 flex items-center justify-center text-foreground">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">Header Nama & Kontak</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Data utama yang ditampilkan di bagian paling atas lembar CV.
                  </CardDescription>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetCvToDefault}
                className="h-7 text-xs border-border text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3 h-3 mr-1" /> Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div>
              <Label className="text-xs font-semibold">Nama Lengkap (Huruf Kapital)</Label>
              <Input
                value={cvData.name}
                onChange={(e) => setCvData({ ...cvData, name: e.target.value })}
                placeholder="RINDA"
                className="font-bold text-lg tracking-wide mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Email</Label>
                <Input
                  value={cvData.email}
                  onChange={(e) => setCvData({ ...cvData, email: e.target.value })}
                  placeholder="email@gmail.com"
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">No. Telepon / WA</Label>
                <Input
                  value={cvData.phone}
                  onChange={(e) => setCvData({ ...cvData, phone: e.target.value })}
                  placeholder="(+62)8121-413-7112"
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Lokasi / Domisili</Label>
                <Input
                  value={cvData.location}
                  onChange={(e) => setCvData({ ...cvData, location: e.target.value })}
                  placeholder="Kec. Kawali, Kab. Ciamis"
                  className="mt-1 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Tentang Saya */}
        <Card className="panel shadow-lg">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-700/10 border border-zinc-600/20 flex items-center justify-center text-foreground">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">Tentang Saya (Ringkasan Profil)</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Deskripsi singkat etos kerja, kepribadian, dan komitmen profesional.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <textarea
              rows={4}
              value={cvData.about}
              onChange={(e) => setCvData({ ...cvData, about: e.target.value })}
              placeholder="Tulis ringkasan tentang diri Anda..."
              className="w-full p-3 rounded-lg border text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y bg-muted/60 border-border text-foreground"
            />
          </CardContent>
        </Card>

        {/* Card 3: Pendidikan */}
        <Card className="panel shadow-lg">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-700/10 border border-zinc-600/20 flex items-center justify-center text-foreground">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">Riwayat Pendidikan</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Daftar sekolah dan universitas yang pernah ditempuh.
                  </CardDescription>
                </div>
              </div>

              <Button size="sm" variant="outline" onClick={handleAddEducation} className="text-xs h-8 border-border">
                <Plus className="w-3.5 h-3.5 mr-1" /> Tambah
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {cvData.educations.map((edu, idx) => (
              <div
                key={edu.id || idx}
                className="p-3.5 rounded-lg border flex items-center gap-3 bg-muted/50 border-border"
              >
                <div className="flex-1 space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Nama Sekolah / Kampus & Jurusan</Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => {
                      const newEdus = [...cvData.educations];
                      newEdus[idx].institution = e.target.value;
                      setCvData({ ...cvData, educations: newEdus });
                    }}
                    className="text-xs font-semibold"
                  />
                </div>
                <div className="w-36 space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Periode Tahun</Label>
                  <Input
                    value={edu.period}
                    onChange={(e) => {
                      const newEdus = [...cvData.educations];
                      newEdus[idx].period = e.target.value;
                      setCvData({ ...cvData, educations: newEdus });
                    }}
                    className="text-xs font-semibold text-right"
                  />
                </div>
                <button
                  onClick={() => handleRemoveEducation(edu.id)}
                  className="p-1.5 text-muted-foreground hover:text-red-400 mt-4 rounded"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 4: Pengalaman Kerja & Pelatihan */}
        <Card className="panel shadow-lg">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-700/10 border border-zinc-600/20 flex items-center justify-center text-foreground">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">Pengalaman & Pelatihan</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Pengalaman kerja, magang, PKL, dan sertifikasi pelatihan.
                  </CardDescription>
                </div>
              </div>

              <Button size="sm" variant="outline" onClick={handleAddExperience} className="text-xs h-8 border-border">
                <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Blok
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {cvData.experiences.map((exp, expIdx) => (
              <div
                key={exp.id || expIdx}
                className="p-4 rounded-xl border space-y-3 bg-muted/40 border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Instansi / Pengalaman</Label>
                    <Input
                      value={exp.title}
                      onChange={(e) => {
                        const newExps = [...cvData.experiences];
                        newExps[expIdx].title = e.target.value;
                        setCvData({ ...cvData, experiences: newExps });
                      }}
                      className="font-bold text-xs"
                    />
                  </div>
                  <div className="w-52 space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Waktu (Opsional)</Label>
                    <Input
                      value={exp.period || ""}
                      onChange={(e) => {
                        const newExps = [...cvData.experiences];
                        newExps[expIdx].period = e.target.value;
                        setCvData({ ...cvData, experiences: newExps });
                      }}
                      className="text-xs text-right"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-400 mt-4 rounded"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bullet points */}
                <div className="space-y-2 pl-2 border-l-2 border-blue-500/40">
                  <div className="flex items-center justify-between pb-0.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">Rincian Poin / Kegiatan:</span>
                    <button
                      onClick={() => handleAddExpBullet(exp.id)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-3 h-3" /> Tambah Poin
                    </button>
                  </div>

                  {exp.bullets.map((bullet, bIdx) => (
                    <div key={bullet.id || bIdx} className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">•</span>
                      <Input
                        value={bullet.text}
                        onChange={(e) => {
                          const newExps = [...cvData.experiences];
                          newExps[expIdx].bullets[bIdx].text = e.target.value;
                          setCvData({ ...cvData, experiences: newExps });
                        }}
                        className="text-xs flex-1"
                        placeholder="Membantu pembuatan aplikasi..."
                      />
                      <Input
                        value={bullet.year || ""}
                        onChange={(e) => {
                          const newExps = [...cvData.experiences];
                          newExps[expIdx].bullets[bIdx].year = e.target.value;
                          setCvData({ ...cvData, experiences: newExps });
                        }}
                        placeholder="Tahun"
                        className="text-xs w-20 text-right font-mono"
                      />
                      <button
                        onClick={() => handleRemoveExpBullet(exp.id, bullet.id)}
                        className="text-muted-foreground hover:text-red-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 5: Organisasi */}
        <Card className="panel shadow-lg">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-700/10 border border-zinc-600/20 flex items-center justify-center text-foreground">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">Pengalaman Organisasi</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Aktivitas kepengurusan dan organisasi yang pernah diikuti.
                  </CardDescription>
                </div>
              </div>

              <Button size="sm" variant="outline" onClick={handleAddOrganization} className="text-xs h-8 border-border">
                <Plus className="w-3.5 h-3.5 mr-1" /> Tambah
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {cvData.organizations.map((org, idx) => (
              <div
                key={org.id || idx}
                className="p-3.5 rounded-lg border flex items-center gap-3 bg-muted/50 border-border"
              >
                <div className="flex-1 space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Peran & Organisasi</Label>
                  <Input
                    value={org.role}
                    onChange={(e) => {
                      const newOrgs = [...cvData.organizations];
                      newOrgs[idx].role = e.target.value;
                      setCvData({ ...cvData, organizations: newOrgs });
                    }}
                    className="text-xs font-semibold"
                  />
                </div>
                <div className="w-36 space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Periode</Label>
                  <Input
                    value={org.period}
                    onChange={(e) => {
                      const newOrgs = [...cvData.organizations];
                      newOrgs[idx].period = e.target.value;
                      setCvData({ ...cvData, organizations: newOrgs });
                    }}
                    className="text-xs font-semibold text-right"
                  />
                </div>
                <button
                  onClick={() => handleRemoveOrganization(org.id)}
                  className="p-1.5 text-muted-foreground hover:text-red-400 mt-4 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 6: Skill Hard & Soft */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="panel shadow-lg">
            <CardHeader className="pb-2 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-blue-400">HARD SKILL</CardTitle>
                <button onClick={handleAddHardSkill} className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                  + Tambah
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-3">
              {cvData.hardSkills.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-4">{idx + 1}.</span>
                  <Input
                    value={skill}
                    onChange={(e) => {
                      const newSkills = [...cvData.hardSkills];
                      newSkills[idx] = e.target.value;
                      setCvData({ ...cvData, hardSkills: newSkills });
                    }}
                    className="text-xs flex-1"
                  />
                  <button onClick={() => handleRemoveHardSkill(idx)} className="text-muted-foreground hover:text-red-400 p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="panel shadow-lg">
            <CardHeader className="pb-2 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-blue-400">SOFT SKILL</CardTitle>
                <button onClick={handleAddSoftSkill} className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                  + Tambah
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-3">
              {cvData.softSkills.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-4">{idx + 1}.</span>
                  <Input
                    value={skill}
                    onChange={(e) => {
                      const newSkills = [...cvData.softSkills];
                      newSkills[idx] = e.target.value;
                      setCvData({ ...cvData, softSkills: newSkills });
                    }}
                    className="text-xs flex-1"
                  />
                  <button onClick={() => handleRemoveSoftSkill(idx)} className="text-muted-foreground hover:text-red-400 p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Footer Action Bar (Persis seperti Surat Lamaran) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-muted border border-border rounded-xl text-xs text-muted-foreground">
          <span>✨ Perubahan otomatis disimpan ke browser dan tersinkronisasi.</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetCvToDefault}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Form
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleOpenDownloadModal}
              className="bg-zinc-100 hover:bg-white text-zinc-950 font-medium"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download PDF
            </Button>
          </div>
        </div>

      </main>

      {/* ===================== MODAL PEMBESAR HASIL CV (ENLARGED PREVIEW PERSIS SEPERTI SURAT LAMARAN) ===================== */}
      {isEnlargedOpen && (
        <div className="no-print fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-start p-3 sm:p-6 overflow-y-auto overscroll-contain animate-in fade-in duration-200">
          
          {/* Top Bar Modal Pembesar */}
          <div className="w-full max-w-4xl bg-card border border-border rounded-xl p-3 sm:px-5 sm:py-3.5 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-2xl sticky top-2 z-20 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-700/10 border border-zinc-600/20 flex items-center justify-center text-foreground">
                <FileBadge className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  Pratinjau Lembar Curriculum Vitae (A4)
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  Format ATS-friendly elegan siap cetak atau diunduh ke format PDF.
                </span>
              </div>
            </div>

            {/* Tombol Aksi di Modal: Zoom, Download PDF, dan Close */}
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center bg-muted border border-border rounded-lg p-0.5 text-xs text-foreground">
                <button
                  onClick={() => setZoomScale(Math.max(0.7, zoomScale - 0.1))}
                  className="p-1 hover:text-foreground rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] font-mono">{Math.round(zoomScale * 100)}%</span>
                <button
                  onClick={() => setZoomScale(Math.min(1.2, zoomScale + 0.1))}
                  className="p-1 hover:text-foreground rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Download PDF */}
              <Button
                type="button"
                size="sm"
                onClick={handleOpenDownloadModal}
                className="h-8 text-xs bg-zinc-100 hover:bg-white text-zinc-950 font-medium shadow-md"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Download PDF
              </Button>

              {/* TOMBOL CLOSE (SILANG) */}
              <button
                type="button"
                onClick={() => setIsEnlargedOpen(false)}
                className="w-8 h-8 rounded-lg bg-muted hover:bg-red-500/20 hover:text-red-400 border border-border hover:border-red-500/30 flex items-center justify-center text-foreground transition"
                title="Tutup Pratinjau (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lembar CV A4 di dalam Modal Pembesar */}
          <div 
            className="w-full flex justify-center pb-20 transition-transform duration-150 origin-top"
            style={{ transform: `scale(${zoomScale})` }}
          >
            {renderA4CvContent()}
          </div>
        </div>
      )}

      {/* Modal Dialog Download CV Saja */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Download className="w-5 h-5 text-blue-500" />
              <span>Unduh Dokumen CV</span>
            </DialogTitle>
            <DialogDescription>
              Tentukan nama file sebelum dokumen CV diunduh ke perangkat Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-semibold">Nama File PDF</Label>
              <div className="mt-1.5 relative">
                <Input
                  value={pdfFileName}
                  onChange={(e) => setPdfFileName(e.target.value)}
                  placeholder="CV_Rinda.pdf"
                  className="pr-12 font-medium"
                />
                <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-mono">.pdf</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border bg-zinc-900/50 border-zinc-800 text-xs text-zinc-300">
              Dokumen Curriculum Vitae (CV) 1 Halaman A4 format profesional.
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDownloadModalOpen(false)} disabled={isGeneratingPdf}>
              Batal
            </Button>
            <Button
              onClick={handleDownloadCvOnly}
              disabled={isGeneratingPdf}
              className="bg-zinc-100 hover:bg-white text-zinc-950 font-medium"
            >
              {isGeneratingPdf ? "Mengunduh..." : "Download Sekarang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
