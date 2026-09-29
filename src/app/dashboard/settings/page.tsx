"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Save, CheckCircle2, Trash2, KeyRound, Eye, EyeOff, ShieldCheck, X } from "lucide-react";
import { getSettings, saveSettings } from "@/actions/settings";
import { getSocialLinks, createSocialLink, deleteSocialLink } from "@/actions/socials";
import { useToast } from "@/components/ui/toast-provider";
import { PanelLoading } from "@/components/ui/loading";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    siteTitle: "",
    faviconUrl: "",
    name: "",
    role: "",
    hireStatus: "",
    description: "",
    about: "",
    email: "",
    phone: "",
    location: "",
    github: "",
    linkedin: "",
    instagram: "",
    twitter: "",
    cvUrl: "",
    cvFileName: "",
    cvActive: true,
    socialActive: true,
    overviewActive: true,
    projectsActive: true,
    skillsActive: true,
    experienceActive: true,
    educationActive: true,
    organizationsActive: true,
    certificatesActive: true,
    blogsActive: true,
    messagesActive: true,
  });

  const [socials, setSocials] = useState<any[]>([]);
  const [newSocial, setNewSocial] = useState({ platform: "Github", url: "" });

  // State untuk modal Ganti Sandi
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const getStoredPassword = () => {
    if (typeof window === "undefined") return "12345678";
    return localStorage.getItem("admin_password") || "12345678";
  };

  const handleChangePassword = () => {
    const storedPassword = getStoredPassword();
    if (!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm) {
      toast("Semua field harus diisi!", "error");
      return;
    }
    if (passwordForm.current !== storedPassword) {
      toast("Sandi saat ini tidak sesuai!", "error");
      return;
    }
    if (passwordForm.newPass.length < 6) {
      toast("Sandi baru minimal 6 karakter!", "error");
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast("Konfirmasi sandi tidak cocok!", "error");
      return;
    }
    setPasswordLoading(true);
    setTimeout(() => {
      localStorage.setItem("admin_password", passwordForm.newPass);
      setPasswordLoading(false);
      setPasswordSaved(true);
      setPasswordForm({ current: "", newPass: "", confirm: "" });
      toast("Sandi berhasil diperbarui!", "success");
      setTimeout(() => {
        setPasswordSaved(false);
        setShowPasswordModal(false);
      }, 1500);
    }, 800);
  };

  const loadSocials = async () => {
    const res = await getSocialLinks();
    if (res.success) setSocials(res.data);
  };

  useEffect(() => {
    setMounted(true);
    // Load settings from DB
    getSettings().then((res) => {
      if (res.success && res.data) {
        setForm({
          siteTitle: res.data.siteTitle || "Portfolio.",
          faviconUrl: res.data.faviconUrl || "",
          name: res.data.name || "",
          role: res.data.role || "",
          hireStatus: res.data.hireStatus || "",
          description: res.data.description || "",
          about: res.data.about || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          location: res.data.location || "",
          github: res.data.github || "",
          linkedin: res.data.linkedin || "",
          instagram: res.data.instagram || "",
          twitter: res.data.twitter || "",
          cvUrl: res.data.cvUrl || "",
          cvFileName: res.data.cvFileName || "",
          cvActive: res.data.cvActive !== undefined ? res.data.cvActive : true,
          socialActive: res.data.socialActive !== undefined ? res.data.socialActive : true,
          overviewActive: res.data.overviewActive !== undefined ? res.data.overviewActive : true,
          projectsActive: res.data.projectsActive !== undefined ? res.data.projectsActive : true,
          skillsActive: res.data.skillsActive !== undefined ? res.data.skillsActive : true,
          experienceActive: res.data.experienceActive !== undefined ? res.data.experienceActive : true,
          educationActive: res.data.educationActive !== undefined ? res.data.educationActive : true,
          organizationsActive: res.data.organizationsActive !== undefined ? res.data.organizationsActive : true,
          certificatesActive: res.data.certificatesActive !== undefined ? res.data.certificatesActive : true,
          blogsActive: res.data.blogsActive !== undefined ? res.data.blogsActive : true,
          messagesActive: res.data.messagesActive !== undefined ? res.data.messagesActive : true,
        });
      }
    });
    loadSocials();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const res = await saveSettings(form);
    setLoading(false);
    if (res.success) {
      toast("Pengaturan berhasil disimpan!", "success");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Update favicon in dashboard too if changed
      if (form.faviconUrl && typeof document !== "undefined") {
        const existingLinks = document.querySelectorAll("link[rel~='icon']");
        existingLinks.forEach(el => el.parentNode?.removeChild(el));

        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = form.faviconUrl;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    } else {
      toast("Gagal menyimpan pengaturan.", "error");
    }
  };

  const handleAddSocial = async () => {
    if (!newSocial.url.trim()) {
      toast("URL tidak boleh kosong!", "error");
      return;
    }
    const res = await createSocialLink(newSocial);
    if (res.success) {
      toast("Sosial media berhasil ditambahkan!", "success");
      setNewSocial({ platform: "Github", url: "" });
      loadSocials();
    } else {
      toast("Gagal menambahkan sosial media.", "error");
    }
  };

  const handleRemoveSocial = async (id: string) => {
    const res = await deleteSocialLink(id);
    if (res.success) {
      toast("Sosial media berhasil dihapus!", "success");
      loadSocials();
    } else {
      toast("Gagal menghapus sosial media.", "error");
    }
  };

  if (!mounted) return <PanelLoading />;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan Profil</h1>
          <p className="text-gray-400 mt-2">Atur nama site, favicon, serta profil utama yang tampil di Landing Page.</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium flex items-center gap-2">
          {saved ? (
            <><CheckCircle2 className="w-4 h-4 text-green-400" /> Tersimpan!</>
          ) : (
            <><Save className="w-4 h-4" /> {loading ? "Menyimpan..." : "Simpan Pengaturan"}</>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="glass-card border-gray-800 text-white lg:col-span-2">
          <CardHeader>
            <CardTitle>Pengaturan Umum</CardTitle>
            <CardDescription className="text-gray-400">Atur judul situs dan ikon browser Anda.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="siteTitle">Site / Navbar Title</Label>
              <Input
                id="siteTitle"
                value={form.siteTitle}
                onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
                placeholder="Portfolio."
                className="bg-gray-900 border-gray-800"
              />
            </div>
            <div className="grid gap-2">
              <Label>Favicon (.ico, .png, .jpg)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  className="bg-gray-900 border-gray-800 file:text-white"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setForm({ ...form, faviconUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {form.faviconUrl && (
                  <div className="w-10 h-10 border border-gray-800 rounded-lg overflow-hidden bg-gray-950 flex items-center justify-center shrink-0">
                    <img src={form.faviconUrl} alt="Favicon Preview" className="w-6 h-6 object-contain" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Landing Page Section Visibility */}
        <Card className="glass-card border-gray-800 text-white lg:col-span-2">
          <CardHeader>
            <CardTitle>Visibilitas Modul Landing Page</CardTitle>
            <CardDescription className="text-gray-400">Aktifkan atau nonaktifkan modul/bagian yang ingin ditampilkan di Landing Page.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <VisibilityToggle id="overviewActive" label="Overview (Hero & Tentang Saya)" checked={form.overviewActive} onChange={(val) => setForm({ ...form, overviewActive: val })} />
            <VisibilityToggle id="projectsActive" label="Projects (Proyek)" checked={form.projectsActive} onChange={(val) => setForm({ ...form, projectsActive: val })} />
            <VisibilityToggle id="skillsActive" label="Skills (Keahlian)" checked={form.skillsActive} onChange={(val) => setForm({ ...form, skillsActive: val })} />
            <VisibilityToggle id="experienceActive" label="Pengalaman Kerja" checked={form.experienceActive} onChange={(val) => setForm({ ...form, experienceActive: val })} />
            <VisibilityToggle id="educationActive" label="Pendidikan" checked={form.educationActive} onChange={(val) => setForm({ ...form, educationActive: val })} />
            <VisibilityToggle id="organizationsActive" label="Organisasi" checked={form.organizationsActive} onChange={(val) => setForm({ ...form, organizationsActive: val })} />
            <VisibilityToggle id="certificatesActive" label="Sertifikat & Penghargaan" checked={form.certificatesActive} onChange={(val) => setForm({ ...form, certificatesActive: val })} />
            <VisibilityToggle id="blogsActive" label="Blogs (Artikel)" checked={form.blogsActive} onChange={(val) => setForm({ ...form, blogsActive: val })} />
            <VisibilityToggle id="messagesActive" label="Messages (Form Kontak)" checked={form.messagesActive} onChange={(val) => setForm({ ...form, messagesActive: val })} />
          </CardContent>
        </Card>

        {/* Hero Section */}
        <Card className="glass-card border-gray-800 text-white">
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription className="text-gray-400">Data yang tampil di bagian paling atas website.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Nama Lengkap</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rinda Dev" className="bg-gray-900 border-gray-800" />
            </div>
            <div className="grid gap-2">
              <Label>Jabatan / Profesi</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Full Stack Developer" className="bg-gray-900 border-gray-800" />
            </div>
            <div className="grid gap-2">
              <Label>Status Tersedia (Opsional)</Label>
              <Input value={form.hireStatus} onChange={(e) => setForm({ ...form, hireStatus: e.target.value })} placeholder="Contoh: Available for hire" className="bg-gray-900 border-gray-800" />
              <p className="text-xs text-gray-500">Jika dikosongkan, label ini tidak akan muncul di halaman depan.</p>
            </div>
            <div className="grid gap-2">
              <Label>Deskripsi Singkat (Hero)</Label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="flex min-h-[80px] w-full rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-550"
                placeholder="Saya fokus membangun aplikasi web modern..." />
            </div>
          </CardContent>
        </Card>

        {/* About Me */}
        <Card className="glass-card border-gray-800 text-white">
          <CardHeader>
            <CardTitle>Tentang Saya</CardTitle>
            <CardDescription className="text-gray-400">Data yang tampil di section About Me.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Deskripsi About Me</Label>
              <textarea value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })}
                className="flex min-h-[80px] w-full rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-550"
                placeholder="Ceritakan tentang diri Anda secara lengkap..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="rinda@example.com" className="bg-gray-900 border-gray-800" />
              </div>
              <div className="grid gap-2">
                <Label>No. HP / WhatsApp</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+62812..." className="bg-gray-900 border-gray-800" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Lokasi</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Jakarta, Indonesia" className="bg-gray-900 border-gray-800" />
            </div>
          </CardContent>
        </Card>

        {/* CV Upload */}
        <Card className="glass-card border-gray-800 text-white">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>CV / Resume</CardTitle>
                <CardDescription className="text-gray-400">Upload CV atau tempel link Google Drive / Dropbox.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="cvActive" 
                  checked={form.cvActive} 
                  onChange={(e) => setForm({ ...form, cvActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-850 bg-gray-900 accent-zinc-100 focus:ring-zinc-500 cursor-pointer"
                />
                <Label htmlFor="cvActive" className="text-sm font-medium cursor-pointer">Aktifkan</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label>Upload CV (PDF)</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                className="bg-gray-900 border-gray-800 file:text-white"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setForm({ ...form, cvUrl: reader.result as string, cvFileName: file.name });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {form.cvFileName && (
                <p className="text-xs text-zinc-400 font-medium">✓ File: {form.cvFileName}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Atau Link URL (Google Drive / Dropbox)</Label>
              <Input
                value={form.cvUrl && !form.cvUrl.startsWith("data:") ? form.cvUrl : ""}
                onChange={(e) => setForm({ ...form, cvUrl: e.target.value, cvFileName: e.target.value ? "Link Eksternal" : "" })}
                placeholder="https://drive.google.com/..."
                className="bg-gray-900 border-gray-800"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media Card */}
        <Card className="glass-card border-gray-800 text-white">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Social Media</CardTitle>
                <CardDescription className="text-gray-400">Kelola link sosial media Anda.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="socialActive" 
                  checked={form.socialActive} 
                  onChange={(e) => setForm({ ...form, socialActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-850 bg-gray-900 accent-zinc-100 focus:ring-zinc-500 cursor-pointer"
                />
                <Label htmlFor="socialActive" className="text-sm font-medium cursor-pointer">Aktifkan</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Form Tambah Link */}
            <div className="p-3 border border-gray-800 bg-gray-950/40 rounded-xl space-y-3">
              <p className="text-xs font-semibold text-zinc-405">Tambah Link Baru</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-gray-400">Platform</Label>
                  <select 
                    value={newSocial.platform} 
                    onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
                    className="w-full h-9 rounded-md border border-gray-800 bg-gray-900 px-3 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  >
                    <option value="Github">Github</option>
                    <option value="Linkedin">Linkedin</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Twitter">Twitter / X</option>
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Website">Website Lainnya</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-gray-400">URL Link</Label>
                  <Input 
                    value={newSocial.url} 
                    onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                    placeholder="https://..." 
                    className="h-9 text-xs bg-gray-900 border-gray-800"
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddSocial} 
                size="sm" 
                className="w-full text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium h-8"
              >
                + Tambah Sosial Media
              </Button>
            </div>

            {/* List Link Yang Ada */}
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              <Label className="text-xs font-medium text-gray-400">Daftar Link Aktif (Tanpa Batas)</Label>
              {socials.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-2">Belum ada link sosial media.</p>
              ) : (
                socials.map((link) => (
                  <div key={link.id} className="flex justify-between items-center p-2 rounded-lg bg-gray-900/60 border border-gray-800 text-xs">
                    <div className="truncate max-w-[70%]">
                      <span className="font-semibold text-zinc-400 mr-2">{link.platform}</span>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white underline truncate max-w-[150px] inline-block align-middle">
                        {link.url}
                      </a>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleRemoveSocial(link.id)} 
                      className="h-6 px-2 hover:bg-red-500/10 text-red-400 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Keamanan Akun — Ganti Sandi */}
        <Card className="glass-card border-gray-800 text-white lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Keamanan Akun
                </CardTitle>
                <CardDescription className="text-gray-400 mt-1">Kelola kata sandi untuk masuk ke dashboard admin.</CardDescription>
              </div>
              <Button
                type="button"
                onClick={() => {
                  setPasswordForm({ current: "", newPass: "", confirm: "" });
                  setPasswordSaved(false);
                  setShowPasswordModal(true);
                }}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white flex items-center gap-2 text-sm"
              >
                <KeyRound className="w-4 h-4 text-emerald-400" />
                Ganti Sandi
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Kata Sandi Admin</p>
                <p className="text-xs text-zinc-500 mt-0.5">Klik tombol <span className="text-zinc-300 font-medium">Ganti Sandi</span> untuk memperbarui kata sandi login.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== MODAL GANTI SANDI ===== */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPasswordModal(false); }}
        >
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Ganti Kata Sandi</h2>
                  <p className="text-xs text-zinc-500">Perbarui sandi akun admin Anda</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Sandi Saat Ini */}
              <div className="space-y-1.5">
                <Label htmlFor="currentPass" className="text-sm text-zinc-300">Sandi Saat Ini</Label>
                <div className="relative">
                  <Input
                    id="currentPass"
                    type={showCurrent ? "text" : "password"}
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    placeholder="Masukkan sandi saat ini"
                    className="bg-zinc-800 border-zinc-700 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sandi Baru */}
              <div className="space-y-1.5">
                <Label htmlFor="newPass" className="text-sm text-zinc-300">Sandi Baru</Label>
                <div className="relative">
                  <Input
                    id="newPass"
                    type={showNew ? "text" : "password"}
                    value={passwordForm.newPass}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="bg-zinc-800 border-zinc-700 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.newPass.length > 0 && passwordForm.newPass.length < 6 && (
                  <p className="text-xs text-red-400">Sandi harus minimal 6 karakter</p>
                )}
              </div>

              {/* Konfirmasi Sandi */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPass" className="text-sm text-zinc-300">Konfirmasi Sandi Baru</Label>
                <div className="relative">
                  <Input
                    id="confirmPass"
                    type={showConfirm ? "text" : "password"}
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    placeholder="Ulangi sandi baru"
                    className="bg-zinc-800 border-zinc-700 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.confirm.length > 0 && passwordForm.newPass !== passwordForm.confirm && (
                  <p className="text-xs text-red-400">Konfirmasi sandi tidak cocok</p>
                )}
                {passwordForm.confirm.length > 0 && passwordForm.newPass === passwordForm.confirm && passwordForm.newPass.length >= 6 && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Sandi cocok</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleChangePassword}
                disabled={passwordLoading || passwordSaved}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                {passwordSaved ? (
                  <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Tersimpan!</>
                ) : passwordLoading ? (
                  "Menyimpan..."
                ) : (
                  <><KeyRound className="w-4 h-4 mr-1.5" /> Simpan Sandi</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VisibilityToggle({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-xl bg-zinc-950/40 hover:border-zinc-700/60 transition-all">
      <Label htmlFor={id} className="text-sm font-medium cursor-pointer select-none text-zinc-300">{label}</Label>
      <input 
        type="checkbox" 
        id={id} 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-850 bg-gray-900 accent-zinc-100 focus:ring-zinc-500 cursor-pointer"
      />
    </div>
  );
}
