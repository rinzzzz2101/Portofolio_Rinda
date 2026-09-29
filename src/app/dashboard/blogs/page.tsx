"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, FileText, Trash2, Edit2, Tag, Calendar, Eye, EyeOff } from "lucide-react";
import { createBlog, getBlogs, deleteBlog, updateBlog } from "@/actions/blogs";
import { useToast } from "@/components/ui/toast-provider";
import { useConfirm } from "@/components/ui/confirm-provider";
import { PanelLoading, LoadingSpinner } from "@/components/ui/loading";

export default function AdminBlogsPage() {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [blogs, setBlogs] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", content: "", category: "", tags: "", isPublished: false });

  const loadBlogs = async () => {
    setFetching(true);
    const res = await getBlogs();
    if (res.success) setBlogs(res.data);
    setFetching(false);
  };

  useEffect(() => {
    setMounted(true);
    loadBlogs();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ title: "", content: "", category: "", tags: "", isPublished: false });
    setErrorMsg("");
    setOpen(true);
  };

  const handleOpenEdit = (blog: any) => {
    setEditingId(blog.id);
    setForm({
      title: blog.title,
      content: blog.content,
      category: blog.category,
      tags: blog.tags || "",
      isPublished: blog.isPublished || false
    });
    setErrorMsg("");
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent, addMore = false) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const payload = {
      title: form.title,
      content: form.content,
      category: form.category,
      tags: form.tags || undefined,
      isPublished: form.isPublished
    };

    const res = editingId 
      ? await updateBlog(editingId, payload)
      : await createBlog(payload);

    setLoading(false);
    if (res.success) {
      toast(editingId ? "Artikel berhasil diubah!" : "Artikel berhasil disimpan!", "success");
      setForm({ title: "", content: "", category: "", tags: "", isPublished: false });
      
      if (!addMore) {
        setOpen(false);
        setEditingId(null);
      } else {
        toast("Silakan tambahkan artikel berikutnya.", "info");
      }
      loadBlogs();
    } else {
      setErrorMsg("Gagal menyimpan. Pastikan database sudah terkoneksi.");
      toast("Gagal menyimpan artikel.", "error");
    }
  };

  const togglePublishStatus = async (blog: any) => {
    const newStatus = !blog.isPublished;
    const res = await updateBlog(blog.id, {
      title: blog.title,
      content: blog.content,
      category: blog.category,
      tags: blog.tags || undefined,
      isPublished: newStatus
    });
    if (res.success) {
      toast(newStatus ? "Artikel berhasil dipublikasikan!" : "Artikel dikembalikan ke draft.", "success");
      loadBlogs();
    } else {
      toast("Gagal mengubah status publikasi.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Artikel?",
      message: "Apakah Anda yakin ingin menghapus artikel ini secara permanen?",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger"
    });
    if (!isConfirmed) return;
    const res = await deleteBlog(id);
    if (res.success) {
      toast("Artikel berhasil dihapus.", "success");
      loadBlogs();
    } else {
      toast("Gagal menghapus artikel.", "error");
    }
  };

  if (!mounted) return <PanelLoading />;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Manajemen Blog</h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Tulis artikel dan bagikan pengetahuan Anda.</p>
        </div>
        <Button onClick={handleOpenCreate} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" /> Tulis Artikel
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Artikel" : "Tulis Artikel Baru"}</DialogTitle>
              <DialogDescription className="text-gray-400">Tulis dan atur detail artikel blog Anda.</DialogDescription>
            </DialogHeader>
            {errorMsg && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-400 text-sm">{errorMsg}</div>}
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label style={{ color: "var(--text-primary)" }}>Judul Artikel</Label>
                <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Cara Membangun Portfolio Modern"  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label style={{ color: "var(--text-primary)" }}>Kategori</Label>
                  <Input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Tutorial, Tips, Review..."  />
                </div>
                <div className="grid gap-2">
                  <Label style={{ color: "var(--text-primary)" }}>Tags (pisahkan dgn koma)</Label>
                  <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="nextjs, react, web"  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label style={{ color: "var(--text-primary)" }}>Konten (Markdown)</Label>
                <textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="flex min-h-[200px] w-full rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-550"
                  placeholder={"# Judul\n\nTulis konten artikel Anda di sini menggunakan format Markdown..."} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="isPublished"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-800 bg-gray-900 accent-zinc-100 focus:ring-zinc-500"
                />
                <Label htmlFor="isPublished" className="cursor-pointer" style={{ color: "var(--text-primary)" }}>Publikasikan Langsung (Published)</Label>
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
                {loading ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Simpan Artikel")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {fetching ? (
        <LoadingSpinner message="Mengambil data artikel..." />
      ) : blogs.length === 0 ? (
        <Card className="panel shadow-sm hover:shadow-md transition-all">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Belum ada Artikel</h3>
            <p className="text-gray-400">Klik tombol "+ Tulis Artikel" untuk mulai menulis.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map((blog) => (
            <Card key={blog.id} className="panel shadow-sm hover:shadow-md transition-all hover:border-zinc-700 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${blog.isPublished ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"}`}>
                        {blog.isPublished ? "Published" : "Draft"}
                      </span>
                      <span className="text-xs text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">
                        {blog.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-white leading-snug line-clamp-2">{blog.title}</h3>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => togglePublishStatus(blog)} className={`hover:bg-gray-800 ${blog.isPublished ? "text-green-400" : "text-gray-400"}`} title={blog.isPublished ? "Kembalikan ke Draft" : "Publikasikan"}>
                      {blog.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(blog)} className="hover:bg-gray-800 text-gray-300">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(blog.id)} className="hover:bg-red-500/10 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{blog.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(blog.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                  </span>
                  {blog.tags && (
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {blog.tags}
                    </span>
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
