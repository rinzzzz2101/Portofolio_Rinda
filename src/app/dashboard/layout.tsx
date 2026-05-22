"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, Code2, Briefcase, GraduationCap, FileText, Mail, Settings, LogOut, Users, BookOpen } from "lucide-react";
import { ConfirmProvider } from "@/components/ui/confirm-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Hapus cookie auth
    document.cookie = "dummy_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    
    // Redirect ke login
    router.push("/login");
  };

  return (
    <ConfirmProvider>
    <div className="h-screen bg-black text-white flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 glass border-r border-gray-800 flex flex-col hidden md:flex h-full">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">Admin Panel</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active={pathname === "/dashboard"} />
          <NavItem href="/dashboard/projects" icon={<FolderKanban size={20} />} label="Projects" active={pathname === "/dashboard/projects"} />
          <NavItem href="/dashboard/skills" icon={<Code2 size={20} />} label="Skills" active={pathname === "/dashboard/skills"} />
          <NavItem href="/dashboard/experience" icon={<Briefcase size={20} />} label="Pengalaman Kerja" active={pathname === "/dashboard/experience"} />
          <NavItem href="/dashboard/education" icon={<BookOpen size={20} />} label="Pendidikan" active={pathname === "/dashboard/education"} />
          <NavItem href="/dashboard/organizations" icon={<Users size={20} />} label="Organisasi" active={pathname === "/dashboard/organizations"} />
          <NavItem href="/dashboard/certificates" icon={<GraduationCap size={20} />} label="Sertifikat" active={pathname === "/dashboard/certificates"} />
          <NavItem href="/dashboard/blogs" icon={<FileText size={20} />} label="Blogs" active={pathname === "/dashboard/blogs"} />
          <NavItem href="/dashboard/messages" icon={<Mail size={20} />} label="Messages" active={pathname === "/dashboard/messages"} />
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <NavItem href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" active={pathname === "/dashboard/settings"} />
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#050505] h-full">
        {children}
      </main>
    </div>
    </ConfirmProvider>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
        active 
          ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" 
          : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
      }`}>
        {icon}
        <span className="font-medium">{label}</span>
      </div>
    </Link>
  );
}
