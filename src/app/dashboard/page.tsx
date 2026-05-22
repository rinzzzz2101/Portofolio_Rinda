import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Code2, Eye, MessageSquare, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

// Matikan static caching agar statistik selalu diperbarui
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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-400 mt-2">Selamat datang di Panel Admin Portofolio Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Projects" value={projectsCount.toString()} icon={<FolderKanban className="text-blue-400" />} />
        <StatCard title="Total Skills" value={skillsCount.toString()} icon={<Code2 className="text-purple-400" />} />
        <StatCard title="Profile Views" value={viewsCount.toString()} icon={<Eye className="text-green-400" />} />
        <StatCard title="New Messages" value={messagesCount.toString()} icon={<MessageSquare className="text-yellow-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Messages</CardTitle>
            <Link href="/dashboard/messages" className="text-xs text-purple-400 hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMessages.length === 0 ? (
              <div className="text-gray-500 text-sm italic">
                Belum ada pesan baru yang masuk.
              </div>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg.id} className="p-3 bg-gray-900/50 border border-gray-800 rounded-lg flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-gray-200">{msg.name}</span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(msg.createdAt).toLocaleDateString("id-ID", { dateStyle: "short" })}
                    </span>
                  </div>
                  <span className="text-xs text-purple-400">{msg.email}</span>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-1">{msg.message}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-gray-800 text-white">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/projects" className="flex items-center justify-between w-full px-4 py-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors border border-gray-800 group">
              <span className="text-sm font-medium text-gray-300 group-hover:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" /> + Tambah Project Baru
              </span>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/dashboard/blogs" className="flex items-center justify-between w-full px-4 py-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors border border-gray-800 group">
              <span className="text-sm font-medium text-gray-300 group-hover:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" /> + Tambah Artikel Blog
              </span>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="glass-card border-gray-800 text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
