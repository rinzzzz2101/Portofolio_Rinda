"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, GraduationCap, Trash2, Edit2, ExternalLink, Calendar, X } from "lucide-react";
import { createCertificate, getCertificates, deleteCertificate, updateCertificate } from "@/actions/certificates";
import { useToast } from "@/components/ui/toast-provider";
import { useConfirm } from "@/components/ui/confirm-provider";
import { PanelLoading, LoadingSpinner } from "@/components/ui/loading";

export default function AdminCertificatesPage() {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [certificates, setCertificates] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", issuer: "", issueDate: "", pdfUrl: "" });
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  const loadCertificates = async () => {
    setFetching(true);
    const res = await getCertificates();
    if (res.success) setCertificates(res.data);
    setFetching(false);
  };

  useEffect(() => {
    setMounted(true);
    loadCertificates();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ name: "", issuer: "", issueDate: "", pdfUrl: "" });
    setErrorMsg("");
    setOpen(true);
  };

  const handleOpenEdit = (cert: any) => {
    setEditingId(cert.id);
    const dateFormatted = cert.issueDate ? new Date(cert.issueDate).toISOString().split("T")[0] : "";
    setForm({
      name: cert.name,
      issuer: cert.issuer,
      issueDate: dateFormatted,
      pdfUrl: cert.pdfUrl || "",
    });
    setErrorMsg("");
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent, addMore = false) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const payload = {
      name: form.name,
      issuer: form.issuer,
      issueDate: form.issueDate,
      pdfUrl: form.pdfUrl || undefined,
    };

    const res = editingId 
      ? await updateCertificate(editingId, payload)
      : await createCertificate(payload);

    setLoading(false);
    if (res.success) {
      toast(editingId ? "Sertifikat berhasil diubah!" : "Sertifikat berhasil disimpan!", "success");
      setForm({ name: "", issuer: "", issueDate: "", pdfUrl: "" });
      
      if (!addMore) {
        setOpen(false);
        setEditingId(null);
      } else {
        toast("Silakan tambahkan sertifikat berikutnya.", "info");
      }
      loadCertificates();
    } else {
      setErrorMsg("Gagal menyimpan. Pastikan database sudah terkoneksi.");
      toast("Gagal menyimpan sertifikat.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Sertifikat?",
      message: "Apakah Anda yakin ingin menghapus sertifikat ini secara permanen?",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger"
    });
    if (!isConfirmed) return;
    const res = await deleteCertificate(id);
    if (res.success) {
      toast("Sertifikat berhasil dihapus.", "success");
      loadCertificates();
    } else {
      toast("Gagal menghapus sertifikat.", "error");
    }
  };

  if (!mounted) return <PanelLoading />;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Sertifikat</h1>
          <p className="text-gray-400 mt-2">Atur sertifikat dan penghargaan Anda di sini.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium">
          <Plus className="w-4 h-4 mr-2" /> Tambah Sertifikat
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px] bg-[#0a0a0a] border-gray-800 text-white">
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Sertifikat" : "Tambah Sertifikat"}</DialogTitle>
              <DialogDescription className="text-gray-400">Upload sertifikat dan penghargaan Anda.</DialogDescription>
            </DialogHeader>
            {errorMsg && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-400 text-sm">{errorMsg}</div>}
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nama Sertifikat</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="AWS Certified Developer" className="bg-gray-900 border-gray-800" />
              </div>
              <div className="grid gap-2">
                <Label>Penerbit</Label>
                <Input required value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} placeholder="Amazon Web Services" className="bg-gray-900 border-gray-800" />
              </div>
              <div className="grid gap-2">
                <Label>Tanggal Terbit</Label>
                <Input type="date" required value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} className="bg-gray-900 border-gray-800" />
              </div>
              <div className="grid gap-2">
                <Label>Upload Dokumen (PDF, PNG, JPG) - Opsional</Label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="bg-gray-900 border-gray-800 file:text-white"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const isPDF = file.type === "application/pdf";
                      
                      if (isPDF) {
                        // Batasi PDF maksimal 3MB (karena base64 bertambah 33%, jadi ~4MB di payload Vercel)
                        const maxPdfSize = 3 * 1024 * 1024;
                        if (file.size > maxPdfSize) {
                          toast("Dokumen PDF terlalu besar! Maksimal 3MB.", "error");
                          e.target.value = "";
                          return;
                        }
                        
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setForm({ ...form, pdfUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      } else {
                        // Jika Gambar (PNG/JPG), kompres menggunakan HTML5 Canvas
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const img = new Image();
                          img.src = reader.result as string;
                          img.onload = () => {
                            const canvas = document.createElement("canvas");
                            let width = img.width;
                            let height = img.height;
                            
                            // Batas dimensi maksimal 1200px
                            const maxDimension = 1200;
                            if (width > height) {
                              if (width > maxDimension) {
                                height = Math.round((height * maxDimension) / width);
                                width = maxDimension;
                              }
                            } else {
                              if (height > maxDimension) {
                                width = Math.round((width * maxDimension) / height);
                                height = maxDimension;
                              }
                            }
                            
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext("2d");
                            if (ctx) {
                              ctx.drawImage(img, 0, 0, width, height);
                              // Simpan sebagai JPEG berkualitas 0.7 (mengompres file 4MB+ menjadi < 500KB)
                              const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
                              setForm({ ...form, pdfUrl: compressedDataUrl });
                              toast("Gambar berhasil dikompres otomatis!", "success");
                            }
                          };
                        };
                        reader.readAsDataURL(file);
                      }
                    }
                  }}
                />
                {form.pdfUrl && (
                  <p className="text-xs text-zinc-400 font-medium">✓ Dokumen siap diupload</p>
                )}
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditingId(null); }} className="border-gray-800 text-white hover:bg-gray-900">Batal</Button>
              {!editingId && (
                <Button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading} className="bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-100">
                  {loading ? "Menyimpan..." : "Simpan & Tambah Lagi"}
                </Button>
              )}
              <Button type="submit" disabled={loading} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium">
                {loading ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Simpan")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {fetching ? (
        <LoadingSpinner message="Mengambil data sertifikat..." />
      ) : certificates.length === 0 ? (
        <Card className="glass-card border-gray-800 text-white">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <GraduationCap className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Belum ada Sertifikat</h3>
            <p className="text-gray-400">Klik tombol "+ Tambah Sertifikat" untuk mulai menambahkan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="glass-card border-gray-800 text-white hover:border-zinc-700 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-zinc-800 border border-zinc-750 rounded-xl flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-zinc-300" />
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(cert)} className="hover:bg-gray-800 text-gray-300">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(cert.id)} className="hover:bg-red-500/10 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-white leading-tight">{cert.name}</h3>
                  <p className="text-zinc-400 text-sm mt-1">{cert.issuer}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(cert.issueDate).toLocaleDateString("id-ID", { year: "numeric", month: "long" })}
                  </span>
                  {cert.pdfUrl && (
                    <button 
                      onClick={() => setSelectedCert(cert)}
                      className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> Lihat
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Certificate Preview Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setSelectedCert(null)}>
          <div className="relative max-w-2xl w-full bg-[#0a0a0a] border border-gray-800 rounded-2xl overflow-hidden p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-xl text-white">{selectedCert.name}</h3>
                <p className="text-zinc-400 text-sm mt-1">{selectedCert.issuer}</p>
              </div>
              <button className="text-gray-400 hover:text-white p-1" onClick={() => setSelectedCert(null)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-full min-h-[300px] h-[450px] flex items-center justify-center bg-gray-950 border border-gray-900 rounded-xl overflow-hidden relative p-1">
              {selectedCert.pdfUrl.startsWith("data:application/pdf") || selectedCert.pdfUrl.endsWith(".pdf") ? (
                <iframe src={selectedCert.pdfUrl} className="w-full h-full rounded-lg border-0 bg-white" title={selectedCert.name} />
              ) : (
                <img src={selectedCert.pdfUrl} alt={selectedCert.name} className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <a 
                href={selectedCert.pdfUrl} 
                download={`sertifikat-${selectedCert.name.toLowerCase().replace(/\s+/g, '-')}${selectedCert.pdfUrl.startsWith("data:application/pdf") || selectedCert.pdfUrl.endsWith(".pdf") ? ".pdf" : ".jpg"}`}
                className="inline-flex items-center justify-center px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium rounded-lg text-sm transition"
              >
                Download Dokumen
              </a>
              <button 
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 border border-gray-800 hover:bg-gray-900 text-gray-300 rounded-lg text-sm transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
