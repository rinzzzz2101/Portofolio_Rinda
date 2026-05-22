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

    // DUMMY LOGIN (Karena Supabase Auth belum terkoneksi .env)
    // Nanti akan diganti menggunakan supabase.auth.signInWithPassword
    setTimeout(() => {
      if (email === "rinda.dev21@gmail.com" && password === "12345678") {
        // Simulasi set cookie atau token (Middleware akan handle ini nanti via Supabase)
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
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full z-0 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full z-0 pointer-events-none" />

      <Card className="w-full max-w-md glass-card border-gray-800 z-10 text-white">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-2 border border-purple-500/30">
            <Lock className="w-5 h-5 text-purple-400" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Admin Login</CardTitle>
          <CardDescription className="text-gray-400">
            Masukkan kredensial Anda untuk mengakses Dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-400 text-sm font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <Input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rinda.dev21@gmail.com" 
                className="bg-gray-900/50 border-gray-800 focus-visible:ring-purple-500" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <Input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="bg-gray-900/50 border-gray-800 focus-visible:ring-purple-500" 
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
              {loading ? "Memverifikasi..." : "Masuk ke Dashboard"}
            </Button>
            <Button asChild variant="ghost" className="w-full border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-900/50">
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
