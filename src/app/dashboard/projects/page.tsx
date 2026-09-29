"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, FolderKanban, Trash2, Edit2, Globe, Github, ImageIcon } from "lucide-react";
import { createProject, getProjects, deleteProject, updateProject } from "@/actions/projects";
import { useToast } from "@/components/ui/toast-provider";
import { useConfirm } from "@/components/ui/confirm-provider";
import { PanelLoading } from "@/components/ui/loading";

export default function AdminProjectsPage() {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "", desc: "", category: "", tech: "", githubUrl: "", demoUrl: "", thumbnail: ""
  });

  const fetchAllProjects = async () => {
    setFetching(true);
    const res = await getProjects();
    if (res.success) setProjects(res.data);
    setFetching(false);
  };

  useEffect(() => { setMounted(true); fetchAllProjects(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData((prev) => ({ ...prev, thumbnail: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ title: "", desc: "", category: "", tech: "", githubUrl: "", demoUrl: "", thumbnail: "" });
    setErrorMsg("");
    setOpen(true);
  };

  const handleOpenEdit = (project: any) => {
    setEditingId(project.id);
    setFormData({
      title: project.title, desc: project.description, category: project.category,
      tech: project.technologies.join(", "), githubUrl: project.githubUrl || "",
      demoUrl: project.demoUrl || "", thumbnail: project.thumbnail || ""
    });
    setErrorMsg("");
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent, addMore = false) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    const techArray = formData.tech.split(",").map(t => t.trim()).filter(Boolean);
    const payload = {
      title: formData.title, description: formData.desc, category: formData.category,
      technologies: techArray, githubUrl: formData.githubUrl || undefined,
      demoUrl: formData.demoUrl || undefined, thumbnail: formData.thumbnail || undefined
    };
    const res = editingId ? await updateProject(editingId, payload) : await createProject(payload);
    setLoading(false);
    if (res.success) {
      toast(editingId ? "Project berhasil diubah!" : "Project berhasil disimpan!", "success");
      setFormData({ title: "", desc: "", category: "", tech: "", githubUrl: "", demoUrl: "", thumbnail: "" });
      if (!addMore) {
        setOpen(false);
        setEditingId(null);
      } else {
        toast("Silakan tambahkan project berikutnya.", "info");
      }
      fetchAllProjects();
    } else {
      setErrorMsg("Gagal menyimpan ke database. Pastikan Laragon MySQL Anda aktif.");
      toast("Gagal menyimpan project ke database.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Project?",
      message: "Apakah Anda yakin ingin menghapus project ini secara permanen dari database?",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger"
    });
    if (!isConfirmed) return;
    const res = await deleteProject(id);
    if (res.success) {
      toast("Project berhasil dihapus.", "success");
      fetchAllProjects();
    } else {
      toast("Gagal menghapus project.", "error");
    }
  };

  if (!mounted) return <PanelLoading />;

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Projects</h1>
          <p className="text-gray-400 mt-2">Atur dan tambahkan portfolio project Anda di sini.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium">
          <Plus className="w-4 h-4 mr-2" /> Tambah Project
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[#0a0a0a] border-gray-800 text-white overflow-y-auto max-h-[90vh]">
          <form onSubmit={(e) => handleSubmit(e, false)}>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Project" : "Buat Project Baru"}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingId ? "Ubah data project Anda." : "Isi form untuk menambahkan project baru."}
                </DialogDescription>
              </DialogHeader>
              {errorMsg && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-400 text-sm">{errorMsg}</div>}
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Judul Project</Label>
                  <Input id="title" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="E-commerce App" className="bg-gray-900 border-gray-800" />
                </div>
                <div className="grid gap-2">
                  <Label>Deskripsi</Label>
                  <textarea required value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})}
                    className="flex min-h-[100px] w-full rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-550"
                    placeholder="Ceritakan tentang project ini..." />
                </div>
                <div className="grid gap-2">
                  <Label>Foto Project</Label>
                  <Input type="file" accept="image/*" onChange={handleFileChange} className="bg-gray-900 border-gray-800 file:text-white" />
                  {formData.thumbnail && (
                    <div className="mt-2 rounded-lg border border-gray-800 overflow-hidden bg-gray-900">
                      <img src={formData.thumbnail} alt="Preview" className="w-full object-contain max-h-[200px]" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Kategori</Label>
                    <Input required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="Web, Mobile, SaaS..." className="bg-gray-900 border-gray-800" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Teknologi (pisahkan dgn koma)</Label>
                    <Input required value={formData.tech} onChange={(e) => setFormData({...formData, tech: e.target.value})} placeholder="React, Node.js, Tailwind" className="bg-gray-900 border-gray-800" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Github URL (Opsional)</Label>
                    <Input value={formData.githubUrl} onChange={(e) => setFormData({...formData, githubUrl: e.target.value})} placeholder="https://github.com/..." className="bg-gray-900 border-gray-800" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Live Demo URL (Opsional)</Label>
                    <Input value={formData.demoUrl} onChange={(e) => setFormData({...formData, demoUrl: e.target.value})} placeholder="https://..." className="bg-gray-900 border-gray-800" />
                  </div>
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
                {loading ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Simpan Project")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {fetching ? (
        <div className="text-center py-20 text-gray-400">Memuat data project...</div>
      ) : projects.length === 0 ? (
        <Card className="glass-card border-gray-800 text-white mt-8">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <FolderKanban className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Belum ada project</h3>
            <p className="text-gray-400 max-w-sm">Anda belum menambahkan project apapun. Klik tombol di atas untuk mulai membuat.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {projects.map((project) => (
            <Card key={project.id} className="glass-card text-white border-gray-800 hover:border-zinc-700 transition-all flex flex-col justify-between overflow-hidden">
              <div>
                <div className="h-48 bg-gray-900 flex items-center justify-center border-b border-gray-800 overflow-hidden">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.title} className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-700" />
                  )}
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium">{project.category}</span>
                      <h3 className="text-xl font-bold mt-2">{project.title}</h3>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(project)} className="hover:bg-gray-800 text-gray-300"><Edit2 className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(project.id)} className="hover:bg-red-500/10 text-red-400"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-3">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.technologies.map((tech: string) => (
                      <span key={tech} className="text-xs px-2 py-0.5 bg-gray-800/50 text-gray-300 rounded border border-gray-700/50">{tech}</span>
                    ))}
                  </div>
                </CardContent>
              </div>
              <div className="border-t border-gray-800/50 p-4 bg-gray-950/20 flex gap-2">
                {project.githubUrl && (
                  <Button size="sm" variant="outline" className="w-full border-gray-800 text-gray-300 hover:bg-gray-900" asChild>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"><Github className="w-4 h-4 mr-2" /> GitHub</a>
                  </Button>
                )}
                {project.demoUrl && (
                  <Button size="sm" variant="outline" className="w-full border-gray-800 text-gray-300 hover:bg-gray-900" asChild>
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"><Globe className="w-4 h-4 mr-2" /> Demo</a>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
