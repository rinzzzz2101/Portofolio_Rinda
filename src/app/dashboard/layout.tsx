"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, FolderKanban, Code2, Briefcase, GraduationCap, FileText, Mail, Settings, LogOut, Users, BookOpen, Menu, X, ScrollText, Sun, Moon } from "lucide-react";
import { ConfirmProvider } from "@/components/ui/confirm-provider";
import { logoutAdmin } from "@/actions/auth";
import { useTheme } from "@/components/ui/theme-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    // Hapus cookie auth dari sisi browser
    document.cookie = "dummy_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0;";
    try {
      await logoutAdmin();
    } catch (e) {
      console.error("Logout error:", e);
    }
    // Redirect ke login
    router.push("/login");
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <ConfirmProvider>
    <div 
      className="h-screen flex overflow-hidden print:h-auto print:overflow-visible print:bg-white print:text-black transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      
      {/* Mobile Header */}
      <div 
        className="md:hidden fixed top-0 left-0 right-0 h-16 border-b z-50 flex items-center justify-between px-6 backdrop-blur-md no-print transition-colors"
        style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--border-default)' }}
      >
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Panel</h2>
        <div className="flex items-center gap-2">
          <button
            suppressHydrationWarning
            onClick={toggleTheme}
            className="p-2 rounded-lg transition"
            style={{ color: 'var(--text-secondary)' }}
            title={mounted && theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          >
            {mounted && theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            suppressHydrationWarning 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm no-print"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`w-64 shrink-0 border-r flex flex-col h-full fixed md:relative z-40 transition-all duration-300 no-print ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        <div className="p-6 border-b hidden md:block" style={{ borderColor: 'var(--border-default)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Panel</h2>
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
          <NavItem onClick={closeMenu} href="/dashboard/surat-lamaran" icon={<ScrollText size={20} />} label="Surat Lamaran" active={pathname === "/dashboard/surat-lamaran"} />
        </nav>

        <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--border-default)' }}>
          <NavItem onClick={closeMenu} href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" active={pathname === "/dashboard/settings"} />
          {/* Theme Toggle Button */}
          <button
            suppressHydrationWarning
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full p-3 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {mounted && theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">{mounted && theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>
          <button 
            suppressHydrationWarning
            onClick={handleLogout} 
            className="flex items-center gap-3 w-full p-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className="flex-1 overflow-y-auto h-full pt-16 md:pt-0 print:p-0 print:m-0 print:bg-white print:overflow-visible print:h-auto transition-colors"
        style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
      >
        {children}
      </main>
    </div>
    </ConfirmProvider>
  );
}

function NavItem({ href, icon, label, active = false, onClick }: { href: string; icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick}>
      <div 
        className="flex items-center gap-3 p-3 rounded-lg transition-all"
        style={{
          backgroundColor: active ? 'var(--bg-hover)' : 'transparent',
          color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
          border: active ? '1px solid var(--border-default)' : '1px solid transparent',
          fontWeight: active ? '600' : '500'
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }
        }}
      >
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
}
