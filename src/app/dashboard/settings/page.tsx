"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Save, CheckCircle2, Trash2, KeyRound, Eye, EyeOff, ShieldCheck, X, FileText, Image as ImageIcon, UploadCloud, ExternalLink } from "lucide-react";
import { getSettings, saveSettings } from "@/actions/settings";
import { getSocialLinks, createSocialLink, deleteSocialLink } from "@/actions/socials";
import { sendPasswordOtp, verifyPasswordOtp, updateAdminPassword } from "@/actions/auth";
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
  const [passwordStep, setPasswordStep] = useState<"request" | "verify" | "change">("request");
  const [otpCode, setOtpCode] = useState("");
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);


  const handleSendOtp = async () => {
    const targetEmail = form.email || "rinda.dev21@gmail.com";
    setPasswordLoading(true);
    try {
      const res = await sendPasswordOtp(targetEmail);
      if (res.success) {
        toast(res.message || "Kode OTP berhasil dikirim!", "success");
        setPasswordStep("verify");
      } else {
        toast(res.error || "Gagal mengirim OTP", "error");
      }
    } catch (err) {
      toast("Terjadi kesalahan sistem", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      toast("Harap masukkan kode OTP!", "error");
      return;
    }
    const targetEmail = form.email || "rinda.dev21@gmail.com";
    setPasswordLoading(true);
    try {
      const res = await verifyPasswordOtp(targetEmail, otpCode);
      if (res.success) {
        toast("Kode OTP diverifikasi!", "success");
        setPasswordStep("change");
      } else {
        toast(res.error || "Kode OTP salah", "error");
      }
    } catch (err) {
      toast("Terjadi kesalahan verifikasi", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.newPass || !passwordForm.confirm) {
      toast("Semua field harus diisi!", "error");
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
    try {
      const res = await updateAdminPassword(passwordForm.newPass);
      if (res.success) {
        localStorage.setItem("admin_password", passwordForm.newPass);
        setPasswordSaved(true);
        setPasswordForm({ current: "", newPass: "", confirm: "" });
        toast(res.message || "Sandi berhasil diperbarui dan disimpan permanen!", "success");
        setTimeout(() => {
          setPasswordSaved(false);
          setShowPasswordModal(false);
          setPasswordStep("request");
          setOtpCode("");
        }, 1500);
      } else {
        toast(res.error || "Gagal memperbarui kata sandi", "error");
      }
    } catch (err) {
      toast("Terjadi kesalahan saat menyimpan kata sandi", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handler Upload Berkas CV / Resume (Mendukung PDF, PNG, JPG)
  const handleCvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Batas ukuran 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast("Ukuran file terlalu besar (maksimal 5MB). Silakan gunakan link Google Drive atau perkecil file.", "error");
      return;
    }

    // Jika gambar (PNG / JPG / JPEG)
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 1800;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
            const compressedDataUrl = canvas.toDataURL(mimeType, 0.88);
            setForm((prev) => ({
              ...prev,
              cvUrl: compressedDataUrl,
              cvFileName: file.name,
            }));
            toast(`Foto/Gambar Resume (${file.name}) berhasil dipilih!`, "success");
          } else {
            setForm((prev) => ({
              ...prev,
              cvUrl: event.target?.result as string,
              cvFileName: file.name,
            }));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      // PDF atau dokumen lainnya
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          cvUrl: reader.result as string,
          cvFileName: file.name,
        }));
        toast(`File CV ${file.name} berhasil dipilih!`, "success");
      };
      reader.readAsDataURL(file);
    }
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
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Pengaturan Profil</h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Atur nama site, favicon, serta profil utama yang tampil di Landing Page.</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="btn-primary px-5 py-2.5 shadow-md flex items-center gap-2">
          {saved ? (
            <><CheckCircle2 className="w-4 h-4 text-foreground" /> Tersimpan!</>
          ) : (
            <><Save className="w-4 h-4" /> {loading ? "Menyimpan..." : "Simpan Pengaturan"}</>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="panel lg:col-span-2">
          <CardHeader>
            <CardTitle>Pengaturan Umum</CardTitle>
            <CardDescription style={{ color: "var(--text-muted)" }}>Atur judul situs dan ikon browser Anda.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="siteTitle">Site / Navbar Title</Label>
              <Input
                id="siteTitle"
                value={form.siteTitle}
                onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
                placeholder="Portfolio."
                
              />
            </div>
            <div className="grid gap-2">
              <Label>Favicon (.ico, .png, .jpg)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  
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
                  <div className="w-10 h-10 border border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
                    <img src={form.faviconUrl} alt="Favicon Preview" className="w-6 h-6 object-contain" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Landing Page Section Visibility */}
        <Card className="panel lg:col-span-2">
          <CardHeader>
            <CardTitle>Visibilitas Modul Landing Page</CardTitle>
            <CardDescription style={{ color: "var(--text-muted)" }}>Aktifkan atau nonaktifkan modul/bagian yang ingin ditampilkan di Landing Page.</CardDescription>
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
        <Card className="panel">
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription style={{ color: "var(--text-muted)" }}>Data yang tampil di bagian paling atas website.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Nama Lengkap</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rinda Dev" />
            </div>
            <div className="grid gap-2">
              <Label>Jabatan / Profesi</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Full Stack Developer" />
            </div>
            <div className="grid gap-2">
              <Label>Status Tersedia (Opsional)</Label>
              <Input value={form.hireStatus} onChange={(e) => setForm({ ...form, hireStatus: e.target.value })} placeholder="Contoh: Available for hire" />
              <p className="text-xs text-muted-foreground">Jika dikosongkan, label ini tidak akan muncul di halaman depan.</p>
            </div>
            <div className="grid gap-2">
              <Label>Deskripsi Singkat (Hero)</Label>
              <textarea 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2" 
                style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                placeholder="Saya fokus membangun aplikasi web modern..." 
              />
            </div>
          </CardContent>
        </Card>

        {/* About Me */}
        <Card className="panel">
          <CardHeader>
            <CardTitle>Tentang Saya</CardTitle>
            <CardDescription style={{ color: "var(--text-muted)" }}>Data yang tampil di section About Me.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Deskripsi About Me</Label>
              <textarea 
                value={form.about} 
                onChange={(e) => setForm({ ...form, about: e.target.value })}
                className="flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2" 
                style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                placeholder="Ceritakan tentang diri Anda secara lengkap..." 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="rinda@example.com" />
              </div>
              <div className="grid gap-2">
                <Label>No. HP / WhatsApp</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+62812..." />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Lokasi</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Jakarta, Indonesia" />
            </div>
          </CardContent>
        </Card>

        {/* CV / Resume Upload (PDF, PNG, JPG) */}
        <Card className="panel">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-foreground" />
                  CV / Resume
                </CardTitle>
                <CardDescription style={{ color: "var(--text-muted)" }}>
                  Upload file Resume / CV dalam format <strong>PDF, PNG, atau JPG</strong>, atau gunakan link eksternal (Google Drive / Dropbox).
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="cvActive" 
                  checked={form.cvActive} 
                  onChange={(e) => setForm({ ...form, cvActive: e.target.checked })}
                  className="w-4 h-4 rounded cursor-pointer accent-zinc-800 dark:accent-zinc-200"
                />
                <Label htmlFor="cvActive" className="text-sm font-medium cursor-pointer">Aktifkan di Web</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload Box */}
            <div className="grid gap-2">
              <Label className="text-xs font-semibold text-foreground">
                Pilih File Dokumen (PDF, PNG, JPG)
              </Label>
              <Input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                className="file:text-foreground file:bg-muted file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:text-xs cursor-pointer"
                onChange={handleCvFileUpload}
              />
              <p className="text-[11px] text-muted-foreground">
                Mendukung berkas <strong>PDF</strong>, gambar <strong>PNG</strong>, dan foto <strong>JPG</strong> (Maks. 5MB).
              </p>
            </div>

            {/* Active CV Status & Preview */}
            {form.cvUrl && (
              <div 
                className="p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)" }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {/* Thumbnail / Icon */}
                  {form.cvUrl.startsWith("data:image/") || /\.(png|jpe?g)$/i.test(form.cvFileName) ? (
                    <div className="w-12 h-12 rounded-lg border overflow-hidden shrink-0 flex items-center justify-center" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
                      <img 
                        src={form.cvUrl} 
                        alt="Preview CV" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}>
                      <FileText className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold truncate max-w-[220px] sm:max-w-[320px]" style={{ color: "var(--text-primary)" }}>
                        {form.cvFileName || "Berkas CV / Resume"}
                      </span>
                      <span 
                        className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border shrink-0"
                        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                      >
                        {form.cvUrl.startsWith("data:image/") || /\.(png|jpe?g)$/i.test(form.cvFileName)
                          ? "GAMBAR"
                          : form.cvUrl.startsWith("data:application/pdf") || /\.pdf$/i.test(form.cvFileName)
                          ? "PDF"
                          : "LINK"}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
                      ✓ Siap didownload oleh pengunjung
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 text-xs btn-outline"
                    onClick={() => {
                      if (form.cvUrl.startsWith("data:")) {
                        const win = window.open();
                        if (win) {
                          win.document.write(
                            `<iframe src="${form.cvUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                          );
                        }
                      } else {
                        window.open(form.cvUrl, "_blank");
                      }
                    }}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Lihat
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-red-500 hover:bg-red-500/10"
                    onClick={() => {
                      setForm({ ...form, cvUrl: "", cvFileName: "" });
                      toast("File CV telah dihapus dari formulir.", "info");
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Hapus
                  </Button>
                </div>
              </div>
            )}

            {/* Alternatif: Link Eksternal */}
            <div className="grid gap-2 pt-2 border-t" style={{ borderColor: "var(--border-default)" }}>
              <Label className="text-xs" style={{ color: "var(--text-muted)" }}>Atau Tempel Link Eksternal (Google Drive / Dropbox / Cloud)</Label>
              <Input
                value={form.cvUrl && !form.cvUrl.startsWith("data:") ? form.cvUrl : ""}
                onChange={(e) => setForm({ ...form, cvUrl: e.target.value, cvFileName: e.target.value ? "Link Eksternal" : "" })}
                placeholder="https://drive.google.com/..."
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media Card */}
        <Card className="panel">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Social Media</CardTitle>
                <CardDescription style={{ color: "var(--text-muted)" }}>Kelola link sosial media Anda.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="socialActive" 
                  checked={form.socialActive} 
                  onChange={(e) => setForm({ ...form, socialActive: e.target.checked })}
                  className="w-4 h-4 rounded cursor-pointer accent-zinc-800 dark:accent-zinc-200"
                />
                <Label htmlFor="socialActive" className="text-sm font-medium cursor-pointer">Aktifkan</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Form Tambah Link */}
            <div className="p-3 border rounded-xl space-y-3" style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)" }}>
              <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Tambah Link Baru</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px]" style={{ color: "var(--text-muted)" }}>Platform</Label>
                  <select 
                    value={newSocial.platform} 
                    onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
                    className="w-full h-9 rounded-lg border px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-2" 
                    style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
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
                  <Label className="text-[10px]" style={{ color: "var(--text-muted)" }}>URL Link</Label>
                  <Input 
                    value={newSocial.url} 
                    onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                    placeholder="https://..." 
                    className="h-9 text-xs"
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddSocial} 
                size="sm" 
                className="btn-primary w-full text-xs h-8"
              >
                + Tambah Sosial Media
              </Button>
            </div>

            {/* List Link Yang Ada */}
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              <Label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Daftar Link Aktif (Tanpa Batas)</Label>
              {socials.length === 0 ? (
                <p className="text-xs italic py-2" style={{ color: "var(--text-muted)" }}>Belum ada link sosial media.</p>
              ) : (
                socials.map((link) => (
                  <div key={link.id} className="flex justify-between items-center p-2 rounded-lg border text-xs" style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)" }}>
                    <div className="truncate max-w-[70%]">
                      <span className="font-semibold mr-2" style={{ color: "var(--text-primary)" }}>{link.platform}</span>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="underline truncate max-w-[150px] inline-block align-middle hover:opacity-80" style={{ color: "var(--text-muted)" }}>
                        {link.url}
                      </a>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleRemoveSocial(link.id)} 
                      className="h-6 px-2 hover:bg-red-500/10 text-red-500 text-xs"
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
        <Card className="panel lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-foreground" />
                  Keamanan Akun
                </CardTitle>
                <CardDescription style={{ color: "var(--text-muted)" }} className="mt-1">Kelola kata sandi untuk masuk ke dashboard admin.</CardDescription>
              </div>
              <Button
                type="button"
                onClick={() => {
                  setPasswordForm({ current: "", newPass: "", confirm: "" });
                  setPasswordSaved(false);
                  setShowPasswordModal(true);
                }}
                className="btn-outline flex items-center gap-2 text-sm"
              >
                <KeyRound className="w-4 h-4 text-foreground" />
                Ganti Sandi
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)" }}>
              <div className="w-9 h-9 rounded-full border flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
                <KeyRound className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Kata Sandi Admin</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Klik tombol <span className="font-medium" style={{ color: "var(--text-primary)" }}>Ganti Sandi</span> untuk memperbarui kata sandi login.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== MODAL GANTI SANDI ===== */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPasswordModal(false); }}
        >
          <div className="w-full max-w-md panel rounded-2xl shadow-2xl overflow-hidden border animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-default)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg border flex items-center justify-center" style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)" }}>
                  <KeyRound className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Ganti Kata Sandi</h2>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Perbarui sandi akun admin Anda</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordStep("request");
                  setOtpCode("");
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {passwordStep === "request" && (
                <div className="space-y-4 text-center pb-2">
                  <div className="w-16 h-16 rounded-full border flex items-center justify-center mx-auto mb-2 text-foreground" style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)" }}>
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                    Untuk mengganti sandi, kami perlu mengirimkan kode verifikasi (OTP) ke email Anda:
                  </p>
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {form.email || "rinda.dev21@gmail.com"}
                  </p>
                </div>
              )}

              {passwordStep === "verify" && (
                <div className="space-y-4 pb-2">
                  <Label htmlFor="otpCode" className="text-sm">Kode Verifikasi (OTP)</Label>
                  <Input
                    id="otpCode"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Masukkan 6 digit kode"
                    className="text-center tracking-widest text-lg font-bold h-12"
                    maxLength={6}
                  />
                  <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                    Cek kotak masuk email Anda (atau cek toast jika SMTP belum diatur).
                  </p>
                </div>
              )}

              {passwordStep === "change" && (
                <>
                  {/* Sandi Baru */}
                  <div className="space-y-1.5">
                    <Label htmlFor="newPass" className="text-sm">Sandi Baru</Label>
                    <div className="relative">
                      <Input
                        id="newPass"
                        type={showNew ? "text" : "password"}
                        value={passwordForm.newPass}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                        placeholder="Minimal 6 karakter"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.newPass.length > 0 && passwordForm.newPass.length < 6 && (
                      <p className="text-xs text-red-500">Sandi harus minimal 6 karakter</p>
                    )}
                  </div>

                  {/* Konfirmasi Sandi */}
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPass" className="text-sm">Konfirmasi Sandi Baru</Label>
                    <div className="relative">
                      <Input
                        id="confirmPass"
                        type={showConfirm ? "text" : "password"}
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        placeholder="Ulangi sandi baru"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.confirm.length > 0 && passwordForm.newPass !== passwordForm.confirm && (
                      <p className="text-xs text-red-500">Konfirmasi sandi tidak cocok</p>
                    )}
                    {passwordForm.confirm.length > 0 && passwordForm.newPass === passwordForm.confirm && passwordForm.newPass.length >= 6 && (
                      <p className="text-xs flex items-center gap-1 font-medium" style={{ color: "var(--text-primary)" }}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sandi cocok
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordStep("request");
                  setOtpCode("");
                }}
                className="flex-1 btn-outline"
              >
                Batal
              </Button>

              {passwordStep === "request" && (
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={passwordLoading}
                  className="flex-1 btn-primary"
                >
                  {passwordLoading ? "Mengirim..." : "Kirim Kode OTP"}
                </Button>
              )}

              {passwordStep === "verify" && (
                <Button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={passwordLoading}
                  className="flex-1 btn-primary"
                >
                  {passwordLoading ? "Memeriksa..." : "Verifikasi OTP"}
                </Button>
              )}

              {passwordStep === "change" && (
                <Button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={passwordLoading || passwordSaved}
                  className="flex-1 btn-primary"
                >
                  {passwordSaved ? (
                    <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Tersimpan!</>
                  ) : passwordLoading ? (
                    "Menyimpan..."
                  ) : (
                    <><KeyRound className="w-4 h-4 mr-1.5" /> Simpan Sandi</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VisibilityToggle({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-xl transition-all" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)' }}>
      <Label htmlFor={id} className="text-sm font-medium cursor-pointer select-none" style={{ color: 'var(--text-primary)' }}>{label}</Label>
      <input 
        type="checkbox" 
        id={id} 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded cursor-pointer accent-zinc-800 dark:accent-zinc-200"
      />
    </div>
  );
}
