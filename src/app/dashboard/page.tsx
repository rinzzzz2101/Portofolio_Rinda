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
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Dashboard Overview</h1>
        <p className="mt-2" style={{ color: 'var(--text-muted)' }}>Selamat datang di Panel Admin Portofolio Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Projects" value={projectsCount.toString()} icon={<FolderKanban style={{ color: 'var(--text-secondary)' }} />} />
        <StatCard title="Total Skills" value={skillsCount.toString()} icon={<Code2 style={{ color: 'var(--text-secondary)' }} />} />
        <StatCard title="Profile Views" value={viewsCount.toString()} icon={<Eye style={{ color: 'var(--text-secondary)' }} />} />
        <StatCard title="New Messages" value={messagesCount.toString()} icon={<MessageSquare style={{ color: 'var(--text-secondary)' }} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="panel" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle style={{ color: 'var(--text-primary)' }}>Recent Messages</CardTitle>
            <Link href="/dashboard/messages" className="text-xs hover:underline flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              Lihat semua <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMessages.length === 0 ? (
              <div className="text-sm italic" style={{ color: 'var(--text-dim)' }}>
                Belum ada pesan baru yang masuk.
              </div>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg.id} className="p-3 border rounded-lg flex flex-col gap-1" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)' }}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{msg.name}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                      {new Date(msg.createdAt).toLocaleDateString("id-ID", { dateStyle: "short" })}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{msg.email}</span>
                  <p className="text-xs line-clamp-2 mt-1" style={{ color: 'var(--text-muted)' }}>{msg.message}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="panel" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/projects" className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors border group" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)' }}>
              <span className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Plus className="w-4 h-4" /> + Tambah Project Baru
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} />
            </Link>
            <Link href="/dashboard/blogs" className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors border group" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)' }}>
              <span className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Plus className="w-4 h-4" /> + Tambah Artikel Blog
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} />
            </Link>
            <Link href="/dashboard/surat-lamaran" className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors border group" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)' }}>
              <span className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Plus className="w-4 h-4" /> + Buat Surat Lamaran Kerja
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="panel" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
      </CardContent>
    </Card>
  );
}
