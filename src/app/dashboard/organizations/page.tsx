"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Users, Trash2, Edit2 } from "lucide-react";
import { createOrganization, getOrganizations, deleteOrganization, updateOrganization } from "@/actions/organizations";
import { useToast } from "@/components/ui/toast-provider";
import { useConfirm } from "@/components/ui/confirm-provider";
import { PanelLoading, LoadingSpinner } from "@/components/ui/loading";

export default function AdminOrganizationsPage() {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [form, setForm] = useState({
    name: "", role: "", startDate: "", endDate: "", description: ""
  });

  const loadOrganizations = async () => {
    setFetching(true);
    const res = await getOrganizations();
    if (res.success) setOrganizations(res.data);
    setFetching(false);
  };

  useEffect(() => {
    setMounted(true);
    loadOrganizations();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ name: "", role: "", startDate: "", endDate: "", description: "" });
    setErrorMsg("");
    setOpen(true);
  };

  const handleOpenEdit = (org: any) => {
    setEditingId(org.id);
    const startYear = org.startDate ? new Date(org.startDate).getFullYear().toString() : "";
    const endYear = org.endDate ? new Date(org.endDate).getFullYear().toString() : "";
    setForm({
      name: org.name,
      role: org.role,
      startDate: startYear,
      endDate: endYear,
      description: org.description || ""
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
      role: form.role,
      startDate: form.startDate ? `${form.startDate}-01-01` : "",
      endDate: form.endDate ? `${form.endDate}-12-31` : undefined,
      description: form.description || undefined
    };

    const res = editingId 
      ? await updateOrganization(editingId, payload)
      : await createOrganization(payload);

    setLoading(false);
    if (res.success) {
      toast(editingId ? "Organisasi berhasil diubah!" : "Organisasi berhasil disimpan!", "success");
      setForm({ name: "", role: "", startDate: "", endDate: "", description: "" });
      
      if (!addMore) {
        setOpen(false);
        setEditingId(null);
      } else {
        toast("Silakan tambahkan data organisasi berikutnya.", "info");
      }
      loadOrganizations();
    } else {
      setErrorMsg("Gagal menyimpan. Pastikan database sudah terkoneksi.");
      toast("Gagal menyimpan data organisasi.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Riwayat Organisasi?",
      message: "Apakah Anda yakin ingin menghapus data organisasi ini?",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger"
    });
    if (!isConfirmed) return;
    const res = await deleteOrganization(id);
    if (res.success) {
      toast("Organisasi berhasil dihapus.", "success");
      loadOrganizations();
    } else {
      toast("Gagal menghapus data organisasi.", "error");
    }
  };

  if (!mounted) return <PanelLoading />;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Manajemen Organisasi</h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Atur riwayat pengalaman berorganisasi Anda.</p>
        </div>
        
        <Button onClick={handleOpenCreate} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" /> Tambah Organisasi
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Riwayat Organisasi" : "Tambah Riwayat Organisasi"}</DialogTitle>
              <DialogDescription className="text-muted-foreground">Masukkan detail organisasi Anda.</DialogDescription>
            </DialogHeader>
            {errorMsg && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-400 text-sm">{errorMsg}</div>}
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label style={{ color: "var(--text-primary)" }}>Nama Organisasi</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Senat Mahasiswa, Komunitas Dev..."  />
              </div>
              <div className="grid gap-2">
                <Label style={{ color: "var(--text-primary)" }}>Jabatan / Peran</Label>
                <Input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ketua, Hubungan Masyarakat, Anggota..."  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label style={{ color: "var(--text-primary)" }}>Tahun Masuk</Label>
                  <Input
                    type="number"
                    required
                    min="1900"
                    max={new Date().getFullYear()}
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    placeholder={new Date().getFullYear().toString()}
                    
                  />
                </div>
                <div className="grid gap-2">
                  <Label style={{ color: "var(--text-primary)" }}>Tahun Selesai (Opsional)</Label>
                  <Input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 10}
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    placeholder="Kosongkan jika masih aktif"
                    
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label style={{ color: "var(--text-primary)" }}>Keterangan / Deskripsi (Opsional)</Label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2" style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                  placeholder="Deskripsi tugas, pencapaian program kerja..." />
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
        <LoadingSpinner message="Mengambil data organisasi..." />
      ) : organizations.length === 0 ? (
        <Card className="panel shadow-sm hover:shadow-md transition-all">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">Belum ada Riwayat Organisasi</h3>
            <p style={{ color: "var(--text-muted)" }}>Klik tombol "+ Tambah Organisasi" untuk mulai menambahkan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {organizations.map((org) => (
            <Card key={org.id} className="panel shadow-sm hover:shadow-md transition-all hover:border-border transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{org.name}</h3>
                    <p className="text-sm font-medium mt-1" style={{ color: "var(--text-secondary)" }}>
                      {org.role}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {new Date(org.startDate).getFullYear()} — {org.endDate ? new Date(org.endDate).getFullYear() : "Sekarang"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(org)} className="p-2 hover:bg-zinc-200 dark:hover:bg-muted" style={{ color: "var(--text-secondary)" }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(org.id)} className="hover:bg-red-500/10 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {org.description && <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{org.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
