"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Printer, 
  Copy, 
  RotateCcw, 
  Check, 
  FileText, 
  Building2, 
  MapPin, 
  Calendar, 
  Briefcase, 
  User, 
  PenTool, 
  Eye, 
  Undo2, 
  Trash2, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  ZoomIn, 
  ZoomOut, 
  X, 
  ChevronDown, 
  ChevronUp, 
  FileDown,
  Move
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";

// Format tanggal standar Bahasa Indonesia
function getIndonesianDateString(date = new Date()) {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

const DEFAULT_DATA = {
  tempatTanggal: `Ciamis, ${getIndonesianDateString()}`,
  penerima: "Bapak/Ibu HRD",
  namaPerusahaan: "PT. MACAKAL PANGAN SEJAHTERA",
  alamatPerusahaan: "Jl. Raya Cipaku No.8, Muktisari, Kec. Cipaku, Kabupaten Ciamis,\nJawa Barat 46252",
  posisi: "Waiters",
  sumberLowongan: "grup BKK SMKN 1 Kawali",
  // Data Diri
  nama: "Rinda",
  tempatTanggalLahir: "Ciamis, 21 Januari 2008",
  pendidikan: "SMK • Pengembangan Perangkat Lunak Dan Gim",
  statusNikah: "Belum menikah",
  alamatPelamar: "Desa Talagasari, Kec. Kawali, Kabupaten Ciamis",
  noTelp: "+62 8121-4137-112",
  // Paragraf
  paragrafPengalaman: "Saya merupakan lulusan SMK yang memiliki pengalaman Praktik Kerja Lapangan (PKL). Melalui pengalaman tersebut, saya terbiasa bekerja dengan disiplin, bertanggung jawab, teliti, mampu bekerja sama dalam tim, serta cepat beradaptasi dengan lingkungan dan prosedur kerja yang baru. Saya juga siap bekerja dengan sistem shift maupun lembur sesuai ketentuan perusahaan.",
  paragrafPenutup: "Demikian surat lamaran ini saya buat dengan sebenar-benarnya. Besar harapan saya untuk dapat diberikan kesempatan mengikuti proses seleksi dan wawancara agar dapat menjelaskan lebih lanjut mengenai kemampuan serta motivasi saya untuk bergabung dengan perusahaan.",
  ucapanTerimaKasih: "Atas perhatian dan pertimbangan Bapak/Ibu, saya ucapkan terima kasih",
  // Mode Tanda Tangan: "asli" (foto Rinda), "gambar" (kanvas pen), "manual" (kosong)
  signatureMode: "asli" as "asli" | "gambar" | "manual",
  drawnSignatureUrl: "",
};

const PRESET_POSISI = [
  { label: "Waiters", value: "Waiters" },
  { label: "Web Developer", value: "Junior Web Developer" },
  { label: "Staff IT", value: "Staff IT Support" },
  { label: "Staff Admin", value: "Staff Administrasi" },
  { label: "Kasir", value: "Kasir" },
  { label: "Operator", value: "Operator Produksi" },
];

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export default function SuratLamaranPage() {
  const { toast } = useToast();
  const [data, setData] = useState(DEFAULT_DATA);
  const [copied, setCopied] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [showBiodataAccordion, setShowBiodataAccordion] = useState(false);
  
  // State Pembesar Preview (Modal Mengambang)
  const [isEnlargedOpen, setIsEnlargedOpen] = useState(false);
  // State Mini Preview Visibility (Toggle buka/tutup floating card kecil)
  const [isMiniPreviewVisible, setIsMiniPreviewVisible] = useState(true);
  // State Ukuran & Posisi Mini Preview (Bisa digeser & di-resize dari pojok bawah)
  const [miniPos, setMiniPos] = useState<{ x: number; y: number } | null>(null);
  const [miniSize, setMiniSize] = useState<{ width: number; height: number }>({ width: 190, height: 268 });

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

  // Inisialisasi posisi awal di pojok kanan atas setelah client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const defaultW = 190;
      const minX = getSidebarBoundary() + 10;
      setMiniPos({
        x: Math.max(minX, window.innerWidth - defaultW - 24),
        y: 84,
      });
    }
  }, []);

  // Monitor window resize agar posisi tetap di dalam batas sidebar dan layar
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

  // Drag logic untuk memindahkan mini preview dengan batas sisi sidebar
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

    // Batas minimum geser ke kiri: tepi kanan sidebar + 10px
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

  // Resize logic untuk memperbesar/memperkecil dari pojok bawah (dibatasi sidebar)
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
      // corner === "bottom-left": kartu melebar ke kiri, tidak boleh menembus sidebar
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

  // Modal Kanvas Gambar TTD
  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [penColor, setPenColor] = useState<string>("#111827");
  const [penWidth, setPenWidth] = useState<number>(2.5);

  // Lock background scroll when modal is open for silky smooth scrolling
  useEffect(() => {
    if (isEnlargedOpen || isCanvasModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isEnlargedOpen, isCanvasModalOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEnlargedOpen) setIsEnlargedOpen(false);
        if (isCanvasModalOpen) setIsCanvasModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEnlargedOpen, isCanvasModalOpen]);

  // Muat data tersimpan dari LocalStorage jika ada
  useEffect(() => {
    try {
      const saved = localStorage.getItem("surat_lamaran_draft");
      const savedSignature = localStorage.getItem("surat_lamaran_drawn_signature");
      const savedStrokes = localStorage.getItem("surat_lamaran_signature_strokes");
      
      if (savedStrokes) {
        try {
          const parsedStrokes = JSON.parse(savedStrokes);
          if (Array.isArray(parsedStrokes)) {
            setStrokes(parsedStrokes);
          }
        } catch (e) {}
      }

      if (saved) {
        const parsed = JSON.parse(saved);
        setData((prev) => ({ 
          ...prev, 
          ...parsed,
          drawnSignatureUrl: savedSignature || parsed.drawnSignatureUrl || "",
          signatureMode: parsed.signatureMode || (savedSignature ? "gambar" : "asli"),
        }));
      } else if (savedSignature) {
        setData((prev) => ({ 
          ...prev, 
          drawnSignatureUrl: savedSignature,
          signatureMode: "gambar",
        }));
      }
    } catch (e) {
      console.error("Load localStorage error:", e);
    }
  }, []);

  // Simpan perubahan form ke LocalStorage
  const updateData = (field: keyof typeof DEFAULT_DATA, value: any) => {
    setData((prev) => {
      const updated = { ...prev, [field]: value };
      try {
        localStorage.setItem("surat_lamaran_draft", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Reset ke data awal (sesuai contoh)
  const handleReset = () => {
    if (confirm("Kembalikan semua input ke template awal sesuai contoh?")) {
      setData(DEFAULT_DATA);
      try {
        localStorage.removeItem("surat_lamaran_draft");
        localStorage.removeItem("surat_lamaran_drawn_signature");
        localStorage.removeItem("surat_lamaran_signature_strokes");
        setStrokes([]);
      } catch (e) {}
      toast("Template dikembalikan ke pengaturan awal", "info");
    }
  };

  // Aksi Cetak / Simpan PDF
  const handlePrint = () => {
    window.print();
  };

  // Aksi Download Word (.doc)
  const handleDownloadDoc = () => {
    const content = `
      <div style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.65; color: #111827;">
        <p style="text-align: right; margin-bottom: 24pt;">${data.tempatTanggal}</p>
        
        <p style="margin-bottom: 2pt;">Kepada Yth.<br/>
        <strong>${data.penerima}</strong><br/>
        <strong>${data.namaPerusahaan}</strong><br/>
        ${data.alamatPerusahaan.replace(/\n/g, '<br/>')}</p>
        
        <p style="margin-top: 18pt; margin-bottom: 10pt;"><strong>Dengan hormat,</strong></p>
        
        <p style="text-align: justify; margin-bottom: 12pt;">
          Sesuai informasi yang saya peroleh dari ${data.sumberLowongan} bahwa terdapat lowongan pekerjaan pada perusahaan Bapak/Ibu. Melalui surat lamaran ini, saya mengajukan diri melamar pekerjaan sebagai <strong>${data.posisi}</strong>. Saya yang bertandatangan di bawah ini:
        </p>
        
        <table style="width: 100%; margin-bottom: 14pt; font-size: 11pt; border-collapse: collapse;">
          <tr><td style="width: 180px; padding: 2.5px 0;">Nama</td><td style="width: 15px;">:</td><td><strong>${data.nama}</strong></td></tr>
          <tr><td style="padding: 2.5px 0;">Tempat, Tanggal Lahir</td><td>:</td><td>${data.tempatTanggalLahir}</td></tr>
          <tr><td style="padding: 2.5px 0;">Pendidikan</td><td>:</td><td>${data.pendidikan}</td></tr>
          <tr><td style="padding: 2.5px 0;">Status Nikah</td><td>:</td><td>${data.statusNikah}</td></tr>
          <tr><td style="padding: 2.5px 0;">Alamat</td><td>:</td><td>${data.alamatPelamar}</td></tr>
          <tr><td style="padding: 2.5px 0;">No. Telp.</td><td>:</td><td>${data.noTelp}</td></tr>
        </table>
        
        <p style="text-align: justify; margin-bottom: 12pt;">${data.paragrafPengalaman}</p>
        <p style="text-align: justify; margin-bottom: 12pt;">${data.paragrafPenutup}</p>
        <p style="margin-top: 16pt; margin-bottom: 30pt;">${data.ucapanTerimaKasih}</p>
        
        <p style="margin-bottom: 45pt;">Hormat saya,</p>
        <p><strong>${data.nama}</strong></p>
      </div>
    `;

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Surat Lamaran - " + data.nama + "</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;
    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Surat_Lamaran_${data.nama}_${data.posisi.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("Dokumen Word (.doc) berhasil diunduh!", "success");
  };

  // Aksi Download Teks (.txt)
  const handleDownloadTxt = () => {
    const fullText = `${data.tempatTanggal}

Kepada Yth.
${data.penerima}
${data.namaPerusahaan}
${data.alamatPerusahaan}

Dengan hormat,

Sesuai informasi yang saya peroleh dari ${data.sumberLowongan} bahwa terdapat lowongan pekerjaan pada perusahaan Bapak/Ibu. Melalui surat lamaran ini, saya mengajukan diri melamar pekerjaan sebagai ${data.posisi}. Saya yang bertandatangan di bawah ini:
Nama                  : ${data.nama}
Tempat, Tanggal Lahir : ${data.tempatTanggalLahir}
Pendidikan            : ${data.pendidikan}
Status Nikah          : ${data.statusNikah}
Alamat                : ${data.alamatPelamar}
No. Telp.             : ${data.noTelp}

${data.paragrafPengalaman}

${data.paragrafPenutup}

${data.ucapanTerimaKasih}


Hormat saya,

${data.nama}`;

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Surat_Lamaran_${data.nama}_${data.posisi.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("File teks surat berhasil diunduh!", "success");
  };

  // Aksi Salin Teks
  const handleCopyText = () => {
    const fullText = `${data.tempatTanggal}

Kepada Yth.
${data.penerima}
${data.namaPerusahaan}
${data.alamatPerusahaan}

Dengan hormat,

Sesuai informasi yang saya peroleh dari ${data.sumberLowongan} bahwa terdapat lowongan pekerjaan pada perusahaan Bapak/Ibu. Melalui surat lamaran ini, saya mengajukan diri melamar pekerjaan sebagai ${data.posisi}. Saya yang bertandatangan di bawah ini:
Nama                  : ${data.nama}
Tempat, Tanggal Lahir : ${data.tempatTanggalLahir}
Pendidikan            : ${data.pendidikan}
Status Nikah          : ${data.statusNikah}
Alamat                : ${data.alamatPelamar}
No. Telp.             : ${data.noTelp}

${data.paragrafPengalaman}

${data.paragrafPenutup}

${data.ucapanTerimaKasih}


Hormat saya,

${data.nama}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast("Isi surat lamaran berhasil disalin ke clipboard!", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  // ===================== CANVAS DRAWING ENGINE =====================

  // Helper untuk mendapatkan koordinat canvas yang presisi (skala normalized)
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Re-draw all strokes onto the canvas smoothly
  const redrawCanvas = (allStrokes: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    allStrokes.forEach((stroke) => {
      if (stroke.points.length === 0) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.points.length === 1) {
        ctx.fillStyle = stroke.color;
        ctx.beginPath();
        ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.width / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length - 1; i++) {
        const midX = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
        const midY = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, midX, midY);
      }

      const last = stroke.points[stroke.points.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    });
  };

  // Ketika modal canvas dibuka: pulihkan goresan sebelumnya ke canvas
  useEffect(() => {
    if (isCanvasModalOpen) {
      const timer = setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (strokes.length > 0) {
          redrawCanvas(strokes);
        } else if (data.drawnSignatureUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const x = Math.max(20, (canvas.width - img.width) / 2);
            const y = Math.max(10, (canvas.height - img.height) / 2);
            ctx.drawImage(img, x, y);
          };
          img.src = data.drawnSignatureUrl;
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isCanvasModalOpen]);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasCoords(e);

    setIsDrawing(true);
    const newStroke: Stroke = {
      points: [{ x, y }],
      color: penColor,
      width: penWidth,
    };
    setCurrentStroke(newStroke);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = penColor;
      ctx.beginPath();
      ctx.arc(x, y, penWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasCoords(e);

    const newPoints = [...currentStroke.points, { x, y }];
    setCurrentStroke({ ...currentStroke, points: newPoints });

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const len = newPoints.length;
    if (len >= 2) {
      const p1 = newPoints[len - 2];
      const p2 = newPoints[len - 1];
      ctx.strokeStyle = currentStroke.color;
      ctx.lineWidth = currentStroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing && currentStroke && currentStroke.points.length > 0) {
      setIsDrawing(false);
      const updatedStrokes = [...strokes, currentStroke];
      setStrokes(updatedStrokes);
      setCurrentStroke(null);
    }
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const updated = strokes.slice(0, -1);
    setStrokes(updated);
    redrawCanvas(updated);
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Simpan Tanda Tangan Hasil Gambar ke State, LocalStorage, dan Lembar Surat
  const handleSaveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (strokes.length === 0 && !data.drawnSignatureUrl) {
      toast("Silakan buat goresan tanda tangan terlebih dahulu pada kanvas.", "warning");
      return;
    }

    try {
      let finalSignatureDataUrl = "";

      if (strokes.length > 0) {
        // Hitung bounding box goresan untuk auto-crop rapi
        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = 0;
        let maxY = 0;

        strokes.forEach((stroke) => {
          stroke.points.forEach((pt) => {
            if (pt.x < minX) minX = pt.x;
            if (pt.x > maxX) maxX = pt.x;
            if (pt.y < minY) minY = pt.y;
            if (pt.y > maxY) maxY = pt.y;
          });
        });

        const pad = 12;
        minX = Math.max(0, Math.floor(minX - pad));
        minY = Math.max(0, Math.floor(minY - pad));
        maxX = Math.min(canvas.width, Math.ceil(maxX + pad));
        maxY = Math.min(canvas.height, Math.ceil(maxY + pad));

        const cropW = Math.min(canvas.width - minX, Math.max(20, maxX - minX));
        const cropH = Math.min(canvas.height - minY, Math.max(20, maxY - minY));

        const trimCanvas = document.createElement("canvas");
        trimCanvas.width = cropW;
        trimCanvas.height = cropH;
        const trimCtx = trimCanvas.getContext("2d");

        if (trimCtx && cropW > 0 && cropH > 0) {
          trimCtx.drawImage(
            canvas,
            minX,
            minY,
            cropW,
            cropH,
            0,
            0,
            cropW,
            cropH
          );
          finalSignatureDataUrl = trimCanvas.toDataURL("image/png");
        } else {
          finalSignatureDataUrl = canvas.toDataURL("image/png");
        }
      } else {
        finalSignatureDataUrl = data.drawnSignatureUrl || canvas.toDataURL("image/png");
      }

      // Pastikan ada isi
      if (!finalSignatureDataUrl) {
        finalSignatureDataUrl = canvas.toDataURL("image/png");
      }

      // Update state lengkap
      const updatedData = {
        ...data,
        drawnSignatureUrl: finalSignatureDataUrl,
        signatureMode: "gambar" as const,
      };

      setData(updatedData);

      // Simpan permanen ke LocalStorage
      try {
        localStorage.setItem("surat_lamaran_draft", JSON.stringify(updatedData));
        localStorage.setItem("surat_lamaran_drawn_signature", finalSignatureDataUrl);
        localStorage.setItem("surat_lamaran_signature_strokes", JSON.stringify(strokes));
      } catch (err) {
        console.error("Storage error:", err);
      }

      setIsCanvasModalOpen(false);
      toast("Tanda tangan pena berhasil disimpan dan diterapkan ke surat!", "success");
    } catch (err) {
      console.error("Error saving signature:", err);
      const fallbackUrl = canvas.toDataURL("image/png");
      const updatedData = {
        ...data,
        drawnSignatureUrl: fallbackUrl,
        signatureMode: "gambar" as const,
      };
      setData(updatedData);
      try {
        localStorage.setItem("surat_lamaran_draft", JSON.stringify(updatedData));
        localStorage.setItem("surat_lamaran_drawn_signature", fallbackUrl);
      } catch (e) {}
      setIsCanvasModalOpen(false);
      toast("Tanda tangan pena berhasil disimpan!", "success");
    }
  };

  // Hapus Tanda Tangan Gambar Pen
  const handleDeleteDrawnSignature = () => {
    setStrokes([]);
    setData((prev) => {
      const updated = {
        ...prev,
        drawnSignatureUrl: "",
        signatureMode: "asli" as const,
      };
      try {
        localStorage.setItem("surat_lamaran_draft", JSON.stringify(updated));
        localStorage.removeItem("surat_lamaran_drawn_signature");
        localStorage.removeItem("surat_lamaran_signature_strokes");
      } catch (e) {}
      return updated;
    });
    toast("Tanda tangan gambar telah dihapus, kembali ke tanda tangan asli", "info");
  };

  // Render Konten Lembar Surat A4
  const renderA4LetterContent = () => (
    <div 
      className="print-area bg-white text-[#111827] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-sm w-full max-w-[660px] min-h-[920px] p-10 sm:p-14 text-[13px] sm:text-[13.5px] leading-[1.7] transition-all border border-zinc-300/40 relative"
      style={{
        fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
        color: "#111827",
      }}
    >
      {/* Tanggal Surat (Rata Kanan) */}
      <div className="text-right mb-6 text-zinc-800">
        {data.tempatTanggal}
      </div>

      {/* Tujuan Surat (Rata Kiri) */}
      <div className="mb-6 space-y-0.5 text-zinc-900">
        <div>Kepada Yth.</div>
        <div className="font-bold">{data.penerima}</div>
        <div className="font-bold tracking-wide uppercase text-zinc-950">{data.namaPerusahaan}</div>
        <div className="whitespace-pre-line text-zinc-800 leading-relaxed text-[12.5px] sm:text-[13px]">
          {data.alamatPerusahaan}
        </div>
      </div>

      {/* Salam Pembuka */}
      <div className="mb-3.5 font-bold text-zinc-950">
        Dengan hormat,
      </div>

      {/* Paragraf Pembuka */}
      <p className="mb-3 text-justify text-zinc-800">
        Sesuai informasi yang saya peroleh dari {data.sumberLowongan} bahwa terdapat lowongan pekerjaan pada perusahaan Bapak/Ibu. Melalui surat lamaran ini, saya mengajukan diri melamar pekerjaan sebagai <span className="font-semibold text-zinc-950">{data.posisi}</span>. Saya yang bertandatangan di bawah ini:
      </p>

      {/* Tabel Identitas Diri (Titik Dua Lurus Sempurna) */}
      <div className="my-3 space-y-1 text-[12.5px] sm:text-[13px]">
        <div className="grid grid-cols-[160px_12px_1fr] items-start">
          <span className="text-zinc-800">Nama</span>
          <span className="text-zinc-900">:</span>
          <span className="font-semibold text-zinc-950">{data.nama}</span>
        </div>
        <div className="grid grid-cols-[160px_12px_1fr] items-start">
          <span className="text-zinc-800">Tempat, Tanggal Lahir</span>
          <span className="text-zinc-900">:</span>
          <span className="text-zinc-900">{data.tempatTanggalLahir}</span>
        </div>
        <div className="grid grid-cols-[160px_12px_1fr] items-start">
          <span className="text-zinc-800">Pendidikan</span>
          <span className="text-zinc-900">:</span>
          <span className="text-zinc-900">{data.pendidikan}</span>
        </div>
        <div className="grid grid-cols-[160px_12px_1fr] items-start">
          <span className="text-zinc-800">Status Nikah</span>
          <span className="text-zinc-900">:</span>
          <span className="text-zinc-900">{data.statusNikah}</span>
        </div>
        <div className="grid grid-cols-[160px_12px_1fr] items-start">
          <span className="text-zinc-800">Alamat</span>
          <span className="text-zinc-900">:</span>
          <span className="text-zinc-900">{data.alamatPelamar}</span>
        </div>
        <div className="grid grid-cols-[160px_12px_1fr] items-start">
          <span className="text-zinc-800">No. Telp.</span>
          <span className="text-zinc-900">:</span>
          <span className="text-zinc-900">{data.noTelp}</span>
        </div>
      </div>

      {/* Paragraf Pengalaman & Etos Kerja */}
      <p className="my-3 text-justify text-zinc-800">
        {data.paragrafPengalaman}
      </p>

      {/* Paragraf Penutup */}
      <p className="my-3 text-justify text-zinc-800">
        {data.paragrafPenutup}
      </p>

      {/* Ucapan Terima Kasih */}
      <p className="mt-4 mb-8 text-zinc-800">
        {data.ucapanTerimaKasih}
      </p>

      {/* Tanda Tangan & Nama Terang */}
      <div className="mt-8 text-left">
        <div className="mb-2 text-zinc-800">Hormat saya,</div>
        
        {/* Render Area TTD */}
        <div className="h-16 flex items-center my-1">
          {data.signatureMode === "gambar" && data.drawnSignatureUrl ? (
            <img 
              src={data.drawnSignatureUrl} 
              alt="Tanda Tangan Gambar Pen" 
              className="h-14 w-auto object-contain"
            />
          ) : data.signatureMode === "asli" ? (
            <img 
              src="/images/rinda-signature.png" 
              alt="Tanda Tangan Rinda Asli" 
              className="h-14 w-auto object-contain"
            />
          ) : (
            <div className="h-14 w-36 border border-dashed border-zinc-300 flex items-center justify-center text-[10px] text-zinc-400 no-print rounded">
              (Tanda Tangan Basah)
            </div>
          )}
        </div>

        <div className="font-bold text-zinc-950 text-sm">
          {data.nama}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#09090b] text-zinc-100 flex flex-col relative pb-20">
      
      {/* ===================== TOP HEADER / ACTION BAR ===================== */}
      <header className="no-print bg-[#0e0e11] border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">Formulir Surat Lamaran</h1>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Generator
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Input data di bawah ini. Hasil surat mengambang di pojok kanan atas.
            </p>
          </div>
        </div>

        {/* Action Buttons Top Bar (Disatukan: Lihat Hasil, Word, Txt, Salin Teks, Cetak / PDF) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Lihat Hasil */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsMiniPreviewVisible(!isMiniPreviewVisible)}
            className={`text-xs h-9 transition-all font-medium ${
              isMiniPreviewVisible 
                ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 hover:text-white shadow-md shadow-emerald-950/40" 
                : "border-zinc-700 bg-zinc-900/90 text-zinc-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 shadow-md"
            }`}
            title={isMiniPreviewVisible ? "Sembunyikan pratinjau surat" : "Tampilkan pratinjau surat mengambang"}
          >
            <Eye className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            <span>Lihat Hasil</span>
            {isMiniPreviewVisible ? (
              <span className="w-1.5 h-1.5 ml-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <span className="w-1.5 h-1.5 ml-1.5 rounded-full bg-zinc-500" />
            )}
          </Button>

          {/* Download Dropdown / Buttons */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDownloadDoc}
              className="text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs h-8 px-2.5"
              title="Download File Microsoft Word (.doc)"
            >
              <FileDown className="w-3.5 h-3.5 mr-1 text-blue-400" />
              Word (.doc)
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDownloadTxt}
              className="text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs h-8 px-2.5 border-l border-zinc-800"
              title="Download File Teks (.txt)"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-zinc-400" />
              Txt
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyText}
            className="border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs h-9"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
            {copied ? "Tersalin!" : "Salin Teks"}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-9 shadow-lg shadow-emerald-950/50"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Cetak / PDF
          </Button>
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
            className="flex flex-col rounded-xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.7)] border-2 border-zinc-700/90 bg-zinc-900/95 backdrop-blur-md transition-shadow hover:border-emerald-500/80 ring-1 ring-white/10"
            style={{ width: `${miniSize.width}px` }}
          >
            {/* Header Drag Bar (Bisa di-drag untuk memindahkan posisi) */}
            <div
              onPointerDown={handleDragStart}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
              onPointerCancel={handleDragEnd}
              className="flex items-center justify-between px-2.5 py-1.5 bg-zinc-900/95 border-b border-zinc-800 cursor-grab active:cursor-grabbing select-none touch-none hover:bg-zinc-800/60 transition-colors"
              title="Tahan dan geser untuk memindahkan pratinjau"
            >
              <div className="flex items-center gap-1.5 text-zinc-300 pointer-events-none">
                <Move className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-semibold tracking-wide text-zinc-200">Pratinjau</span>
                <span className="text-[9px] text-zinc-500 font-mono">({Math.round(miniSize.width)}px)</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
                {/* Buka Full Preview */}
                <button
                  type="button"
                  onClick={() => setIsEnlargedOpen(true)}
                  className="p-1 text-zinc-400 hover:text-emerald-400 rounded hover:bg-zinc-800 transition"
                  title="Perbesar penuh"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                {/* Close Mini Preview */}
                <button
                  type="button"
                  onClick={() => setIsMiniPreviewVisible(false)}
                  className="p-1 text-zinc-400 hover:text-red-400 rounded hover:bg-zinc-800 transition"
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
              {/* Scaled A4 Letter Content */}
              <div
                className="origin-top-left pointer-events-none select-none"
                style={{
                  transform: `scale(${miniSize.width / 660})`,
                  width: "660px",
                }}
              >
                {renderA4LetterContent()}
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 p-2 text-white pointer-events-none">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-xl transform group-hover:scale-110 transition-transform">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-emerald-300 bg-zinc-950/90 px-2.5 py-0.5 rounded-full border border-emerald-500/40 text-center shadow-lg">
                  Buka Penuh
                </span>
              </div>
            </div>

            {/* Footer Bottom Bar with Corner Resizers */}
            <div className="relative h-5 bg-zinc-900/95 border-t border-zinc-800 flex items-center justify-between px-2 select-none touch-none">
              
              {/* Pojok Bawah Kiri (Resize Handle) */}
              <div
                onPointerDown={(e) => handleResizeStart(e, "bottom-left")}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeEnd}
                onPointerCancel={handleResizeEnd}
                className="cursor-nesw-resize p-1 -ml-2 text-zinc-500 hover:text-emerald-400 active:text-emerald-300 group flex items-center justify-center transition-colors"
                title="Tarik pojok kiri bawah untuk mengubah ukuran"
              >
                <div className="w-2.5 h-2.5 border-b-2 border-l-2 border-current rounded-bl-sm group-hover:scale-125 transition-transform" />
              </div>

              {/* Petunjuk tengah */}
              <span className="text-[8px] text-zinc-500 tracking-wider uppercase font-semibold">Tarik pojok untuk resize</span>

              {/* Pojok Bawah Kanan (Resize Handle) */}
              <div
                onPointerDown={(e) => handleResizeStart(e, "bottom-right")}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeEnd}
                onPointerCancel={handleResizeEnd}
                className="cursor-nwse-resize p-1 -mr-2 text-zinc-500 hover:text-emerald-400 active:text-emerald-300 group flex items-center justify-center transition-colors"
                title="Tarik pojok kanan bawah untuk mengubah ukuran"
              >
                <div className="w-2.5 h-2.5 border-b-2 border-r-2 border-current rounded-br-sm group-hover:scale-125 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== FORM UTAMA DI TENGAH LAYAR ===================== */}
      <main className="no-print flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 space-y-6">
        
        {/* Card 1: Input Data Perusahaan & Posisi (Fokus Utama) */}
        <Card className="bg-[#121215]/90 border-zinc-800 text-white shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-zinc-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-zinc-100">Data Perusahaan & Posisi yang Dilamar</CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Input data tujuan surat, nama instansi, tanggal, dan posisi.
                  </CardDescription>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-7 text-xs border-zinc-800 text-zinc-400 hover:text-white"
              >
                <RotateCcw className="w-3 h-3 mr-1" /> Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            
            {/* Row 1: Tanggal & Posisi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tanggal Surat */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tempatTanggal" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Tanggal & Kota Surat
                  </Label>
                  <button
                    type="button"
                    onClick={() => updateData("tempatTanggal", `Ciamis, ${getIndonesianDateString()}`)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Hari Ini
                  </button>
                </div>
                <Input
                  id="tempatTanggal"
                  value={data.tempatTanggal}
                  onChange={(e) => updateData("tempatTanggal", e.target.value)}
                  placeholder="Contoh: Ciamis, 28 September 2026"
                  className="bg-zinc-950/70 border-zinc-800 text-white text-sm h-10 focus:border-emerald-500"
                />
              </div>

              {/* Posisi yang Dilamar */}
              <div className="space-y-1.5">
                <Label htmlFor="posisi" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" /> Posisi yang Dilamar
                </Label>
                <Input
                  id="posisi"
                  value={data.posisi}
                  onChange={(e) => updateData("posisi", e.target.value)}
                  placeholder="Contoh: Waiters, Web Developer..."
                  className="bg-zinc-950/70 border-zinc-800 text-emerald-400 font-semibold text-sm h-10 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Pilihan Cepat Posisi 1-Klik */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-zinc-400 mr-1">Preset Cepat:</span>
              {PRESET_POSISI.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => updateData("posisi", p.value)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                    data.posisi === p.value
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold"
                      : "bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Row 2: Nama Perusahaan */}
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="namaPerusahaan" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Nama Perusahaan / Instansi
              </Label>
              <Input
                id="namaPerusahaan"
                value={data.namaPerusahaan}
                onChange={(e) => updateData("namaPerusahaan", e.target.value)}
                placeholder="Contoh: PT. MACAKAL PANGAN SEJAHTERA"
                className="bg-zinc-950/70 border-zinc-800 text-white font-semibold text-sm h-10 focus:border-emerald-500 uppercase tracking-wide"
              />
            </div>

            {/* Row 3: Alamat Perusahaan */}
            <div className="space-y-1.5">
              <Label htmlFor="alamatPerusahaan" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Alamat Lengkap Perusahaan
              </Label>
              <textarea
                id="alamatPerusahaan"
                rows={3}
                value={data.alamatPerusahaan}
                onChange={(e) => updateData("alamatPerusahaan", e.target.value)}
                placeholder="Jl. Raya Cipaku No.8, Muktisari, Kec. Cipaku, Kabupaten Ciamis, Jawa Barat 46252"
                className="w-full rounded-md bg-zinc-950/70 border border-zinc-800 p-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 leading-relaxed resize-none"
              />
            </div>

            {/* Row 4: Penerima & Sumber Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="penerima" className="text-xs font-medium text-zinc-400">
                  Ditujukan Kepada
                </Label>
                <Input
                  id="penerima"
                  value={data.penerima}
                  onChange={(e) => updateData("penerima", e.target.value)}
                  className="bg-zinc-950/70 border-zinc-800 text-white text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sumber" className="text-xs font-medium text-zinc-400">
                  Sumber Lowongan Pekerjaan
                </Label>
                <Input
                  id="sumber"
                  value={data.sumberLowongan}
                  onChange={(e) => updateData("sumberLowongan", e.target.value)}
                  className="bg-zinc-950/70 border-zinc-800 text-white text-xs h-9"
                />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Card 2: Pengaturan Tanda Tangan */}
        <Card className="bg-[#121215]/90 border-zinc-800 text-white shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-zinc-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-zinc-100">Tanda Tangan Pelamar</CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Pilih tanda tangan asli dari foto, gambar ulang pakai pen digital, atau tanda tangan basah manual.
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            
            {/* Pilihan 3 Mode TTD */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Opsi 1: Gambar Pen */}
              <div 
                onClick={() => {
                  updateData("signatureMode", "gambar");
                  if (!data.drawnSignatureUrl) {
                    setIsCanvasModalOpen(true);
                  }
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  data.signatureMode === "gambar"
                    ? "bg-emerald-500/10 border-emerald-500/60 shadow-md shadow-emerald-950/20 ring-1 ring-emerald-500/30"
                    : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-emerald-400" /> Gambar Pen
                    </span>
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      data.signatureMode === "gambar" ? "border-emerald-500 bg-emerald-500" : "border-zinc-700"
                    }`}>
                      {data.signatureMode === "gambar" && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400">Goreskan tanda tangan pakai mouse atau stylus.</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-1.5">
                  {data.drawnSignatureUrl ? (
                    <div className="flex items-center gap-2">
                      <div className="h-8 bg-white/95 rounded px-2 flex items-center shadow-inner">
                        <img src={data.drawnSignatureUrl} alt="TTD Pen" className="h-6 object-contain" />
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Tersimpan
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-500 italic">Belum digambar</span>
                  )}

                  <div className="flex items-center gap-1">
                    {data.drawnSignatureUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDrawnSignature();
                        }}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-900 transition"
                        title="Hapus tanda tangan gambar ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCanvasModalOpen(true);
                      }}
                      className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-2.5"
                    >
                      {data.drawnSignatureUrl ? "Ubah" : "Mulai Gambar"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Opsi 2: TTD Asli Bawaan Foto */}
              <div 
                onClick={() => updateData("signatureMode", "asli")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  data.signatureMode === "asli"
                    ? "bg-emerald-500/10 border-emerald-500/60 shadow-md shadow-emerald-950/20 ring-1 ring-emerald-500/30"
                    : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> TTD Asli Rinda
                    </span>
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      data.signatureMode === "asli" ? "border-emerald-500 bg-emerald-500" : "border-zinc-700"
                    }`}>
                      {data.signatureMode === "asli" && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400">Tanda tangan dari foto surat lamaran asli.</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="h-8 bg-white/95 rounded px-2.5 flex items-center shadow-inner">
                    <img src="/images/rinda-signature.png" alt="TTD Rinda" className="h-6 object-contain" />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">Bawaan Asli</span>
                </div>
              </div>

              {/* Opsi 3: TTD Basah Manual */}
              <div 
                onClick={() => updateData("signatureMode", "manual")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  data.signatureMode === "manual"
                    ? "bg-emerald-500/10 border-emerald-500/60 shadow-md shadow-emerald-950/20 ring-1 ring-emerald-500/30"
                    : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" /> TTD Basah (Manual)
                    </span>
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      data.signatureMode === "manual" ? "border-emerald-500 bg-emerald-500" : "border-zinc-700"
                    }`}>
                      {data.signatureMode === "manual" && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400">Area tanda tangan dikosongkan untuk tanda tangan pulpen fisik.</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center text-[10px] text-zinc-500 italic">
                  Kosong saat dicetak
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Card 3: Biodata Pelamar & Paragraf (Collapsible / Buka-Tutup) */}
        <Card className="bg-[#121215]/90 border-zinc-800 text-white shadow-xl backdrop-blur-sm">
          <CardHeader 
            onClick={() => setShowBiodataAccordion(!showBiodataAccordion)}
            className="pb-3 border-b border-zinc-800/80 cursor-pointer hover:bg-zinc-900/30 transition flex flex-row items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
                <User className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-zinc-200">
                  Data Diri Pelamar & Paragraf (Opsional)
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Nama, TTL, Pendidikan SMK, Alamat, dan Paragraf PKL (Sudah terisi default).
                </CardDescription>
              </div>
            </div>
            <button type="button" className="text-zinc-400 p-1">
              {showBiodataAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </CardHeader>

          {showBiodataAccordion && (
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-zinc-300">Nama Lengkap</Label>
                  <Input
                    value={data.nama}
                    onChange={(e) => updateData("nama", e.target.value)}
                    className="bg-zinc-950/70 border-zinc-800 text-white text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-zinc-300">Tempat, Tanggal Lahir</Label>
                  <Input
                    value={data.tempatTanggalLahir}
                    onChange={(e) => updateData("tempatTanggalLahir", e.target.value)}
                    className="bg-zinc-950/70 border-zinc-800 text-white text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-zinc-300">Pendidikan Terakhir</Label>
                  <Input
                    value={data.pendidikan}
                    onChange={(e) => updateData("pendidikan", e.target.value)}
                    className="bg-zinc-950/70 border-zinc-800 text-white text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-zinc-300">Status Pernikahan</Label>
                  <Input
                    value={data.statusNikah}
                    onChange={(e) => updateData("statusNikah", e.target.value)}
                    className="bg-zinc-950/70 border-zinc-800 text-white text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-zinc-300">Alamat Tempat Tinggal</Label>
                  <Input
                    value={data.alamatPelamar}
                    onChange={(e) => updateData("alamatPelamar", e.target.value)}
                    className="bg-zinc-950/70 border-zinc-800 text-white text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-zinc-300">No. WhatsApp / HP</Label>
                  <Input
                    value={data.noTelp}
                    onChange={(e) => updateData("noTelp", e.target.value)}
                    className="bg-zinc-950/70 border-zinc-800 text-white text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-zinc-800/80">
                <Label className="text-xs text-zinc-300">Paragraf Pengalaman Kerja / PKL</Label>
                <textarea
                  rows={4}
                  value={data.paragrafPengalaman}
                  onChange={(e) => updateData("paragrafPengalaman", e.target.value)}
                  className="w-full rounded-md bg-zinc-950/70 border border-zinc-800 p-2.5 text-xs text-zinc-200 leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Footer Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-xs text-zinc-400">
          <span>✨ Perubahan otomatis disimpan ke browser Anda.</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-zinc-800 text-zinc-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Form
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Cetak / PDF
            </Button>
          </div>
        </div>

      </main>

      {/* ===================== MODAL PEMBESAR HASIL SURAT (ENLARGED PREVIEW) ===================== */}
      {isEnlargedOpen && (
        <div className="no-print fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-start p-3 sm:p-6 overflow-y-auto overscroll-contain animate-in fade-in duration-200">
          
          {/* Top Bar Modal Pembesar */}
          <div className="w-full max-w-4xl bg-zinc-900/95 border border-zinc-800 rounded-xl p-3 sm:px-5 sm:py-3.5 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-2xl sticky top-2 z-20 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Pratinjau Lembar Surat Lamaran (A4)
                </h3>
                <span className="text-[11px] text-zinc-400">
                  Siap cetak atau diunduh ke berbagai format.
                </span>
              </div>
            </div>

            {/* Tombol Aksi di Modal: Download, Salin, Cetak, dan CLOSE */}
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-xs text-zinc-300">
                <button
                  onClick={() => setZoomScale(Math.max(0.7, zoomScale - 0.1))}
                  className="p-1 hover:text-white rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] font-mono">{Math.round(zoomScale * 100)}%</span>
                <button
                  onClick={() => setZoomScale(Math.min(1.2, zoomScale + 0.1))}
                  className="p-1 hover:text-white rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Download DOC */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadDoc}
                className="h-8 text-xs border-zinc-700 bg-zinc-800 text-zinc-200 hover:text-white"
                title="Download file Microsoft Word (.doc)"
              >
                <FileDown className="w-3.5 h-3.5 mr-1 text-blue-400" />
                Word (.doc)
              </Button>

              {/* Download PDF / Print */}
              <Button
                type="button"
                size="sm"
                onClick={handlePrint}
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md shadow-emerald-950/50"
              >
                <Printer className="w-3.5 h-3.5 mr-1" />
                Download PDF
              </Button>

              {/* TOMBOL CLOSE (SILANG) */}
              <button
                type="button"
                onClick={() => setIsEnlargedOpen(false)}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 border border-zinc-700 hover:border-red-500/30 flex items-center justify-center text-zinc-300 transition"
                title="Tutup Pratinjau (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lembar Surat A4 di dalam Modal Pembesar */}
          <div 
            className="w-full flex justify-center pb-20 transition-transform duration-150 origin-top"
            style={{ transform: `scale(${zoomScale})` }}
          >
            {renderA4LetterContent()}
          </div>
        </div>
      )}

      {/* Hidden printable letter in DOM for clean window.print() */}
      <div className="hidden print:block">
        {renderA4LetterContent()}
      </div>

      {/* ===================== MODAL KANVAS GAMBAR PEN ===================== */}
      {isCanvasModalOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-white flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Goreskan Tanda Tangan Anda</h3>
                  <p className="text-[11px] text-zinc-400">Gunakan mouse, stylus pen, atau layar sentuh.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCanvasModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Toolbar */}
            <div className="px-5 py-3 bg-zinc-950/80 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                {/* Warna Tinta */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-zinc-400">Tinta:</span>
                  <div className="flex gap-1 bg-zinc-900 p-0.5 rounded-md border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setPenColor("#111827")}
                      title="Hitam Formal"
                      className={`w-5 h-5 rounded-full border ${
                        penColor === "#111827" ? "ring-2 ring-emerald-400 border-white bg-black" : "border-zinc-700 bg-zinc-900"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setPenColor("#1d4ed8")}
                      title="Biru Pulpen Formal"
                      className={`w-5 h-5 rounded-full border ${
                        penColor === "#1d4ed8" ? "ring-2 ring-emerald-400 border-white bg-blue-600" : "border-zinc-700 bg-blue-700"
                      }`}
                    />
                  </div>
                </div>

                {/* Ketebalan */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-zinc-400">Tebal:</span>
                  <div className="flex gap-1 bg-zinc-900 p-0.5 rounded-md border border-zinc-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPenWidth(1.5)}
                      className={`px-2 py-0.5 rounded ${penWidth === 1.5 ? "bg-zinc-800 text-white font-bold" : "text-zinc-400"}`}
                    >
                      Tipis
                    </button>
                    <button
                      type="button"
                      onClick={() => setPenWidth(2.5)}
                      className={`px-2 py-0.5 rounded ${penWidth === 2.5 ? "bg-zinc-800 text-white font-bold" : "text-zinc-400"}`}
                    >
                      Sedang
                    </button>
                    <button
                      type="button"
                      onClick={() => setPenWidth(4)}
                      className={`px-2 py-0.5 rounded ${penWidth === 4 ? "bg-zinc-800 text-white font-bold" : "text-zinc-400"}`}
                    >
                      Tebal
                    </button>
                  </div>
                </div>
              </div>

              {/* Undo / Clear */}
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={strokes.length === 0}
                  className="h-7 text-xs border-zinc-800 text-zinc-300 hover:text-white"
                >
                  <Undo2 className="w-3.5 h-3.5 mr-1" /> Undo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={strokes.length === 0}
                  className="h-7 text-xs border-zinc-800 text-zinc-400 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Bersihkan
                </Button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="p-5 bg-zinc-950 flex flex-col items-center">
              <div className="relative w-full bg-white rounded-xl overflow-hidden shadow-inner border border-zinc-300">
                <canvas
                  ref={canvasRef}
                  width={540}
                  height={180}
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerLeave={stopDrawing}
                  className="w-full h-44 cursor-crosshair touch-none select-none block bg-transparent"
                  style={{ touchAction: "none" }}
                />

                {/* Garis Dasar TTD */}
                <div className="absolute bottom-6 left-8 right-8 border-b border-dashed border-zinc-300 pointer-events-none flex justify-between text-[11px] text-zinc-400">
                  <span>Garis Tanda Tangan</span>
                  <span>✍️ Ruang Goresan</span>
                </div>

                {strokes.length === 0 && !data.drawnSignatureUrl && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-zinc-400">
                    <PenTool className="w-7 h-7 mb-1 text-zinc-300 animate-pulse" />
                    <span className="text-xs font-medium text-zinc-400">Silakan goreskan tanda tangan di sini</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">
                {strokes.length > 0 ? `${strokes.length} goresan aktif` : data.drawnSignatureUrl ? "Tanda tangan sebelumnya termuat" : "Belum ada goresan"}
              </span>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCanvasModalOpen(false)}
                  className="border-zinc-800 text-zinc-300 hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveSignature}
                  disabled={strokes.length === 0 && !data.drawnSignatureUrl}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md shadow-emerald-950/50"
                >
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Terapkan ke Surat
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
