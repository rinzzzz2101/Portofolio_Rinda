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
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Manajemen Projects</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Atur dan tambahkan portfolio project Anda di sini.</p>
        </div>
        <Button onClick={handleOpenCreate} className="btn-primary px-5 py-2.5 shadow-md flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Project
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[620px] overflow-y-auto max-h-[90vh]">
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Project" : "Buat Project Baru"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Ubah rincian data project Anda di bawah ini." : "Isi form di bawah ini untuk menambahkan project baru ke portofolio."}
              </DialogDescription>
            </DialogHeader>
            {errorMsg && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">{errorMsg}</div>}
            <div className="grid gap-4 py-4">
              <div className="grid gap-1.5">
                <Label htmlFor="title" style={{ color: 'var(--text-primary)' }}>Judul Project</Label>
                <Input id="title" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Misal: E-commerce Web App" />
              </div>
              <div className="grid gap-1.5">
                <Label style={{ color: 'var(--text-primary)' }}>Deskripsi</Label>
                <textarea 
                  required 
                  value={formData.desc} 
                  onChange={(e) => setFormData({...formData, desc: e.target.value})}
                  className="flex min-h-[100px] w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2"
                  style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  placeholder="Ceritakan gambaran dan fitur utama dari project ini..." 
                />
              </div>
              <div className="grid gap-1.5">
                <Label style={{ color: 'var(--text-primary)' }}>Foto / Thumbnail Project</Label>
                <Input type="file" accept="image/*" onChange={handleFileChange} />
                {formData.thumbnail && (
                  <div className="mt-2 rounded-lg border overflow-hidden p-2 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)' }}>
                    <img src={formData.thumbnail} alt="Preview" className="max-h-[180px] w-auto object-contain rounded" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label style={{ color: 'var(--text-primary)' }}>Kategori</Label>
                  <Input required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="Web App, Mobile, Design, Fullstack..." />
                </div>
                <div className="grid gap-1.5">
                  <Label style={{ color: 'var(--text-primary)' }}>Teknologi (pisahkan dgn koma)</Label>
                  <Input required value={formData.tech} onChange={(e) => setFormData({...formData, tech: e.target.value})} placeholder="Next.js, TypeScript, Tailwind" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label style={{ color: 'var(--text-primary)' }}>GitHub URL (Opsional)</Label>
                  <Input value={formData.githubUrl} onChange={(e) => setFormData({...formData, githubUrl: e.target.value})} placeholder="https://github.com/..." />
                </div>
                <div className="grid gap-1.5">
                  <Label style={{ color: 'var(--text-primary)' }}>Live Demo URL (Opsional)</Label>
                  <Input value={formData.demoUrl} onChange={(e) => setFormData({...formData, demoUrl: e.target.value})} placeholder="https://myproject.com" />
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditingId(null); }} className="btn-outline">
                Batal
              </Button>
              {!editingId && (
                <Button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, true)} 
                  disabled={loading} 
                  className="border transition-colors font-medium"
                  style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                >
                  {loading ? "Menyimpan..." : "Simpan & Tambah Lagi"}
                </Button>
              )}
              <Button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Simpan Project")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {fetching ? (
        <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>Memuat data project...</div>
      ) : projects.length === 0 ? (
        <Card className="panel mt-8">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <FolderKanban className="w-16 h-16 mb-4" style={{ color: 'var(--text-dim)' }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Belum ada project</h3>
            <p className="max-w-sm text-sm" style={{ color: 'var(--text-muted)' }}>Anda belum menambahkan project apapun. Klik tombol di atas untuk mulai membuat.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {projects.map((project) => (
            <Card key={project.id} className="panel flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div>
                <div className="h-48 flex items-center justify-center border-b overflow-hidden" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)' }}>
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-12 h-12" style={{ color: 'var(--text-dim)' }} />
                  )}
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="tag">{project.category}</span>
                      <h3 className="text-xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{project.title}</h3>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(project)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800" style={{ color: 'var(--text-secondary)' }}><Edit2 className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(project.id)} className="p-2 hover:bg-red-500/10 text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <p className="text-sm line-clamp-3" style={{ color: 'var(--text-muted)' }}>{project.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.technologies.map((tech: string) => (
                      <span key={tech} className="badge-muted">{tech}</span>
                    ))}
                  </div>
                </CardContent>
              </div>
              <div className="border-t p-4 flex gap-2" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)' }}>
                {project.githubUrl && (
                  <Button size="sm" variant="outline" className="w-full btn-outline" asChild>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"><Github className="w-4 h-4 mr-2" /> GitHub</a>
                  </Button>
                )}
                {project.demoUrl && (
                  <Button size="sm" variant="outline" className="w-full btn-outline" asChild>
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
