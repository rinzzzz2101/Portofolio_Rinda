"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, ArrowLeft, Eye, EyeOff, KeyRound, ShieldCheck, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { PanelLoading } from "@/components/ui/loading";
import { loginAdmin, sendPasswordOtp, resetPasswordWithOtp } from "@/actions/auth";
import { useToast } from "@/components/ui/toast-provider";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
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
    // Jika ada email sebelumnya di form, set sebagai default reset email
    setResetEmail(email || "rinda.dev21@gmail.com");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginAdmin(email, password);
      if (res.success) {
        // Simpan persistent cookie 7 hari di browser
        document.cookie = "dummy_auth=true; path=/; max-age=604800; SameSite=Lax";
        // Sinkronkan ke localStorage untuk kompatibilitas
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
        // Isi password field otomatis
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
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <Card className="w-full max-w-md bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md z-10 text-white shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-zinc-800/60 rounded-full flex items-center justify-center mb-2 border border-zinc-700/50">
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Admin Login</CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            Masukkan kredensial Anda untuk mengakses Dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950/30 border border-red-900/60 rounded-lg text-red-400 text-sm font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email</label>
              <Input 
                type="email" 
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setResetEmail(e.target.value);
                }}
                placeholder="rinda.dev21@gmail.com" 
                className="bg-zinc-950/60 border-zinc-800 focus-visible:ring-emerald-500" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email || "rinda.dev21@gmail.com");
                    setShowResetModal(true);
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline transition"
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
                  className="bg-zinc-950/60 border-zinc-800 pr-10 focus-visible:ring-emerald-500" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
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
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors h-10 shadow-lg shadow-emerald-950/20"
            >
              {loading ? "Memverifikasi..." : "Masuk ke Dashboard"}
            </Button>
            <Button asChild variant="ghost" className="w-full border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/60">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowResetModal(false); }}
        >
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Reset Kata Sandi</h2>
                  <p className="text-xs text-zinc-400">Verifikasi email untuk membuat kata sandi baru</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetStep("request");
                  setOtpCode("");
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {resetStep === "request" && (
                <div className="space-y-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mx-auto text-zinc-300">
                    <ShieldCheck className="w-7 h-7 text-emerald-400" />
                  </div>
                  <p className="text-sm text-zinc-300">
                    Kami akan mengirimkan kode verifikasi 6-digit (OTP) ke email terdaftar:
                  </p>
                  <div className="space-y-1.5 text-left">
                    <Label className="text-xs text-zinc-400">Email Tujuan</Label>
                    <Input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="rinda.dev21@gmail.com"
                      className="bg-zinc-800 border-zinc-700 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {resetStep === "verify" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="otpInput" className="text-sm text-zinc-300">Kode OTP (6 Digit)</Label>
                    <Input
                      id="otpInput"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Contoh: 123456"
                      maxLength={6}
                      className="bg-zinc-800 border-zinc-700 text-center tracking-widest text-lg font-bold h-11"
                    />
                    <p className="text-xs text-zinc-400 text-center">
                      Periksa kotak masuk/spam email <span className="text-emerald-400 font-medium">{resetEmail}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="newPasswordInput" className="text-sm text-zinc-300">Kata Sandi Baru</Label>
                    <div className="relative">
                      <Input
                        id="newPasswordInput"
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="bg-zinc-800 border-zinc-700 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPasswordInput" className="text-sm text-zinc-300">Konfirmasi Kata Sandi Baru</Label>
                    <Input
                      id="confirmPasswordInput"
                      type={showNewPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="bg-zinc-800 border-zinc-700"
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-400">Konfirmasi sandi belum sesuai</p>
                    )}
                    {confirmPassword && newPassword === confirmPassword && (
                      <p className="text-xs text-emerald-400 flex items-center gap-1">
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
                className="flex-1 border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Batal
              </Button>

              {resetStep === "request" && (
                <Button
                  type="button"
                  onClick={handleSendResetOtp}
                  disabled={resetLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  {resetLoading ? "Mengirim..." : "Kirim Kode OTP"}
                </Button>
              )}

              {resetStep === "verify" && (
                <Button
                  type="button"
                  onClick={handleConfirmReset}
                  disabled={resetLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
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
