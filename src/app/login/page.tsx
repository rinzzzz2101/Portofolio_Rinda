"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, ArrowLeft, Eye, EyeOff, KeyRound, ShieldCheck, X, CheckCircle2, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { PanelLoading } from "@/components/ui/loading";
import { loginAdmin, sendPasswordOtp, resetPasswordWithOtp } from "@/actions/auth";
import { useToast } from "@/components/ui/toast-provider";
import { useTheme } from "@/components/ui/theme-provider";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State Reset / Lupa Sandi Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState<"request" | "verify">("request");
  const [resetEmail, setResetEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResetEmail(email || "rinda.dev21@gmail.com");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginAdmin(email, password);
      if (res.success) {
        document.cookie = "dummy_auth=true; path=/; max-age=604800; SameSite=Lax";
        localStorage.setItem("admin_password", password);
        router.push("/dashboard");
      } else {
        setError(res.error || "Email atau password salah!");
      }
    } catch (err) {
      console.error("[Login Error]:", err);
      setError("Terjadi kesalahan sistem saat memproses login.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = async () => {
    const target = (resetEmail || email || "rinda.dev21@gmail.com").trim();
    if (!target) {
      toast("Masukkan email yang terdaftar!", "error");
      return;
    }
    setResetLoading(true);
    try {
      const res = await sendPasswordOtp(target);
      if (res.success) {
        toast(res.message || "Kode OTP berhasil dikirim!", "success");
        setResetStep("verify");
      } else {
        toast(res.error || "Gagal mengirim kode OTP", "error");
      }
    } catch (err) {
      toast("Terjadi kesalahan saat mengirim OTP", "error");
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!otpCode || otpCode.length < 6) {
      toast("Masukkan 6 digit kode OTP!", "error");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast("Kata sandi baru minimal 6 karakter!", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("Konfirmasi sandi tidak sesuai!", "error");
      return;
    }

    setResetLoading(true);
    try {
      const target = (resetEmail || email || "rinda.dev21@gmail.com").trim();
      const res = await resetPasswordWithOtp(target, otpCode, newPassword);
      if (res.success) {
        toast("Kata sandi berhasil diperbarui! Silakan login.", "success");
        setPassword(newPassword);
        localStorage.setItem("admin_password", newPassword);
        setShowResetModal(false);
        setResetStep("request");
        setOtpCode("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast(res.error || "Gagal mengatur ulang kata sandi.", "error");
      }
    } catch (err) {
      toast("Terjadi kesalahan saat memproses reset sandi.", "error");
    } finally {
      setResetLoading(false);
    }
  };

  if (!mounted) return <PanelLoading />;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Top right theme toggle */}
      <div className="absolute top-5 right-5 z-20">
        <button 
          onClick={toggleTheme} 
          className="p-2.5 rounded-full border shadow-sm transition hover:scale-105"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
          title={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      <Card className="w-full max-w-md panel z-10 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div 
            className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 border"
            style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
          >
            <Lock className="w-5 h-5 text-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Admin Login</CardTitle>
          <CardDescription style={{ color: "var(--text-muted)" }} className="text-sm">
            Masukkan kredensial Anda untuk mengakses Dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Email</label>
              <Input 
                type="email" 
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setResetEmail(e.target.value);
                }}
                placeholder="rinda.dev21@gmail.com" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email || "rinda.dev21@gmail.com");
                    setShowResetModal(true);
                  }}
                  className="text-xs underline transition hover:opacity-80"
                  style={{ color: "var(--text-muted)" }}
                >
                  Lupa sandi?
                </button>
              </div>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button 
              disabled={loading} 
              type="submit" 
              className="w-full btn-primary h-10 shadow-lg font-medium"
            >
              {loading ? "Memverifikasi..." : "Masuk ke Dashboard"}
            </Button>
            <Button asChild variant="ghost" className="w-full btn-outline">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Landing Page
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* ===== MODAL LUPA / RESET SANDI ===== */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowResetModal(false); }}
        >
          <div className="w-full max-w-md panel border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-default)" }}>
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-lg border flex items-center justify-center"
                  style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)" }}
                >
                  <KeyRound className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Reset Kata Sandi</h2>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Verifikasi email untuk membuat kata sandi baru</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetStep("request");
                  setOtpCode("");
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {resetStep === "request" && (
                <div className="space-y-4 text-center">
                  <div 
                    className="w-14 h-14 rounded-full border flex items-center justify-center mx-auto"
                    style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)" }}
                  >
                    <ShieldCheck className="w-7 h-7 text-foreground" />
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                    Kami akan mengirimkan kode verifikasi 6-digit (OTP) ke email terdaftar:
                  </p>
                  <div className="space-y-1.5 text-left">
                    <Label className="text-xs" style={{ color: "var(--text-muted)" }}>Email Tujuan</Label>
                    <Input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="rinda.dev21@gmail.com"
                    />
                  </div>
                </div>
              )}

              {resetStep === "verify" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="otpInput" className="text-sm">Kode OTP (6 Digit)</Label>
                    <Input
                      id="otpInput"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Contoh: 123456"
                      maxLength={6}
                      className="text-center tracking-widest text-lg font-bold h-11"
                    />
                    <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                      Periksa kotak masuk/spam email <span className="font-medium" style={{ color: "var(--text-primary)" }}>{resetEmail}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="newPasswordInput" className="text-sm">Kata Sandi Baru</Label>
                    <div className="relative">
                      <Input
                        id="newPasswordInput"
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPasswordInput" className="text-sm">Konfirmasi Kata Sandi Baru</Label>
                    <Input
                      id="confirmPasswordInput"
                      type={showNewPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500">Konfirmasi sandi belum sesuai</p>
                    )}
                    {confirmPassword && newPassword === confirmPassword && (
                      <p className="text-xs flex items-center gap-1 font-medium" style={{ color: "var(--text-primary)" }}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sandi cocok
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowResetModal(false);
                  setResetStep("request");
                  setOtpCode("");
                }}
                className="flex-1 btn-outline"
              >
                Batal
              </Button>

              {resetStep === "request" && (
                <Button
                  type="button"
                  onClick={handleSendResetOtp}
                  disabled={resetLoading}
                  className="flex-1 btn-primary"
                >
                  {resetLoading ? "Mengirim..." : "Kirim Kode OTP"}
                </Button>
              )}

              {resetStep === "verify" && (
                <Button
                  type="button"
                  onClick={handleConfirmReset}
                  disabled={resetLoading}
                  className="flex-1 btn-primary"
                >
                  {resetLoading ? "Menyimpan..." : "Simpan & Reset"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
