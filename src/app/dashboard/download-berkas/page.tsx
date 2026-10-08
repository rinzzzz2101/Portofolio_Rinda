"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Download, 
  FileBadge, 
  GraduationCap, 
  Mail, 
  Upload, 
  Trash2, 
  RotateCcw, 
  CheckSquare, 
  Square, 
  ArrowRight, 
  SlidersHorizontal,
  Layers,
  Eye,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Image as ImageIcon
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
import { getCertificates } from "@/actions/certificates";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Interface
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

interface ManualCertificate {
  id: string;
  name: string;
  dataUrl: string;
  fileSize: string;
}

interface DatabaseCertificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  thumbnail?: string | null;
  pdfUrl?: string | null;
}

interface DocOrderItem {
  id: string;
  type: "cover_letter" | "cv" | "cert_db" | "cert_manual";
  title: string;
  subtitle: string;
  imageUrl?: string | null;
  rawItem?: any;
}

const DEFAULT_CV = {
  name: "RINDA",
  email: "rinda.dev21@gmail.com",
  phone: "(+62)8121-413-7112",
  location: "Kec. Kawali, Kab. Ciamis",
  about: "Saya merupakan lulusan SMK jurusan Rekayasa Perangkat Lunak yang memiliki semangat kerja tinggi, disiplin, jujur, dan bertanggung jawab dalam bekerja. Mampu bekerja sama dalam tim maupun individu, cepat belajar hal baru, serta siap bekerja di bawah tekanan dan target kerja perusahaan. Saya juga siap bekerja shift dan mengikuti aturan perusahaan dengan baik.",
  educations: [
    { id: "edu-1", institution: "SMKN 1 Kawali Jurusan Rekayasa Perangkat Lunak", major: "", period: "2023 - 2026" },
    { id: "edu-2", institution: "SMPN 1 Kawali", major: "", period: "2020 - 2023" }
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
    { id: "org-1", name: "Himpunan PPLG", role: "Anggota korlap Himpunan PPLG", period: "2024 - 2025" },
    { id: "org-2", name: "Ekstrakurikuler IT", role: "Ketua divisi ICT pada ekstrakurikuler IT", period: "2023 - 2025" }
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

const DEFAULT_COVER_LETTER = {
  tempatTanggal: "Ciamis, 8 Oktober 2026",
  penerima: "Bapak/Ibu HRD",
  namaPerusahaan: "PT. MACAKAL PANGAN SEJAHTERA",
  alamatPerusahaan: "Jl. Raya Cipaku No.8, Muktisari, Kec. Cipaku, Kabupaten Ciamis, Jawa Barat 46252",
  posisi: "Waiters",
  sumberLowongan: "grup BKK SMKN 1 Kawali",
  nama: "Rinda",
  tempatTanggalLahir: "Ciamis, 21 Januari 2008",
  pendidikan: "SMK • Pengembangan Perangkat Lunak Dan Gim",
  statusNikah: "Belum menikah",
  alamatPelamar: "Desa Talagasari, Kec. Kawali, Kabupaten Ciamis",
  noTelp: "+62 8121-4137-112",
  paragrafPengalaman: "Saya merupakan lulusan SMK yang memiliki pengalaman Praktik Kerja Lapangan (PKL). Melalui pengalaman tersebut, saya terbiasa bekerja dengan disiplin, bertanggung jawab, teliti, mampu bekerja sama dalam tim, serta cepat beradaptasi dengan lingkungan dan prosedur kerja yang baru. Saya juga siap bekerja dengan sistem shift maupun lembur sesuai ketentuan perusahaan.",
  paragrafPenutup: "Demikian surat lamaran ini saya buat dengan sebenar-benarnya. Besar harapan saya untuk dapat diberikan kesempatan mengikuti proses seleksi dan wawancara agar dapat menjelaskan lebih lanjut mengenai kemampuan serta motivasi saya untuk bergabung dengan perusahaan.",
  ucapanTerimaKasih: "Atas perhatian dan pertimbangan Bapak/Ibu, saya ucapkan terima kasih",
  signatureUrl: ""
};

export default function DownloadBerkasPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Status Pilihan Dokumen
  const [includeCoverLetter, setIncludeCoverLetter] = useState(true);
  const [includeCv, setIncludeCv] = useState(true);

  // Data Surat Lamaran & CV
  const [coverLetterData, setCoverLetterData] = useState(DEFAULT_COVER_LETTER);
  const [cvData, setCvData] = useState(DEFAULT_CV);

  // Sertifikat Database & Manual
  const [dbCertificates, setDbCertificates] = useState<DatabaseCertificate[]>([]);
  const [selectedDbCertIds, setSelectedDbCertIds] = useState<string[]>([]);
  const [manualCertificates, setManualCertificates] = useState<ManualCertificate[]>([]);

  // Susunan Urutan Dokumen & Index Pratinjau
  const [orderedItems, setOrderedItems] = useState<DocOrderItem[]>([
    {
      id: "cover_letter",
      type: "cover_letter",
      title: "Surat Lamaran Kerja",
      subtitle: `Kepada: ${DEFAULT_COVER_LETTER.namaPerusahaan} (${DEFAULT_COVER_LETTER.posisi})`,
      imageUrl: null
    },
    {
      id: "cv",
      type: "cv",
      title: "Curriculum Vitae (CV)",
      subtitle: `Nama: ${DEFAULT_CV.name}`,
      imageUrl: null
    }
  ]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState<number>(0);

  // State Drag & Drop Reorder
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Modal Download & Atur Susunan PDF
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("Berkas_Lamaran_Lengkap.pdf");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");

  // Permanent Refs Canvas untuk Eksekusi jsPDF
  const coverLetterRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    refreshAllDraftData();
    loadCertificatesFromDb();
  }, []);

  // Sinkronkan daftar susunan dokumen (orderedItems) secara otomatis saat pilihan berubah
  useEffect(() => {
    if (!mounted) return;
    
    setOrderedItems(prev => {
      const items: DocOrderItem[] = [];

      if (includeCoverLetter) {
        items.push({
          id: "cover_letter",
          type: "cover_letter",
          title: "Surat Lamaran Kerja",
          subtitle: `Kepada: ${coverLetterData.namaPerusahaan} (${coverLetterData.posisi})`,
          imageUrl: null
        });
      }

      if (includeCv) {
        items.push({
          id: "cv",
          type: "cv",
          title: "Curriculum Vitae (CV)",
          subtitle: `Nama: ${cvData.name}`,
          imageUrl: null
        });
      }

      const selectedDbCerts = dbCertificates.filter(c => selectedDbCertIds.includes(c.id));
      selectedDbCerts.forEach(c => {
        items.push({
          id: `cert_db_${c.id}`,
          type: "cert_db",
          title: c.name,
          subtitle: `${c.issuer} • ${c.issueDate} (Database)`,
          imageUrl: c.thumbnail || c.pdfUrl || null,
          rawItem: c
        });
      });

      manualCertificates.forEach(m => {
        items.push({
          id: `cert_manual_${m.id}`,
          type: "cert_manual",
          title: m.name,
          subtitle: `Upload Manual (${m.fileSize})`,
          imageUrl: m.dataUrl,
          rawItem: m
        });
      });

      return items;
    });
  }, [includeCoverLetter, includeCv, selectedDbCertIds, manualCertificates, dbCertificates, coverLetterData, cvData, mounted]);

  // Sesuaikan batas index preview jika berkas bertambah/berkurang
  useEffect(() => {
    if (currentPreviewIndex >= orderedItems.length && orderedItems.length > 0) {
      setCurrentPreviewIndex(orderedItems.length - 1);
    }
  }, [orderedItems.length, currentPreviewIndex]);

  // Muat data draft terbaru dari localStorage
  const refreshAllDraftData = () => {
    try {
      const savedCover = localStorage.getItem("surat_lamaran_draft");
      if (savedCover) {
        const parsedCover = JSON.parse(savedCover);
        const savedSignature = localStorage.getItem("surat_lamaran_drawn_signature") || "";
        setCoverLetterData({
          ...DEFAULT_COVER_LETTER,
          ...parsedCover,
          signatureUrl: savedSignature
        });
      }

      const savedCv = localStorage.getItem("cv_editor_draft");
      if (savedCv) {
        setCvData(JSON.parse(savedCv));
      }
    } catch (e) {
      console.error("Error reading drafts:", e);
    }
  };

  const loadCertificatesFromDb = async () => {
    try {
      let certList: any[] = [];
      const res = await getCvInitialData();
      if (res.success && res.data && res.data.certificates && res.data.certificates.length > 0) {
        certList = res.data.certificates;
      } else {
        const certRes = await getCertificates();
        if (certRes.success && certRes.data) {
          certList = certRes.data;
        }
      }

      if (certList.length > 0) {
        const certs = certList.map((c: any) => ({
          id: c.id,
          name: c.name,
          issuer: c.issuer,
          issueDate: c.issueDate ? new Date(c.issueDate).toLocaleDateString("id-ID", { month: "long", year: "numeric" }) : "",
          thumbnail: c.thumbnail || c.pdfUrl || null,
          pdfUrl: c.pdfUrl || c.thumbnail || null
        }));
        setDbCertificates(certs);
        // Default: sertifikat tidak langsung dipilih semua, user dapat memilih sesuai kebutuhan
        setSelectedDbCertIds([]);
      }
    } catch (err) {
      console.error("Failed to load db certs:", err);
    }
  };

  // Upload Manual Sertifikat dari Perangkat
  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) {
        toast(`File ${file.name} bukan format gambar valid (JPG/PNG).`, "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const newCert: ManualCertificate = {
            id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: file.name.replace(/\.[^/.]+$/, ""),
            dataUrl,
            fileSize: `${(file.size / 1024).toFixed(0)} KB`
          };
          setManualCertificates(prev => [...prev, newCert]);
          toast(`Sertifikat "${file.name}" berhasil ditambahkan!`, "success");
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeManualCert = (id: string) => {
    setManualCertificates(prev => prev.filter(c => c.id !== id));
  };

  const toggleDbCertificate = (id: string) => {
    setSelectedDbCertIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllDbCertificates = () => {
    setSelectedDbCertIds(dbCertificates.map(c => c.id));
  };

  const unselectAllDbCertificates = () => {
    setSelectedDbCertIds([]);
  };

  // Drag & Drop Reorder Handlers (Tahan lalu Geser)
  const handleItemDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${index}`);
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleItemDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setOrderedItems(prev => {
      const updated = [...prev];
      const [movedItem] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, movedItem);
      return updated;
    });

    setCurrentPreviewIndex(targetIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleItemDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Buka Modal Atur Susunan & Download PDF
  const handleOpenDownloadModal = () => {
    if (orderedItems.length === 0) {
      toast("Harap pilih minimal 1 dokumen untuk diunduh!", "error");
      return;
    }

    const nameSlug = (cvData.name || coverLetterData.nama || "Pelamar").replace(/[^a-zA-Z0-9]/g, "_");
    let initialName = `Berkas_Lamaran_${nameSlug}_Lengkap.pdf`;
    if (!includeCoverLetter && includeCv && selectedDbCertIds.length === 0 && manualCertificates.length === 0) {
      initialName = `CV_${nameSlug}.pdf`;
    } else if (includeCoverLetter && !includeCv && selectedDbCertIds.length === 0 && manualCertificates.length === 0) {
      initialName = `Surat_Lamaran_${nameSlug}.pdf`;
    }
    setPdfFileName(initialName);
    setIsDownloadModalOpen(true);
  };

  // Eksekusi Generate & Download PDF Berdasarkan Susunan
  const handleExecuteDownload = async () => {
    if (orderedItems.length === 0) {
      toast("Tidak ada dokumen yang dipilih untuk diunduh!", "error");
      return;
    }

    setIsGeneratingPdf(true);
    setGenerationProgress("Menyiapkan dokumen...");

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfPageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      let isFirstPage = true;

      // Render setiap dokumen sesuai urutan orderedItems
      for (let i = 0; i < orderedItems.length; i++) {
        const item = orderedItems[i];
        setGenerationProgress(`Memproses Halaman ${i + 1}/${orderedItems.length}: ${item.title}...`);

        if (item.type === "cover_letter" && coverLetterRef.current) {
          const clCanvas = await html2canvas(coverLetterRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false
          });

          const clImgData = clCanvas.toDataURL("image/png");
          const clImgHeight = (clCanvas.height * pdfPageWidth) / clCanvas.width;

          if (!isFirstPage) pdf.addPage();
          pdf.addImage(clImgData, "PNG", 0, 0, pdfPageWidth, Math.min(clImgHeight, pdfPageHeight));
          isFirstPage = false;
        } 
        else if (item.type === "cv" && cvRef.current) {
          const cvCanvas = await html2canvas(cvRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false
          });

          const cvImgData = cvCanvas.toDataURL("image/png");
          const cvImgHeight = (cvCanvas.height * pdfPageWidth) / cvCanvas.width;

          if (!isFirstPage) pdf.addPage();
          pdf.addImage(cvImgData, "PNG", 0, 0, pdfPageWidth, Math.min(cvImgHeight, pdfPageHeight));
          isFirstPage = false;
        }
        else if (item.type === "cert_db" && item.rawItem) {
          const cert = item.rawItem as DatabaseCertificate;
          const imgUrl = cert.thumbnail || cert.pdfUrl;
          if (imgUrl) {
            try {
              const img = await loadImageAsync(imgUrl);
              if (!isFirstPage) pdf.addPage();
              drawCertificateOnPdfPage(pdf, img, cert.name, cert.issuer, cert.issueDate);
              isFirstPage = false;
            } catch (err) {
              console.error("Gagal load sertifikat database:", imgUrl, err);
            }
          }
        }
        else if (item.type === "cert_manual" && item.rawItem) {
          const mCert = item.rawItem as ManualCertificate;
          try {
            const img = await loadImageAsync(mCert.dataUrl);
            if (!isFirstPage) pdf.addPage();
            drawCertificateOnPdfPage(pdf, img, mCert.name, "Lampiran Sertifikat");
            isFirstPage = false;
          } catch (err) {
            console.error("Gagal load manual cert image:", err);
          }
        }
      }

      setGenerationProgress("Menyimpan berkas PDF...");
      const finalFileName = pdfFileName.trim().endsWith(".pdf") ? pdfFileName.trim() : `${pdfFileName.trim()}.pdf`;
      pdf.save(finalFileName);

      toast(`File "${finalFileName}" berhasil diunduh!`, "success");
      setIsDownloadModalOpen(false);
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast("Terjadi kesalahan saat menyusun file PDF.", "error");
    } finally {
      setIsGeneratingPdf(false);
      setGenerationProgress("");
    }
  };

  const loadImageAsync = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  };

  const drawCertificateOnPdfPage = (pdf: jsPDF, img: HTMLImageElement, title: string, subtitle?: string, date?: string) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(30, 58, 138);
    pdf.text("LAMPIRAN SERTIFIKAT / DOKUMEN PENDUKUNG", margin, margin);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    const subText = `${title} ${subtitle ? `• ${subtitle}` : ""} ${date ? `• ${date}` : ""}`;
    pdf.text(subText, margin, margin + 5);

    pdf.setDrawColor(203, 213, 225);
    pdf.line(margin, margin + 7, pageWidth - margin, margin + 7);

    const availWidth = pageWidth - (margin * 2);
    const availHeight = pageHeight - (margin * 2) - 15;

    let imgWidth = availWidth;
    let imgHeight = (img.height * imgWidth) / img.width;

    if (imgHeight > availHeight) {
      imgHeight = availHeight;
      imgWidth = (img.width * imgHeight) / img.height;
    }

    const posX = margin + (availWidth - imgWidth) / 2;
    const posY = margin + 12 + (availHeight - imgHeight) / 2;

    pdf.setDrawColor(226, 232, 240);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(posX - 1, posY - 1, imgWidth + 2, imgHeight + 2, "FD");

    pdf.addImage(img, "JPEG", posX, posY, imgWidth, imgHeight);
  };

  // Render Template Surat Lamaran
  const renderCoverLetterContent = () => (
    <div
      className="w-[794px] min-h-[1123px] bg-white text-black p-[55px] font-sans flex flex-col justify-between"
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "13.5px",
        lineHeight: "1.65",
        color: "#111827"
      }}
    >
      <div>
        <div className="text-right mb-6 text-sm">{coverLetterData.tempatTanggal}</div>
        <div className="mb-6 text-sm">
          <p>Kepada Yth.</p>
          <p className="font-bold">{coverLetterData.penerima}</p>
          <p className="font-bold">{coverLetterData.namaPerusahaan}</p>
          <p className="whitespace-pre-line text-zinc-700">{coverLetterData.alamatPerusahaan}</p>
        </div>
        <p className="font-bold mb-3 text-sm">Dengan hormat,</p>
        <p className="text-justify mb-4 text-sm leading-relaxed">
          Sesuai informasi yang saya peroleh dari {coverLetterData.sumberLowongan} bahwa terdapat lowongan pekerjaan pada perusahaan Bapak/Ibu. Melalui surat lamaran ini, saya mengajukan diri melamar pekerjaan sebagai <strong className="font-bold">{coverLetterData.posisi}</strong>. Saya yang bertandatangan di bawah ini:
        </p>
        <table className="w-full mb-4 text-sm">
          <tbody>
            <tr><td className="w-44 py-1">Nama</td><td className="w-4">:</td><td className="font-bold">{coverLetterData.nama}</td></tr>
            <tr><td className="py-1">Tempat, Tanggal Lahir</td><td>:</td><td>{coverLetterData.tempatTanggalLahir}</td></tr>
            <tr><td className="py-1">Pendidikan</td><td>:</td><td>{coverLetterData.pendidikan}</td></tr>
            <tr><td className="py-1">Status Nikah</td><td>:</td><td>{coverLetterData.statusNikah}</td></tr>
            <tr><td className="py-1">Alamat</td><td>:</td><td>{coverLetterData.alamatPelamar}</td></tr>
            <tr><td className="py-1">No. Telp / WhatsApp</td><td>:</td><td>{coverLetterData.noTelp}</td></tr>
          </tbody>
        </table>
        <p className="text-justify mb-4 text-sm leading-relaxed">{coverLetterData.paragrafPengalaman}</p>
        <p className="text-justify mb-4 text-sm leading-relaxed">{coverLetterData.paragrafPenutup}</p>
        <p className="mb-8 text-sm">{coverLetterData.ucapanTerimaKasih}</p>
      </div>

      <div className="flex justify-end pt-4">
        <div className="text-center w-52">
          <p className="text-sm mb-2">Hormat saya,</p>
          <div className="h-16 flex items-center justify-center my-1">
            {coverLetterData.signatureUrl ? (
              <img src={coverLetterData.signatureUrl} alt="Tanda Tangan" className="max-h-16 max-w-full object-contain" />
            ) : (
              <span className="text-xs italic text-zinc-400">(Tanda Tangan)</span>
            )}
          </div>
          <p className="font-bold underline text-sm tracking-wide mt-1">{coverLetterData.nama}</p>
        </div>
      </div>
    </div>
  );

  // Render Template CV
  const renderCvContent = () => (
    <div
      className="w-[794px] min-h-[1123px] bg-white text-black p-[50px] font-sans flex flex-col justify-between"
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#111827"
      }}
    >
      <div className="space-y-4">
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

        <div className="space-y-1">
          <h2 className="text-[14.5px] font-extrabold tracking-wide text-[#1e3a8a] uppercase">TENTANG SAYA</h2>
          <div className="w-full border-b border-gray-900 mb-2"></div>
          <p className="text-[12px] leading-relaxed text-justify text-gray-900">{cvData.about}</p>
        </div>

        <div className="space-y-1">
          <h2 className="text-[14.5px] font-extrabold tracking-wide text-[#1e3a8a] uppercase">PENDIDIKAN</h2>
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

        <div className="space-y-1">
          <h2 className="text-[14.5px] font-extrabold tracking-wide text-[#1e3a8a] uppercase">PENGALAMAN</h2>
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
                      <span className="text-gray-900 before:content-['•'] before:mr-2 before:text-gray-900">{b.text}</span>
                      {b.year && <span className="font-bold text-gray-900 whitespace-nowrap pl-4 text-[11px]">{b.year}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-[14.5px] font-extrabold tracking-wide text-[#1e3a8a] uppercase">ORGANISASI</h2>
          <div className="w-full border-b border-gray-900 mb-2"></div>
          <div className="space-y-1.5">
            {cvData.organizations.map((org, idx) => (
              <div key={org.id || idx} className="flex justify-between items-baseline text-[12px]">
                <span className="text-gray-900 before:content-['•'] before:mr-2 before:text-gray-900 font-medium">{org.role}</span>
                <span className="font-bold text-gray-900 whitespace-nowrap">{org.period}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-[14.5px] font-extrabold tracking-wide text-[#1e3a8a] uppercase">HARD SKILL</h2>
          <div className="w-full border-b border-gray-900 mb-2"></div>
          <ol className="space-y-0.5 pl-4 text-[12px] text-gray-900">
            {cvData.hardSkills.map((skill, idx) => (
              <li key={idx} className="leading-snug">{idx + 1}. {skill}</li>
            ))}
          </ol>
        </div>

        <div className="space-y-1">
          <h2 className="text-[14.5px] font-extrabold tracking-wide text-[#1e3a8a] uppercase">SOFT SKILL</h2>
          <div className="w-full border-b border-gray-900 mb-2"></div>
          <ol className="space-y-0.5 pl-4 text-[12px] text-gray-900">
            {cvData.softSkills.map((skill, idx) => (
              <li key={idx} className="leading-snug">{idx + 1}. {skill}</li>
            ))}
          </ol>
        </div>

      </div>
    </div>
  );

  if (!mounted) return null;

  return (
    <div className="min-h-full flex flex-col bg-background text-foreground transition-colors">
      
      {/* Permanent Hidden Offscreen Printable Elements */}
      <div style={{ position: "fixed", left: "-9999px", top: "0px", width: "794px", minHeight: "1123px", zIndex: -9999, pointerEvents: "none", opacity: 0 }}>
        <div ref={coverLetterRef} className="w-[794px] min-h-[1123px] bg-white text-black p-[55px] font-sans">
          {renderCoverLetterContent()}
        </div>
        <div ref={cvRef} className="w-[794px] min-h-[1123px] bg-white text-black p-[50px] font-sans">
          {renderCvContent()}
        </div>
      </div>

      {/* ===================== STICKY TOP ACTION BAR ===================== */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-zinc-700/10 border border-zinc-600/20 text-foreground">
              <Download className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Download Berkas (PDF)
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Satukan surat lamaran, CV ATS, dan sertifikat pendukung menjadi satu berkas PDF lengkap.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Top Bar */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refreshAllDraftData}
            className="border-border bg-muted text-foreground hover:text-foreground text-xs h-9"
            title="Muat ulang pembaruan data surat lamaran dan CV"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span>Refresh Data</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleOpenDownloadModal}
            className="bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs h-9 shadow-md"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            <span>Atur Susunan & Download PDF ({orderedItems.length})</span>
          </Button>
        </div>
      </header>

      {/* ===================== MAIN CONTENT WRAPPER ===================== */}
      <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto w-full pb-16">
        
        {/* Card 1: Surat Lamaran Kerja */}
        <Card className="panel border-border bg-card shadow-sm">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg border border-border bg-muted flex items-center justify-center text-foreground shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    1. Surat Lamaran Kerja (Cover Letter)
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Format surat resmi yang disesuaikan dengan posisi dan perusahaan tujuan.
                  </CardDescription>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg border border-border transition">
                <input
                  type="checkbox"
                  checked={includeCoverLetter}
                  onChange={(e) => setIncludeCoverLetter(e.target.checked)}
                  className="w-4 h-4 rounded text-foreground focus:ring-0 accent-foreground cursor-pointer"
                />
                <span className="text-xs font-semibold text-foreground">Sertakan di Berkas</span>
              </label>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="p-3.5 rounded-xl border border-border bg-muted/40 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tujuan Instansi:</span>
                <span className="font-semibold text-foreground">{coverLetterData.namaPerusahaan} ({coverLetterData.posisi})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pelamar:</span>
                <span className="text-foreground">{coverLetterData.nama} • {coverLetterData.noTelp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal:</span>
                <span className="text-foreground">{coverLetterData.tempatTanggal}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Link
                href="/dashboard/surat-lamaran"
                className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1 font-medium"
              >
                <span>Buka Editor Surat Lamaran</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[11px] text-muted-foreground">
                {coverLetterData.signatureUrl ? "✅ Tanda tangan aktif" : "ℹ️ Belum ada tanda tangan"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Curriculum Vitae (CV) */}
        <Card className="panel border-border bg-card shadow-sm">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg border border-border bg-muted flex items-center justify-center text-foreground shrink-0">
                  <FileBadge className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    2. Curriculum Vitae (CV)
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Format rapi, ATS-friendly elegan sesuai standar profesional.
                  </CardDescription>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg border border-border transition">
                <input
                  type="checkbox"
                  checked={includeCv}
                  onChange={(e) => setIncludeCv(e.target.checked)}
                  className="w-4 h-4 rounded text-foreground focus:ring-0 accent-foreground cursor-pointer"
                />
                <span className="text-xs font-semibold text-foreground">Sertakan di Berkas</span>
              </label>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="p-3.5 rounded-xl border border-border bg-muted/40 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama di CV:</span>
                <span className="font-bold text-foreground">{cvData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pendidikan:</span>
                <span className="text-foreground">{cvData.educations.length} Institusi ({cvData.educations[0]?.institution || "-"})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pengalaman:</span>
                <span className="text-foreground">{cvData.experiences.length} Pengalaman Kerja & Pelatihan</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Link
                href="/dashboard/cv"
                className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1 font-medium"
              >
                <span>Buka Editor Curriculum Vitae (CV)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[11px] text-muted-foreground">1 Lembar A4</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Sertifikat Database Web */}
        <Card className="panel border-border bg-card shadow-sm">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg border border-border bg-muted flex items-center justify-center text-foreground shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    3. Sertifikat dari Database Web ({selectedDbCertIds.length}/{dbCertificates.length} Dipilih)
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Pilih sertifikat yang ingin disertakan sebagai lampiran pada berkas lamaran.
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={selectAllDbCertificates} className="btn-outline text-xs h-7">
                  Pilih Semua
                </Button>
                <Button size="sm" variant="outline" onClick={unselectAllDbCertificates} className="btn-outline text-xs h-7">
                  Batal
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {dbCertificates.length === 0 ? (
              <div className="p-8 text-center border border-dashed rounded-xl border-border text-muted-foreground text-xs">
                Belum ada data sertifikat di database web. Anda dapat mengunggah melalui menu Sertifikat atau opsi upload manual di bawah.
              </div>
            ) : (
              <div className="space-y-3">
                {dbCertificates.map((cert) => {
                  const isSelected = selectedDbCertIds.includes(cert.id);
                  const certImage = cert.thumbnail || cert.pdfUrl;

                  return (
                    <div
                      key={cert.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3.5 ${
                        isSelected
                          ? "border-border bg-muted shadow-sm ring-1 ring-border"
                          : "border-border/60 bg-card hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Checkbox Pilihan */}
                        <button
                          type="button"
                          onClick={() => toggleDbCertificate(cert.id)}
                          className="shrink-0 p-1 text-muted-foreground hover:text-foreground transition"
                          title={isSelected ? "Batal pilih sertifikat ini" : "Pilih sertifikat ini"}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-foreground" />
                          ) : (
                            <Square className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>

                        {/* Foto Thumbnail Sertifikat */}
                        {certImage ? (
                          <div 
                            className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden border border-border bg-background shrink-0 shadow-sm"
                          >
                            <img
                              src={certImage}
                              alt={cert.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div 
                            className="w-20 h-14 sm:w-24 sm:h-16 rounded-lg border border-border bg-muted flex flex-col items-center justify-center shrink-0 gap-1 text-muted-foreground"
                          >
                            <ImageIcon className="w-5 h-5" />
                            <span className="text-[9px]">No Photo</span>
                          </div>
                        )}

                        {/* Keterangan Nama Sertifikat */}
                        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => toggleDbCertificate(cert.id)}>
                          <h4 className="text-xs sm:text-sm font-bold truncate text-foreground">{cert.name}</h4>
                          <p className="text-[11px] sm:text-xs truncate mt-0.5 text-muted-foreground">{cert.issuer}</p>
                          <p className="text-[10px] mt-0.5 text-muted-foreground/80">Diterbitkan: {cert.issueDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground bg-muted border border-border px-2.5 py-0.5 rounded-full font-medium">
                          Database
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 4: Upload Sertifikat Manual dari Perangkat */}
        <Card className="panel border-border bg-card shadow-sm">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg border border-border bg-muted flex items-center justify-center text-foreground shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  4. Upload Sertifikat Manual ({manualCertificates.length} File)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Unggah file foto sertifikat tambahan dari HP / Komputer untuk digabungkan ke berkas.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div 
              className="border-2 border-dashed border-border hover:border-zinc-500 rounded-xl p-6 text-center transition-colors bg-muted/30"
            >
              <input
                type="file"
                id="manual-berkas-upload"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                multiple
                onChange={handleManualUpload}
                className="hidden"
              />
              <label htmlFor="manual-berkas-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                <div className="p-2.5 rounded-full bg-muted border border-border text-foreground">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-foreground">
                  Klik untuk Pilih File Foto Sertifikat dari Perangkat
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Format gambar didukung: JPG, PNG, JPEG, WebP
                </span>
              </label>
            </div>

            {manualCertificates.length > 0 && (
              <div className="space-y-2.5 pt-1">
                {manualCertificates.map((mCert) => (
                  <div
                    key={mCert.id}
                    className="p-3 rounded-xl border border-border bg-muted/40 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Foto Thumbnail Manual */}
                      <div 
                        className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden border border-border bg-background shrink-0 shadow-sm"
                      >
                        <img
                          src={mCert.dataUrl}
                          alt={mCert.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold truncate text-foreground">{mCert.name}</h4>
                        <span className="text-[11px] text-muted-foreground font-medium">{mCert.fileSize} • Upload Manual</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeManualCert(mCert.id)}
                      className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-muted transition-colors shrink-0"
                      title="Hapus Sertifikat Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ===================== MODAL UTAMA: ATUR SUSUNAN DENGAN DRAG & DROP (TAHAN LALU GESER) ===================== */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent 
          className="sm:max-w-5xl max-h-[92vh] flex flex-col overflow-hidden p-0 border border-border bg-card shadow-2xl"
        >
          
          {/* Header Modal */}
          <DialogHeader 
            className="p-4 sm:p-5 pb-3 border-b border-border bg-card"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-foreground">
                  <SlidersHorizontal className="w-5 h-5 text-blue-500" />
                  <span>Atur Susunan & Download PDF ({orderedItems.length} Halaman)</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  Tahan lalu geser (drag & drop) item pada daftar untuk mengubah urutan susunan dokumen.
                </DialogDescription>
              </div>

              {/* Input Nama File PDF di Header Modal */}
              <div className="sm:w-72">
                <Label className="text-[11px] font-bold text-foreground">Nama File PDF</Label>
                <div className="mt-1 relative">
                  <Input
                    value={pdfFileName}
                    onChange={(e) => setPdfFileName(e.target.value)}
                    placeholder="Nama_Berkas_Lamaran.pdf"
                    className="pr-12 font-medium text-xs h-8 bg-muted border-border text-foreground"
                  />
                  <span className="absolute right-3 top-2 text-xs font-mono text-muted-foreground">.pdf</span>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Body Modal: Grid 2 Kolom (Susunan Drag & Drop & Pratinjau Lembar) */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-background">
            {orderedItems.length === 0 ? (
              <div className="p-8 text-center text-xs italic border border-dashed rounded-xl border-border text-muted-foreground">
                Belum ada dokumen yang dipilih. Silakan tutup jendela ini dan centang dokumen di halaman utama.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Kolom Kiri: Daftar Susunan Dokumen Drag & Drop (Tahan lalu Geser) */}
                <div className="md:col-span-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      Urutan Lembar (Tahan & Geser):
                    </Label>
                    <span className="text-[10px] italic text-muted-foreground">Drag to reorder</span>
                  </div>

                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {orderedItems.map((item, idx) => {
                      const isActive = currentPreviewIndex === idx;
                      const isDragging = draggedIndex === idx;
                      const isOver = dragOverIndex === idx && draggedIndex !== idx;

                      return (
                        <div
                          key={item.id}
                          draggable={true}
                          onDragStart={(e) => handleItemDragStart(e, idx)}
                          onDragOver={(e) => handleItemDragOver(e, idx)}
                          onDrop={(e) => handleItemDrop(e, idx)}
                          onDragEnd={handleItemDragEnd}
                          onClick={() => setCurrentPreviewIndex(idx)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 text-xs cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${
                            isDragging
                              ? "opacity-35 border-dashed border-blue-400 bg-blue-500/10 scale-[0.98]"
                              : isOver
                              ? "border-blue-400 bg-blue-600/25 ring-2 ring-blue-500/50 shadow-lg translate-y-[-2px]"
                              : isActive
                              ? "bg-muted border-foreground/40 shadow-sm ring-1 ring-border"
                              : "bg-card border-border hover:bg-muted/40"
                          }`}
                          title="Tahan dan geser untuk memindahkan urutan lembar"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Grip Icon */}
                            <div className="shrink-0 p-0.5 text-muted-foreground">
                              <GripVertical className="w-4 h-4" />
                            </div>

                            {/* Nomor Urut */}
                            <span className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-[11px] shrink-0 ${
                              isActive ? "bg-foreground text-background shadow-sm" : "bg-muted text-muted-foreground border border-border"
                            }`}>
                              {idx + 1}
                            </span>

                            {/* Foto Thumbnail Dokumen / Sertifikat */}
                            {item.imageUrl ? (
                              <div 
                                className="relative w-14 h-10 rounded-lg overflow-hidden border border-border bg-background shrink-0 shadow pointer-events-none"
                              >
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : item.type === "cover_letter" ? (
                              <div 
                                className="relative w-14 h-10 rounded-lg overflow-hidden border border-blue-500/40 bg-white shrink-0 shadow flex flex-col items-center justify-center text-blue-600 p-0.5 pointer-events-none"
                                title="Surat Lamaran Kerja"
                              >
                                <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center rounded">
                                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                                  <span className="text-[8px] font-black text-blue-700 tracking-tighter">SURAT</span>
                                </div>
                              </div>
                            ) : item.type === "cv" ? (
                              <div 
                                className="relative w-14 h-10 rounded-lg overflow-hidden border border-indigo-500/40 bg-white shrink-0 shadow flex flex-col items-center justify-center text-indigo-600 p-0.5 pointer-events-none"
                                title="Curriculum Vitae (CV)"
                              >
                                <div className="w-full h-full bg-indigo-50 flex flex-col items-center justify-center rounded">
                                  <FileBadge className="w-3.5 h-3.5 text-indigo-600" />
                                  <span className="text-[8px] font-black text-indigo-700 tracking-tighter">CV ATS</span>
                                </div>
                              </div>
                            ) : (
                              <div 
                                className="w-14 h-10 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0 pointer-events-none text-muted-foreground"
                              >
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}

                            {/* Keterangan Dokumen */}
                            <div className="min-w-0 flex-1 pointer-events-none">
                              <p className={`font-semibold truncate ${isActive ? 'text-foreground font-bold' : 'text-foreground'}`}>{item.title}</p>
                              <p className="text-[10px] truncate text-muted-foreground">{item.subtitle}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Kolom Kanan: Pratinjau Lembar Satu per Satu */}
                <div 
                  className="md:col-span-7 rounded-2xl border border-border bg-card p-4 space-y-3 flex flex-col items-center shadow-inner"
                >
                  
                  {/* Header Navigasi Pratinjau Lembar */}
                  <div className="w-full flex items-center justify-between pb-3 border-b border-border text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Eye className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="font-bold shrink-0 text-foreground">
                        Lembar {currentPreviewIndex + 1}/{orderedItems.length}:
                      </span>
                      <span className="text-blue-500 font-semibold truncate max-w-[180px] sm:max-w-[240px]">
                        {orderedItems[currentPreviewIndex]?.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setCurrentPreviewIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentPreviewIndex === 0}
                        className="p-1 px-2.5 text-xs border border-border bg-muted text-foreground hover:bg-muted/80 disabled:opacity-30 rounded-md flex items-center gap-1 transition"
                        title="Lembar Sebelumnya"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </button>
                      <button
                        onClick={() => setCurrentPreviewIndex(prev => Math.min(orderedItems.length - 1, prev + 1))}
                        disabled={currentPreviewIndex === orderedItems.length - 1}
                        className="p-1 px-2.5 text-xs border border-border bg-muted text-foreground hover:bg-muted/80 disabled:opacity-30 rounded-md flex items-center gap-1 transition"
                        title="Lembar Selanjutnya"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Box Display Lembar Satu per Satu */}
                  <div 
                    className="w-full h-[470px] overflow-auto flex items-start justify-center rounded-xl p-3 border border-border bg-background"
                  >
                    
                    {/* Pratinjau Surat Lamaran */}
                    {orderedItems[currentPreviewIndex]?.type === "cover_letter" && (
                      <div className="w-[350px] h-[495px] overflow-hidden rounded-lg shadow-2xl border border-zinc-400 bg-white shrink-0 my-1">
                        <div className="w-[794px] min-h-[1123px] origin-top-left scale-[0.44]">
                          {renderCoverLetterContent()}
                        </div>
                      </div>
                    )}

                    {/* Pratinjau CV */}
                    {orderedItems[currentPreviewIndex]?.type === "cv" && (
                      <div className="w-[350px] h-[495px] overflow-hidden rounded-lg shadow-2xl border border-zinc-400 bg-white shrink-0 my-1">
                        <div className="w-[794px] min-h-[1123px] origin-top-left scale-[0.44]">
                          {renderCvContent()}
                        </div>
                      </div>
                    )}

                    {/* Pratinjau Sertifikat Database */}
                    {orderedItems[currentPreviewIndex]?.type === "cert_db" && (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3">
                        {(orderedItems[currentPreviewIndex]?.rawItem?.thumbnail || orderedItems[currentPreviewIndex]?.rawItem?.pdfUrl) ? (
                          <div className="relative max-w-full flex items-center justify-center">
                            <img
                              src={orderedItems[currentPreviewIndex].rawItem.thumbnail || orderedItems[currentPreviewIndex].rawItem.pdfUrl}
                              alt={orderedItems[currentPreviewIndex].title}
                              className="max-w-full max-h-[400px] object-contain rounded-lg border border-border bg-background shadow-xl"
                            />
                          </div>
                        ) : (
                          <div className="text-center text-xs py-10 text-muted-foreground">Gambar sertifikat tidak tersedia</div>
                        )}
                        <p className="text-xs mt-3 font-semibold text-center text-foreground">{orderedItems[currentPreviewIndex]?.title}</p>
                      </div>
                    )}

                    {/* Pratinjau Sertifikat Upload Manual */}
                    {orderedItems[currentPreviewIndex]?.type === "cert_manual" && (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3">
                        <div className="relative max-w-full flex items-center justify-center">
                          <img
                            src={orderedItems[currentPreviewIndex]?.rawItem?.dataUrl}
                            alt={orderedItems[currentPreviewIndex]?.title}
                            className="max-w-full max-h-[400px] object-contain rounded-lg border border-border bg-background shadow-xl"
                          />
                        </div>
                        <p className="text-xs mt-3 font-semibold text-center text-foreground">{orderedItems[currentPreviewIndex]?.title}</p>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* Status Generate */}
            {isGeneratingPdf && (
              <div className="mt-4 p-3 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="text-xs text-blue-400 font-medium">{generationProgress || "Sedang menyusun berkas..."}</span>
              </div>
            )}
          </div>

          {/* Footer Modal */}
          <DialogFooter 
            className="p-4 border-t border-border bg-card flex flex-row items-center justify-between sm:justify-between gap-3"
          >
            <Button
              variant="outline"
              onClick={() => setIsDownloadModalOpen(false)}
              disabled={isGeneratingPdf}
              className="btn-outline text-xs h-9"
            >
              Tutup
            </Button>
            
            <Button
              onClick={handleExecuteDownload}
              disabled={isGeneratingPdf || orderedItems.length === 0}
              className="bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs h-9 px-5 shadow-md flex items-center gap-2"
            >
              {isGeneratingPdf ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Memproses PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF Sekarang</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
