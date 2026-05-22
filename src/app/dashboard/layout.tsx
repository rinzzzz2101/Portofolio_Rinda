"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, FolderKanban, Code2, Briefcase, GraduationCap, FileText, Mail, Settings, LogOut, Users, BookOpen, Menu, X } from "lucide-react";
import { ConfirmProvider } from "@/components/ui/confirm-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // Hapus cookie auth
    document.cookie = "dummy_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    
    // Redirect ke login
    router.push("/login");
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <ConfirmProvider>
    <div className="h-screen bg-black text-white flex overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass border-b border-gray-800 z-50 flex items-center justify-between px-6 bg-[#050505]/90 backdrop-blur-md">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">Admin Panel</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 shrink-0 glass border-r border-gray-800 flex flex-col h-full fixed md:relative z-40 transition-transform duration-300 bg-[#050505] md:bg-transparent ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-6 border-b border-gray-800 hidden md:block">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">Admin Panel</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-16 md:mt-0">
          <NavItem onClick={closeMenu} href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active={pathname === "/dashboard"} />
          <NavItem onClick={closeMenu} href="/dashboard/projects" icon={<FolderKanban size={20} />} label="Projects" active={pathname === "/dashboard/projects"} />
          <NavItem onClick={closeMenu} href="/dashboard/skills" icon={<Code2 size={20} />} label="Skills" active={pathname === "/dashboard/skills"} />
          <NavItem onClick={closeMenu} href="/dashboard/experience" icon={<Briefcase size={20} />} label="Pengalaman Kerja" active={pathname === "/dashboard/experience"} />
          <NavItem onClick={closeMenu} href="/dashboard/education" icon={<BookOpen size={20} />} label="Pendidikan" active={pathname === "/dashboard/education"} />
          <NavItem onClick={closeMenu} href="/dashboard/organizations" icon={<Users size={20} />} label="Organisasi" active={pathname === "/dashboard/organizations"} />
          <NavItem onClick={closeMenu} href="/dashboard/certificates" icon={<GraduationCap size={20} />} label="Sertifikat" active={pathname === "/dashboard/certificates"} />
          <NavItem onClick={closeMenu} href="/dashboard/blogs" icon={<FileText size={20} />} label="Blogs" active={pathname === "/dashboard/blogs"} />
          <NavItem onClick={closeMenu} href="/dashboard/messages" icon={<Mail size={20} />} label="Messages" active={pathname === "/dashboard/messages"} />
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <NavItem onClick={closeMenu} href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" active={pathname === "/dashboard/settings"} />
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
      <main className="flex-1 overflow-y-auto bg-[#050505] h-full pt-16 md:pt-0">
        {children}
      </main>
    </div>
    </ConfirmProvider>
  );
}

function NavItem({ href, icon, label, active = false, onClick }: { href: string; icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick}>
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
