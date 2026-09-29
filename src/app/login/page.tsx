"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PanelLoading } from "@/components/ui/loading";

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Login menggunakan password yang tersimpan (default: "12345678", bisa diubah via Settings)
    const storedPassword = localStorage.getItem("admin_password") || "12345678";
    setTimeout(() => {
      if (email === "rinda.dev21@gmail.com" && password === storedPassword) {
        // Simulasi set cookie atau token
        document.cookie = "dummy_auth=true; path=/";
        router.push("/dashboard");
      } else {
        setError("Email atau password salah!");
      }
      setLoading(false);
    }, 1000);
  };

  if (!mounted) return <PanelLoading />;

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <Card className="w-full max-w-md bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md z-10 text-white">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-zinc-800/50 rounded-full flex items-center justify-center mb-2 border border-zinc-700/50">
            <Lock className="w-5 h-5 text-zinc-300" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Admin Login</CardTitle>
          <CardDescription className="text-zinc-400">
            Masukkan kredensial Anda untuk mengakses Dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-md text-red-400 text-sm font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email</label>
              <Input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rinda.dev21@gmail.com" 
                className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-400" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Password</label>
              <Input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-400" 
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button disabled={loading} type="submit" className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-colors font-medium">
              {loading ? "Memverifikasi..." : "Masuk ke Dashboard"}
            </Button>
            <Button asChild variant="ghost" className="w-full border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Landing Page
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
