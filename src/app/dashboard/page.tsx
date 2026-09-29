import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Code2, Eye, MessageSquare, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardOverview() {
  // Ambil data statistik dari database MySQL Laragon
  const projectsCount = await prisma.project.count().catch(() => 0);
  const skillsCount = await prisma.skill.count().catch(() => 0);
  const messagesCount = await prisma.contactMessage.count({ where: { isRead: false } }).catch(() => 0);
  const viewsCount = await prisma.profileView.count().catch(() => 0);
  
  // Ambil 5 pesan masuk terbaru
  const recentMessages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 5
  }).catch(() => []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-zinc-400 mt-2">Selamat datang di Panel Admin Portofolio Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Projects" value={projectsCount.toString()} icon={<FolderKanban className="text-zinc-400" />} />
        <StatCard title="Total Skills" value={skillsCount.toString()} icon={<Code2 className="text-zinc-400" />} />
        <StatCard title="Profile Views" value={viewsCount.toString()} icon={<Eye className="text-zinc-400" />} />
        <StatCard title="New Messages" value={messagesCount.toString()} icon={<MessageSquare className="text-zinc-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-zinc-900/30 border-zinc-850 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Messages</CardTitle>
            <Link href="/dashboard/messages" className="text-xs text-zinc-300 hover:text-white hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMessages.length === 0 ? (
              <div className="text-zinc-500 text-sm italic">
                Belum ada pesan baru yang masuk.
              </div>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg.id} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-zinc-200">{msg.name}</span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(msg.createdAt).toLocaleDateString("id-ID", { dateStyle: "short" })}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400">{msg.email}</span>
                  <p className="text-xs text-zinc-450 line-clamp-2 mt-1">{msg.message}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/30 border-zinc-850 text-white">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/projects" className="flex items-center justify-between w-full px-4 py-3 bg-zinc-850/30 hover:bg-zinc-850/50 rounded-lg transition-colors border border-zinc-800 group">
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-zinc-400" /> + Tambah Project Baru
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/dashboard/blogs" className="flex items-center justify-between w-full px-4 py-3 bg-zinc-850/30 hover:bg-zinc-850/50 rounded-lg transition-colors border border-zinc-800 group">
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-zinc-400" /> + Tambah Artikel Blog
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/dashboard/surat-lamaran" className="flex items-center justify-between w-full px-4 py-3 bg-zinc-850/30 hover:bg-zinc-850/50 rounded-lg transition-colors border border-zinc-800 group">
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-zinc-400" /> + Buat Surat Lamaran Kerja
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="bg-zinc-900/30 border-zinc-850 text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
