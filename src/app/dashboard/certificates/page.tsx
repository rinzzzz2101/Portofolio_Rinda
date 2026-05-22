"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, GraduationCap, Trash2, Edit2, ExternalLink, Calendar } from "lucide-react";
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
        <Button onClick={handleOpenCreate} className="bg-purple-600 hover:bg-purple-700 text-white">
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
                <Label>URL PDF / Link (Opsional)</Label>
                <Input value={form.pdfUrl} onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })} placeholder="https://..." className="bg-gray-900 border-gray-800" />
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditingId(null); }} className="border-gray-800 text-white hover:bg-gray-900">Batal</Button>
              {!editingId && (
                <Button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading} className="bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300">
                  {loading ? "Menyimpan..." : "Simpan & Tambah Lagi"}
                </Button>
              )}
              <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
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
            <Card key={cert.id} className="glass-card border-gray-800 text-white hover:border-purple-500/20 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-purple-400" />
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
                  <p className="text-purple-400 text-sm mt-1">{cert.issuer}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(cert.issueDate).toLocaleDateString("id-ID", { year: "numeric", month: "long" })}
                  </span>
                  {cert.pdfUrl && (
                    <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      <ExternalLink className="w-3 h-3" /> Lihat
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
