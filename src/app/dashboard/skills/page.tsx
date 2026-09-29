"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Code2, Trash2, Edit2, Brain, Cpu } from "lucide-react";
import { createSkill, getSkills, deleteSkill, updateSkill } from "@/actions/skills";
import { useToast } from "@/components/ui/toast-provider";
import { useConfirm } from "@/components/ui/confirm-provider";
import { PanelLoading, LoadingSpinner } from "@/components/ui/loading";

const SKILL_TYPES = ["Hard Skill", "Soft Skill"] as const;
type SkillType = typeof SKILL_TYPES[number];

export default function AdminSkillsPage() {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [skills, setSkills] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeFilter, setActiveFilter] = useState<SkillType | "Semua">("Semua");
  
  const [form, setForm] = useState({
    name: "",
    level: "80",
    category: "Hard Skill",
  });

  const loadSkills = async () => {
    setFetching(true);
    const res = await getSkills();
    if (res.success) setSkills(res.data);
    setFetching(false);
  };

  useEffect(() => {
    setMounted(true);
    loadSkills();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ name: "", level: "80", category: "Hard Skill" });
    setErrorMsg("");
    setOpen(true);
  };

  const handleOpenEdit = (skill: any) => {
    setEditingId(skill.id);
    setForm({
      name: skill.name,
      level: skill.level.toString(),
      category: skill.category,
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
      level: parseInt(form.level),
      category: form.category,
    };

    const res = editingId 
      ? await updateSkill(editingId, payload)
      : await createSkill(payload);

    setLoading(false);
    if (res.success) {
      toast(editingId ? "Skill berhasil diubah!" : "Skill berhasil disimpan!", "success");
      setForm({ name: "", level: "80", category: "Hard Skill" });
      
      if (!addMore) {
        setOpen(false);
        setEditingId(null);
      } else {
        toast("Silakan tambahkan skill berikutnya.", "info");
      }
      loadSkills();
    } else {
      setErrorMsg("Gagal menyimpan ke database.");
      toast("Gagal menyimpan skill.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Keahlian?",
      message: "Apakah Anda yakin ingin menghapus keahlian ini?",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger"
    });
    if (!isConfirmed) return;
    const res = await deleteSkill(id);
    if (res.success) {
      toast("Skill berhasil dihapus.", "success");
      loadSkills();
    } else {
      toast("Gagal menghapus skill.", "error");
    }
  };

  const filteredSkills = activeFilter === "Semua"
    ? skills
    : skills.filter((s) => s.category === activeFilter);

  const hardCount = skills.filter((s) => s.category === "Hard Skill").length;
  const softCount = skills.filter((s) => s.category === "Soft Skill").length;

  if (!mounted) return <PanelLoading />;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Manajemen Skills</h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Atur Hard Skill dan Soft Skill Anda di sini.</p>
        </div>
        <Button onClick={handleOpenCreate} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" /> Tambah Skill
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Skill" : "Tambah Skill Baru"}</DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingId ? "Ubah nama atau level keahlian Anda." : "Pilih tipe skill dan tambahkan nama beserta tingkat keahlian Anda."}
              </DialogDescription>
            </DialogHeader>
            {errorMsg && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-400 text-sm">{errorMsg}</div>
            )}
            <div className="grid gap-4 py-4">
              {/* Tipe Skill Toggle */}
              <div className="grid gap-2">
                <Label style={{ color: "var(--text-primary)" }}>Tipe Skill</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SKILL_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, category: type })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all text-sm font-medium ${
                        form.category === type
                          ? type === "Hard Skill"
                            ? "bg-zinc-800 border-zinc-700 text-zinc-100"
                            : "bg-zinc-900/60 border-zinc-800 text-zinc-300"
                          : "border-gray-800 text-gray-450 hover:bg-gray-900 hover:text-white"
                      }`}
                    >
                      {type === "Hard Skill" ? <Cpu className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label style={{ color: "var(--text-primary)" }}>Nama Skill</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={form.category === "Hard Skill" ? "React.js, Python, Figma..." : "Komunikasi, Kepemimpinan..."}
                  
                />
              </div>

              <div className="grid gap-2">
                <Label style={{ color: "var(--text-primary)" }}>
                  Level Keahlian{" "}
                  <span className={form.category === "Hard Skill" ? "text-zinc-200" : "text-zinc-400"}>
                    {form.level}%
                  </span>
                </Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className={`w-full accent-zinc-100`}
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Pemula</span><span>Menengah</span><span>Mahir</span>
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditingId(null); }} className="btn-outline">
                Batal
              </Button>
              {!editingId && (
                <Button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading} className="border transition-colors font-medium" style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                  {loading ? "Menyimpan..." : "Simpan & Tambah Lagi"}
                </Button>
              )}
              <Button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Simpan Skill")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(["Semua", "Hard Skill", "Soft Skill"] as const).map((filter) => {
          const count = filter === "Semua" ? skills.length : filter === "Hard Skill" ? hardCount : softCount;
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                isActive
                  ? "bg-zinc-800 border-zinc-700 text-zinc-100"
                  : "border-gray-800 text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              {filter === "Hard Skill" && <Cpu className="w-4 h-4" />}
              {filter === "Soft Skill" && <Brain className="w-4 h-4" />}
              {filter}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/10" : "bg-gray-800"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Skills List */}
      {fetching ? (
        <LoadingSpinner message="Mengambil data keahlian..." />
      ) : filteredSkills.length === 0 ? (
        <Card className="panel shadow-sm hover:shadow-md transition-all">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Code2 className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Belum ada Skill</h3>
            <p className="text-gray-400">Klik tombol "+ Tambah Skill" untuk mulai menambahkan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSkills.map((skill) => (
            <Card key={skill.id} className="panel p-5 transition-all shadow-sm hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${skill.category === "Hard Skill" ? "bg-zinc-800 border border-zinc-700" : "bg-zinc-900 border border-zinc-800"}`}>
                      {skill.category === "Hard Skill"
                        ? <Cpu className="w-4 h-4 text-zinc-300" />
                        : <Brain className="w-4 h-4 text-zinc-400" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-white">{skill.name}</p>
                      <span className={`text-xs font-medium ${skill.category === "Hard Skill" ? "text-zinc-350" : "text-zinc-400"}`}>
                        {skill.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-bold mr-2 ${skill.category === "Hard Skill" ? "text-zinc-300" : "text-zinc-450"}`}>
                      {skill.level}%
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(skill)} className="hover:bg-gray-800 text-gray-300 h-8 w-8 p-0">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(skill.id)} className="hover:bg-red-500/10 text-red-400 h-8 w-8 p-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${skill.category === "Hard Skill" ? "bg-zinc-300" : "bg-zinc-650"}`}
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
