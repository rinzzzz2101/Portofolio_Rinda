"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, GraduationCap, Trash2, Edit2 } from "lucide-react";
import { createEducation, getEducations, deleteEducation, updateEducation } from "@/actions/educations";
import { useToast } from "@/components/ui/toast-provider";
import { useConfirm } from "@/components/ui/confirm-provider";
import { PanelLoading, LoadingSpinner } from "@/components/ui/loading";

export default function AdminEducationPage() {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [educations, setEducations] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [form, setForm] = useState({
    institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", description: ""
  });

  const loadEducations = async () => {
    setFetching(true);
    const res = await getEducations();
    if (res.success) setEducations(res.data);
    setFetching(false);
  };

  useEffect(() => {
    setMounted(true);
    loadEducations();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", description: "" });
    setErrorMsg("");
    setOpen(true);
  };

  const handleOpenEdit = (edu: any) => {
    setEditingId(edu.id);
    const startYear = edu.startDate ? new Date(edu.startDate).getFullYear().toString() : "";
    const endYear = edu.endDate ? new Date(edu.endDate).getFullYear().toString() : "";
    setForm({
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy || "",
      startDate: startYear,
      endDate: endYear,
      description: edu.description || ""
    });
    setErrorMsg("");
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent, addMore = false) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const payload = {
      institution: form.institution,
      degree: form.degree,
      fieldOfStudy: form.fieldOfStudy || undefined,
      startDate: form.startDate ? `${form.startDate}-01-01` : "",
      endDate: form.endDate ? `${form.endDate}-12-31` : undefined,
      description: form.description || undefined
    };

    const res = editingId 
      ? await updateEducation(editingId, payload)
      : await createEducation(payload);

    setLoading(false);
    if (res.success) {
      toast(editingId ? "Pendidikan berhasil diubah!" : "Pendidikan berhasil disimpan!", "success");
      setForm({ institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", description: "" });
      
      if (!addMore) {
        setOpen(false);
        setEditingId(null);
      } else {
        toast("Silakan tambahkan data pendidikan berikutnya.", "info");
      }
      loadEducations();
    } else {
      setErrorMsg("Gagal menyimpan. Pastikan database sudah terkoneksi.");
      toast("Gagal menyimpan data pendidikan.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Riwayat Pendidikan?",
      message: "Apakah Anda yakin ingin menghapus data pendidikan ini?",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger"
    });
    if (!isConfirmed) return;
    const res = await deleteEducation(id);
    if (res.success) {
      toast("Pendidikan berhasil dihapus.", "success");
      loadEducations();
    } else {
      toast("Gagal menghapus data pendidikan.", "error");
    }
  };

  if (!mounted) return <PanelLoading />;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Pendidikan</h1>
          <p className="text-gray-400 mt-2">Atur riwayat pendidikan akademis Anda.</p>
        </div>
        
        <Button onClick={handleOpenCreate} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium">
          <Plus className="w-4 h-4 mr-2" /> Tambah Pendidikan
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#0a0a0a] border-gray-800 text-white">
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Riwayat Pendidikan" : "Tambah Riwayat Pendidikan"}</DialogTitle>
              <DialogDescription className="text-gray-400">Masukkan detail sekolah atau universitas Anda.</DialogDescription>
            </DialogHeader>
            {errorMsg && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-400 text-sm">{errorMsg}</div>}
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nama Institusi (Sekolah/Universitas)</Label>
                <Input required value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="Universitas Indonesia" className="bg-gray-900 border-gray-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Gelar / Jenjang</Label>
                  <Input required value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} placeholder="S1 / D3 / SMA" className="bg-gray-900 border-gray-800" />
                </div>
                <div className="grid gap-2">
                  <Label>Jurusan (Opsional)</Label>
                  <Input value={form.fieldOfStudy} onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })} placeholder="Teknik Informatika" className="bg-gray-900 border-gray-800" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tahun Masuk</Label>
                  <Input
                    type="number"
                    required
                    min="1900"
                    max={new Date().getFullYear()}
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    placeholder={new Date().getFullYear().toString()}
                    className="bg-gray-900 border-gray-800"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Tahun Lulus (Opsional)</Label>
                  <Input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 10}
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    placeholder="Kosongkan jika belum lulus"
                    className="bg-gray-900 border-gray-800"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Keterangan / Deskripsi (Opsional)</Label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-550"
                  placeholder="Nilai IPK, pencapaian, dll..." />
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
        <LoadingSpinner message="Mengambil data pendidikan..." />
      ) : educations.length === 0 ? (
        <Card className="glass-card border-gray-800 text-white">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <GraduationCap className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Belum ada Riwayat Pendidikan</h3>
            <p className="text-gray-400">Klik tombol "+ Tambah Pendidikan" untuk mulai menambahkan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {educations.map((edu) => (
            <Card key={edu.id} className="glass-card border-gray-800 text-white hover:border-zinc-700 transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white">{edu.institution}</h3>
                    <p className="text-zinc-300 text-sm font-medium mt-1">
                      {edu.degree} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ""}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Angkatan {new Date(edu.startDate).getFullYear()}{edu.endDate ? ` — Lulus ${new Date(edu.endDate).getFullYear()}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(edu)} className="hover:bg-gray-800 text-gray-300">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(edu.id)} className="hover:bg-red-500/10 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {edu.description && <p className="text-gray-400 text-sm leading-relaxed">{edu.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
