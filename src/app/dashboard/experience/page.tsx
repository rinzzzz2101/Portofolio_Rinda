"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Briefcase, Trash2, Edit2, MapPin, Calendar } from "lucide-react";
import { createExperience, getExperiences, deleteExperience, updateExperience } from "@/actions/experiences";
import { useToast } from "@/components/ui/toast-provider";
import { useConfirm } from "@/components/ui/confirm-provider";
import { PanelLoading, LoadingSpinner } from "@/components/ui/loading";

export default function AdminExperiencePage() {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [experiences, setExperiences] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  
  const [form, setForm] = useState({
    position: "", company: "", location: "", startDate: "", endDate: "", description: ""
  });

  const loadExperiences = async () => {
    setFetching(true);
    const res = await getExperiences();
    if (res.success) setExperiences(res.data);
    setFetching(false);
  };

  useEffect(() => {
    setMounted(true);
    loadExperiences();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ position: "", company: "", location: "", startDate: "", endDate: "", description: "" });
    setErrorMsg("");
    setOpen(true);
  };

  const handleOpenEdit = (exp: any) => {
    setEditingId(exp.id);
    const startFormatted = exp.startDate ? new Date(exp.startDate).toISOString().split("T")[0] : "";
    const endFormatted = exp.endDate ? new Date(exp.endDate).toISOString().split("T")[0] : "";
    setForm({
      position: exp.position,
      company: exp.company,
      location: exp.location || "",
      startDate: startFormatted,
      endDate: endFormatted,
      description: exp.description || ""
    });
    setErrorMsg("");
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent, addMore = false) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const payload = {
      position: form.position,
      company: form.company,
      location: form.location || undefined,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      description: form.description,
    };

    const res = editingId 
      ? await updateExperience(editingId, payload)
      : await createExperience(payload);

    setLoading(false);
    if (res.success) {
      toast(editingId ? "Pengalaman kerja berhasil diubah!" : "Pengalaman kerja berhasil disimpan!", "success");
      setForm({ position: "", company: "", location: "", startDate: "", endDate: "", description: "" });
      
      if (!addMore) {
        setOpen(false);
        setEditingId(null);
      } else {
        toast("Silakan tambahkan pengalaman berikutnya.", "info");
      }
      loadExperiences();
    } else {
      setErrorMsg("Gagal menyimpan ke database.");
      toast("Gagal menyimpan pengalaman kerja.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Riwayat Pengalaman Kerja?",
      message: "Apakah Anda yakin ingin menghapus data pengalaman kerja ini?",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger"
    });
    if (!isConfirmed) return;
    const res = await deleteExperience(id);
    if (res.success) {
      toast("Pengalaman kerja berhasil dihapus.", "success");
      loadExperiences();
    } else {
      toast("Gagal menghapus data.", "error");
    }
  };

  if (!mounted) return <PanelLoading />;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Manajemen Pengalaman Kerja</h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Atur riwayat pengalaman profesional Anda.</p>
        </div>
        <Button onClick={handleOpenCreate} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" /> Tambah Pengalaman
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Pengalaman Kerja" : "Tambah Pengalaman Kerja"}</DialogTitle>
              <DialogDescription className="text-gray-400">Isi detail riwayat pekerjaan Anda.</DialogDescription>
            </DialogHeader>
            {errorMsg && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-400 text-sm">{errorMsg}</div>}
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label style={{ color: "var(--text-primary)" }}>Posisi / Jabatan</Label>
                  <Input required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Frontend Developer"  />
                </div>
                <div className="grid gap-2">
                  <Label style={{ color: "var(--text-primary)" }}>Nama Perusahaan</Label>
                  <Input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="PT. ABC Indonesia"  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label style={{ color: "var(--text-primary)" }}>Lokasi (Opsional)</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Jakarta, Indonesia"  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label style={{ color: "var(--text-primary)" }}>Tanggal Mulai</Label>
                  <Input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}  />
                </div>
                <div className="grid gap-2">
                  <Label style={{ color: "var(--text-primary)" }}>Tanggal Selesai</Label>
                  <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label style={{ color: "var(--text-primary)" }}>Deskripsi Pekerjaan</Label>
                <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="flex min-h-[100px] w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2" style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                  placeholder="Jelaskan tanggung jawab dan pencapaian Anda..." />
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditingId(null); }} className="btn-outline">Batal</Button>
              {!editingId && (
                <Button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading} className="border transition-colors font-medium" style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                  {loading ? "Menyimpan..." : "Simpan & Tambah Lagi"}
                </Button>
              )}
              <Button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Simpan")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {fetching ? (
        <LoadingSpinner message="Mengambil data pengalaman..." />
      ) : experiences.length === 0 ? (
        <Card className="panel shadow-sm hover:shadow-md transition-all">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Briefcase className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Belum ada Pengalaman Kerja</h3>
            <p style={{ color: "var(--text-muted)" }}>Klik tombol "+ Tambah Pengalaman" untuk mulai menambahkan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experiences.map((exp) => (
            <Card key={exp.id} className="panel shadow-sm hover:shadow-md transition-all hover:border-zinc-700 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{exp.position}</h3>
                    <p className="text-sm font-medium mt-1" style={{ color: "var(--text-secondary)" }}>{exp.company}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(exp)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800" style={{ color: "var(--text-secondary)" }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(exp.id)} className="hover:bg-red-500/10 text-red-500 ml-2 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {exp.location && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{exp.location}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(exp.startDate).toLocaleDateString("id-ID", { year: "numeric", month: "short" })}
                    {" — "}
                    {exp.endDate ? new Date(exp.endDate).toLocaleDateString("id-ID", { year: "numeric", month: "short" }) : "Sekarang"}
                  </span>
                </div>
                <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "var(--text-muted)" }}>{exp.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
