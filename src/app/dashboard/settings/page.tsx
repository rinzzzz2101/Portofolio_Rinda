"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Save, CheckCircle2 } from "lucide-react";
import { getSettings, saveSettings } from "@/actions/settings";
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
  });

  useEffect(() => {
    setMounted(true);
    // Load from DB
    getSettings().then((res) => {
      if (res.success && res.data) {
        setForm({
          siteTitle: res.data.siteTitle || "Portfolio.",
          faviconUrl: res.data.faviconUrl || "",
          name: res.data.name || "",
          role: res.data.role || "",
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
        });
      }
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const res = await saveSettings(form);
    setLoading(false);
    if (res.success) {
      toast("Pengaturan berhasil disimpan!", "success");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      toast("Gagal menyimpan pengaturan.", "error");
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
        <Button onClick={handleSave} disabled={loading} className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
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
              <Label>Deskripsi Singkat (Hero)</Label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="flex min-h-[80px] w-full rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
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
                className="flex min-h-[80px] w-full rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
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
            <CardTitle>CV / Resume</CardTitle>
            <CardDescription className="text-gray-400">Upload CV atau tempel link Google Drive / Dropbox.</CardDescription>
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
                <p className="text-xs text-purple-400 font-medium">✓ File: {form.cvFileName}</p>
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

        {/* Social Media */}
        <Card className="glass-card border-gray-800 text-white">
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription className="text-gray-400">Link sosial media yang ditampilkan di website.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>GitHub</Label>
                <Input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} placeholder="https://github.com/..." className="bg-gray-900 border-gray-800" />
              </div>
              <div className="grid gap-2">
                <Label>LinkedIn</Label>
                <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." className="bg-gray-900 border-gray-800" />
              </div>
              <div className="grid gap-2">
                <Label>Instagram</Label>
                <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="https://instagram.com/..." className="bg-gray-900 border-gray-800" />
              </div>
              <div className="grid gap-2">
                <Label>Twitter / X</Label>
                <Input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} placeholder="https://x.com/..." className="bg-gray-900 border-gray-800" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
