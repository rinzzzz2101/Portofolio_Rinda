"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Download, Github, Linkedin, Twitter, Instagram, Facebook, Youtube, Link as LinkIcon, Mail, MapPin, ExternalLink, Briefcase, Menu, X, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";

import { getProjects } from "@/actions/projects";
import { getSkills } from "@/actions/skills";
import { getExperiences } from "@/actions/experiences";
import { createMessage } from "@/actions/contacts";
import { registerProfileView } from "@/actions/analytics";
import { getEducations } from "@/actions/educations";
import { getOrganizations } from "@/actions/organizations";
import { getCertificates } from "@/actions/certificates";
import { getBlogs } from "@/actions/blogs";
import { getSettings } from "@/actions/settings";
import { getSocialLinks } from "@/actions/socials";
import { useToast } from "@/components/ui/toast-provider";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function Home() {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hero, setHero] = useState({
    name: "",
    role: "",
    hireStatus: "",
    description: "",
  });
  const [about, setAbout] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [cvFileName, setCvFileName] = useState("");
  const [skills, setSkills] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [settingEmail, setSettingEmail] = useState("");
  const [settingLocation, setSettingLocation] = useState("");
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [cvActive, setCvActive] = useState(true);
  const [socialActive, setSocialActive] = useState(true);
  const [activeSections, setActiveSections] = useState({
    overview: true,
    projects: true,
    skills: true,
    experience: true,
    education: true,
    organizations: true,
    certificates: true,
    blogs: true,
    messages: true,
  });
  const [siteTitle, setSiteTitle] = useState("Portfolio.");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [skillFilter, setSkillFilter] = useState<"Semua" | "Hard Skill" | "Soft Skill">("Semua");

  // Load settings and DB data
  useEffect(() => {
    registerProfileView().catch(() => {});

    const loadAll = async () => {
      try {
        // Load Settings from DB
        const settingsRes = await getSettings();
        if (settingsRes.success && settingsRes.data) {
          const s = settingsRes.data;
          setHero({
            name: s.name || "",
            role: s.role || "",
            hireStatus: s.hireStatus || "",
            description: s.description || "",
          });
          setAbout(s.about || "");
          setCvUrl(s.cvUrl || "");
          setCvFileName(s.cvFileName || "CV.pdf");
          setSettingEmail(s.email || "");
          setSettingLocation(s.location || "");
          setCvActive(s.cvActive !== undefined ? s.cvActive : true);
          setSocialActive(s.socialActive !== undefined ? s.socialActive : true);
          setActiveSections({
            overview: s.overviewActive !== undefined ? s.overviewActive : true,
            projects: s.projectsActive !== undefined ? s.projectsActive : true,
            skills: s.skillsActive !== undefined ? s.skillsActive : true,
            experience: s.experienceActive !== undefined ? s.experienceActive : true,
            education: s.educationActive !== undefined ? s.educationActive : true,
            organizations: s.organizationsActive !== undefined ? s.organizationsActive : true,
            certificates: s.certificatesActive !== undefined ? s.certificatesActive : true,
            blogs: s.blogsActive !== undefined ? s.blogsActive : true,
            messages: s.messagesActive !== undefined ? s.messagesActive : true,
          });
          setSiteTitle(s.siteTitle || "Portfolio.");
          setFaviconUrl(s.faviconUrl || "");

          // Dynamically update document title & favicon
          if (typeof document !== "undefined") {
            document.title = s.siteTitle || "Portfolio.";
            if (s.faviconUrl) {
              try {
                // Remove existing icon links safely
                const existingLinks = document.querySelectorAll("link[rel~='icon']");
                existingLinks.forEach(el => (el as Element).remove());

                const link = document.createElement('link');
                link.rel = 'icon';
                link.href = s.faviconUrl;
                document.head.appendChild(link);
              } catch (e) {
                console.warn("Favicon update failed:", e);
              }
            }
          }
        }

        // Fetch Database Data
        const [projRes, skillRes, expRes, eduRes, orgRes, certRes, blogRes, socialRes] = await Promise.all([
          getProjects(),
          getSkills(),
          getExperiences(),
          getEducations(),
          getOrganizations(),
          getCertificates(),
          getBlogs(true),
          getSocialLinks(),
        ]);
        if (projRes.success) setProjects(projRes.data);
        if (skillRes.success) setSkills(skillRes.data);
        if (expRes.success) setExperiences(expRes.data);
        if (eduRes.success) setEducations(eduRes.data);
        if (orgRes.success) setOrganizations(orgRes.data);
        if (certRes.success) setCertificates(certRes.data);
        if (blogRes.success) setBlogs(blogRes.data);
        if (socialRes.success) setSocialLinks(socialRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setMounted(true);
      }
    };

    loadAll();
  }, []);

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("github")) return <Github className="w-6 h-6 hover:text-white cursor-pointer transition-colors" />;
    if (p.includes("linkedin")) return <Linkedin className="w-6 h-6 hover:text-white cursor-pointer transition-colors" />;
    if (p.includes("twitter") || p.includes("x")) return <Twitter className="w-6 h-6 hover:text-white cursor-pointer transition-colors" />;
    if (p.includes("instagram")) return <Instagram className="w-6 h-6 hover:text-white cursor-pointer transition-colors" />;
    if (p.includes("facebook")) return <Facebook className="w-6 h-6 hover:text-white cursor-pointer transition-colors" />;
    if (p.includes("youtube")) return <Youtube className="w-6 h-6 hover:text-white cursor-pointer transition-colors" />;
    return <LinkIcon className="w-6 h-6 hover:text-white cursor-pointer transition-colors" />;
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const res = await createMessage(contactForm);
    setSending(false);
    if (res.success) {
      toast("Pesan Anda berhasil dikirim!", "success");
      setContactForm({ name: "", email: "", message: "" });
    } else {
      toast("Gagal mengirim pesan. Pastikan database terhubung.", "error");
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <div className="z-10 flex flex-col items-center gap-6">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-default)', borderTopColor: 'var(--text-primary)' }} />
          <div className="space-y-1 text-center">
            <h3 className="text-lg font-bold tracking-widest uppercase" style={{ color: 'var(--text-primary)' }}>
              PORTFOLIO.
            </h3>
            <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Menyiapkan pengalaman terbaik...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 glass border-b backdrop-blur-md" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>{siteTitle}</span>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {activeSections.overview && <a href="#about" className="transition hover:opacity-70">About</a>}
            {activeSections.skills && <a href="#skills" className="transition hover:opacity-70">Skills</a>}
            {activeSections.education && <a href="#education" className="transition hover:opacity-70">Pendidikan</a>}
            {activeSections.experience && <a href="#experience" className="transition hover:opacity-70">Experience</a>}
            {activeSections.projects && <a href="#projects" className="transition hover:opacity-70">Projects</a>}
            {activeSections.certificates && certificates.length > 0 && <a href="#certificates" className="transition hover:opacity-70">Sertifikat</a>}
            {activeSections.blogs && blogs.length > 0 && <a href="#blog" className="transition hover:opacity-70">Blog</a>}
            {activeSections.messages && <a href="#contact" className="transition hover:opacity-70">Contact</a>}

            {/* Theme Toggle Button - Desktop */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="ml-2 p-2 rounded-full border transition-all hover:scale-110"
              style={{
                backgroundColor: 'var(--bg-muted)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-secondary)',
              }}
            >
              {theme === 'dark'
                ? <Sun size={16} className="text-yellow-400" />
                : <Moon size={16} className="text-indigo-500" />
              }
            </button>
          </div>

          {/* Mobile: Theme Toggle + Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-full border transition-all"
              style={{
                backgroundColor: 'var(--bg-muted)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-secondary)',
              }}
            >
              {theme === 'dark'
                ? <Sun size={16} className="text-yellow-400" />
                : <Moon size={16} className="text-indigo-500" />
              }
            </button>
            <button 
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t backdrop-blur-xl absolute w-full left-0 top-16 shadow-2xl" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--border-default)' }}>
            <div className="flex flex-col px-6 py-4 space-y-1 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {activeSections.overview && <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 border-b hover:opacity-70 transition" style={{ borderColor: 'var(--border-subtle)' }}>About</a>}
              {activeSections.skills && <a href="#skills" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 border-b hover:opacity-70 transition" style={{ borderColor: 'var(--border-subtle)' }}>Skills</a>}
              {activeSections.experience && <a href="#experience" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 border-b hover:opacity-70 transition" style={{ borderColor: 'var(--border-subtle)' }}>Experience</a>}
              {activeSections.projects && <a href="#projects" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 border-b hover:opacity-70 transition" style={{ borderColor: 'var(--border-subtle)' }}>Projects</a>}
              {activeSections.education && <a href="#education" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 border-b hover:opacity-70 transition" style={{ borderColor: 'var(--border-subtle)' }}>Pendidikan</a>}
              {activeSections.certificates && certificates.length > 0 && <a href="#certificates" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 border-b hover:opacity-70 transition" style={{ borderColor: 'var(--border-subtle)' }}>Sertifikat</a>}
              {activeSections.blogs && blogs.length > 0 && <a href="#blog" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 border-b hover:opacity-70 transition" style={{ borderColor: 'var(--border-subtle)' }}>Blog</a>}
              {activeSections.messages && <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 hover:opacity-70 transition">Contact</a>}
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      {activeSections.overview && (
        <section id="hero" className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center justify-center overflow-hidden">
          <motion.div 
            initial="hidden" animate="visible" variants={fadeInUp}
            className="z-10 max-w-3xl text-center space-y-6"
          >
            {hero.hireStatus && (
              <div className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4" style={{ border: '1px solid var(--border-default)', background: 'var(--card-bg)', color: 'var(--text-secondary)' }}>
                {hero.hireStatus}
              </div>
            )}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter" style={{ color: 'var(--text-primary)' }}>
              Hi, I'm {hero.name}.<br/>
              <span style={{ color: 'var(--text-secondary)' }}>
                {hero.role}
              </span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              {hero.description}
            </p>

            {cvActive && (
              <div className="flex items-center justify-center gap-4 pt-6">
                {activeSections.projects && (
                  <a href="#projects" className="btn-primary inline-flex items-center px-8 py-3 text-base">
                    View Work <ArrowRight className="ml-2 w-4 h-4" />
                  </a>
                )}
                {cvUrl ? (
                  <a href={cvUrl} download={cvFileName || "CV_Resume"} target="_blank" rel="noopener noreferrer"
                    className="btn-outline inline-flex items-center px-8 py-3 text-base">
                    <Download className="mr-2 w-4 h-4" /> Download CV / Resume
                  </a>
                ) : null}
              </div>
            )}

            {!cvActive && activeSections.projects && (
              <div className="flex items-center justify-center gap-4 pt-6">
                <a href="#projects" className="btn-primary inline-flex items-center px-8 py-3 text-base">
                  View Work <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </div>
            )}

            {socialActive && socialLinks.length > 0 && (
              <div className="flex justify-center gap-6 pt-12 t-muted">
                {socialLinks.map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" title={link.platform}
                    className="t-muted hover:opacity-70 transition">
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </section>
      )}

      <div className="max-w-6xl mx-auto px-6 space-y-32 pb-32">
        
        {/* ABOUT & SKILLS SECTION */}
        {(activeSections.overview || activeSections.skills) && (
          <section id="about" className={`grid ${activeSections.overview && activeSections.skills ? "md:grid-cols-2" : "grid-cols-1 max-w-3xl mx-auto"} gap-12 items-center`}>
            {activeSections.overview && (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold t-primary">Tentang Saya</h2>
                <p className="t-secondary leading-relaxed text-lg">{about}</p>
                <div className="flex items-center gap-4 t-muted">
                  {settingLocation && <div className="flex items-center gap-2"><MapPin size={18} className="t-muted"/>{settingLocation}</div>}
                  {settingEmail && <div className="flex items-center gap-2"><Mail size={18} className="t-muted"/>{settingEmail}</div>}
                </div>
              </motion.div>
            )}

            {activeSections.skills && (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} id="skills" className="space-y-6 glass p-8 rounded-2xl">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-2xl font-bold t-primary">Keahlian</h3>
                  <div className="flex gap-2">
                    {(["Semua", "Hard Skill", "Soft Skill"] as const).map((f) => (
                      <button key={f} onClick={() => setSkillFilter(f)}
                        style={skillFilter === f ? {
                          backgroundColor: 'var(--btn-primary-bg)',
                          color: 'var(--btn-primary-fg)',
                          borderColor: 'var(--btn-primary-bg)',
                        } : {
                          backgroundColor: 'transparent',
                          color: 'var(--text-muted)',
                          borderColor: 'var(--border-default)',
                        }}
                        className="px-3 py-1 rounded-full text-xs font-medium border transition-all hover:opacity-80">
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  {skills.length === 0 ? (
                    <div className="t-muted text-sm italic">Belum ada skill yang ditambahkan.</div>
                  ) : (
                    skills
                      .filter((s: any) => skillFilter === "Semua" || s.category === skillFilter)
                      .map((skill: any) => (
                        <div key={skill.id}>
                          <div className="flex justify-between mb-2 text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full inline-block skill-fill" />
                              <span className="t-primary">{skill.name}</span>
                              <span className="tag">{skill.category}</span>
                            </div>
                            <span className="t-muted">{skill.level}%</span>
                          </div>
                          <div className="h-1.5 w-full skill-track rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }} whileInView={{ width: `${skill.level}%` }} transition={{ duration: 1, delay: 0.2 }}
                              className="h-full rounded-full skill-fill"
                            />
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </motion.div>
            )}
          </section>
        )}

        {/* EDUCATION & ORGANIZATION SECTION */}
        {(activeSections.education || activeSections.organizations) && (
          <section id="education" className="space-y-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold t-primary">Pendidikan & Organisasi</h2>
              <p className="t-muted">Latar belakang akademis dan pengalaman berorganisasi.</p>
            </motion.div>

            <div className={`grid ${activeSections.education && activeSections.organizations ? "md:grid-cols-2" : "grid-cols-1 max-w-3xl mx-auto"} gap-12`}>
              {activeSections.education && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 t-primary"><span className="w-2 h-2 skill-fill rounded-full inline-block"></span> Pendidikan</h3>
                  {educations.length === 0 ? (
                    <p className="t-muted italic text-sm">Belum ada data pendidikan.</p>
                  ) : (
                    <div className="space-y-4">
                      {educations.map((edu: any) => (
                        <motion.div key={edu.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                          className="p-5 panel hover:shadow-sm transition-all">
                          <div className="font-bold text-lg t-primary">{edu.institution}</div>
                          <div className="t-secondary text-sm font-medium mt-1">{edu.degree}{edu.fieldOfStudy ? ` • ${edu.fieldOfStudy}` : ""}</div>
                          <div className="t-muted text-xs mt-1">Angkatan {new Date(edu.startDate).getFullYear()}</div>
                          {edu.description && <p className="t-secondary text-sm mt-2 leading-relaxed">{edu.description}</p>}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSections.organizations && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 t-primary"><span className="w-2 h-2 skill-fill rounded-full inline-block"></span> Organisasi</h3>
                  {organizations.length === 0 ? (
                    <p className="t-muted italic text-sm">Belum ada data organisasi.</p>
                  ) : (
                    <div className="space-y-4">
                      {organizations.map((org: any) => (
                        <motion.div key={org.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                          className="p-5 panel hover:shadow-sm transition-all">
                          <div className="font-bold text-lg t-primary">{org.name}</div>
                          <div className="t-secondary text-sm font-medium mt-1">{org.role}</div>
                          <div className="t-muted text-xs mt-1">
                            {new Date(org.startDate).getFullYear()} — {org.endDate ? new Date(org.endDate).getFullYear() : "Sekarang"}
                          </div>
                          {org.description && <p className="t-secondary text-sm mt-2 leading-relaxed">{org.description}</p>}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* EXPERIENCE SECTION */}
        {activeSections.experience && (
          <section id="experience" className="space-y-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold t-primary">Pengalaman Kerja</h2>
              <p className="t-muted">Perjalanan karir profesional saya sejauh ini.</p>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-8 relative timeline-line before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5">
              {experiences.length === 0 ? (
                <div className="text-center t-muted italic py-8">Belum ada data pengalaman kerja.</div>
              ) : (
                experiences.map((exp: any) => (
                  <motion.div key={exp.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} 
                    className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 timeline-dot">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="panel w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 hover:shadow-md">
                      <div className="font-bold text-lg t-primary mb-1">{exp.position}</div>
                      <div className="t-secondary text-sm font-medium mb-3">{exp.company} • {new Date(exp.startDate).toLocaleDateString("id-ID", { year: "numeric", month: "short" })}</div>
                      <p className="t-secondary text-sm leading-relaxed">{exp.description}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        )}

        {/* PROJECTS SECTION */}
        {activeSections.projects && (
          <section id="projects" className="space-y-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold t-primary">Featured Projects</h2>
              <p className="t-muted">Karya terbaik yang pernah saya buat.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.length === 0 ? (
                <div className="col-span-full empty-state">Belum ada project yang dipublikasikan.</div>
              ) : (
                projects.map((project: any) => (
                  <motion.div key={project.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <div className="panel h-full flex flex-col justify-between hover:shadow-md">
                      <div>
                        <div className="h-48 rounded-t-xl flex items-center justify-center border-b overflow-hidden" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-subtle)' }}>
                          {project.thumbnail ? (
                            <img src={project.thumbnail} alt={project.title} className="w-full h-full object-contain" />
                          ) : (
                            <span className="t-dim font-medium">No Image</span>
                          )}
                        </div>
                        <div className="p-5 space-y-3">
                          <h3 className="font-bold text-lg t-primary">{project.title}</h3>
                          <p className="t-secondary text-sm leading-relaxed">{project.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((t: string) => (
                              <span key={t} className="tag">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between border-t px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
                        {project.githubUrl ? (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm t-muted hover:opacity-70 transition">
                            <Github className="w-4 h-4" /> Code
                          </a>
                        ) : <div />}
                        {project.demoUrl ? (
                          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm t-muted hover:opacity-70 transition">
                            <ExternalLink className="w-4 h-4" /> Demo
                          </a>
                        ) : <div />}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        )}

        {/* CERTIFICATES SECTION */}
        {activeSections.certificates && certificates.length > 0 && (
          <section id="certificates" className="space-y-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold t-primary">Sertifikat & Penghargaan</h2>
              <p className="t-muted">Pengakuan resmi atas keahlian dan kompetensi yang dimiliki.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert: any) => (
                <motion.div key={cert.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                  <div className="panel p-6 space-y-3 h-full hover:shadow-md">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 t-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h3 className="font-bold t-primary leading-snug">{cert.name}</h3>
                      <p className="t-secondary text-sm mt-1">{cert.issuer}</p>
                      <p className="t-muted text-xs mt-1">{new Date(cert.issueDate).toLocaleDateString("id-ID", { year: "numeric", month: "long" })}</p>
                    </div>
                    {cert.pdfUrl && (
                      <button 
                        onClick={() => setSelectedCert(cert)}
                        className="inline-flex items-center gap-1.5 text-xs t-secondary hover:opacity-70 transition font-medium cursor-pointer hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Lihat Sertifikat
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* BLOG SECTION */}
        {activeSections.blogs && blogs.length > 0 && (
          <section id="blog" className="space-y-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold t-primary">Tulisan Terbaru</h2>
              <p className="t-muted">Insight dan pengalaman yang saya bagikan secara terbuka.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog: any) => (
                <motion.div key={blog.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                  <div className="panel p-6 space-y-3 h-full flex flex-col hover:shadow-md">
                    <div className="flex items-center gap-2">
                      <span className="badge-muted">{blog.category}</span>
                    </div>
                    <h3 className="font-bold t-primary text-lg leading-snug flex-1">{blog.title}</h3>
                    <p className="t-secondary text-sm line-clamp-3">{blog.content}</p>
                    <div className="flex items-center justify-between pt-2 border-t text-xs t-muted" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span>{new Date(blog.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</span>
                      {blog.tags && <span className="t-dim">{blog.tags}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {activeSections.messages && (
          <section id="contact" className="max-w-2xl mx-auto space-y-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold t-primary">Hubungi Saya</h2>
              <p className="t-muted">Ada proyek menarik? Mari berdiskusi.</p>
            </motion.div>
            <motion.form onSubmit={handleContactSubmit} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="panel p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium t-secondary">Nama Lengkap</label>
                  <input required value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} placeholder="John Doe"
                    className="input-t flex w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium t-secondary">Email</label>
                  <input type="email" required value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} placeholder="john@example.com"
                    className="input-t flex w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium t-secondary">Pesan</label>
                <textarea 
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="input-t flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none resize-none"
                  placeholder="Ceritakan tentang proyek Anda..."
                />
              </div>
              <button disabled={sending} type="submit" className="btn-primary w-full py-3 text-sm inline-flex items-center justify-center gap-2">
                {sending ? "Mengirim..." : "Kirim Pesan"} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          </section>
        )}

      </div>
      
      {/* FOOTER */}
      <footer className="border-t py-8 text-center text-sm" style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
        <p>© {new Date().getFullYear()} {hero.name}. All rights reserved.</p>
      </footer>
      {/* Certificate Modal Overlay */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setSelectedCert(null)}>
          <div className="relative max-w-2xl w-full rounded-2xl overflow-hidden p-6 shadow-2xl space-y-4 panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-xl t-primary">{selectedCert.name}</h3>
                <p className="t-secondary text-sm mt-1">{selectedCert.issuer}</p>
              </div>
              <button className="t-muted hover:opacity-70 p-1 transition" onClick={() => setSelectedCert(null)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-full min-h-[300px] h-[450px] flex items-center justify-center rounded-xl overflow-hidden relative p-1" style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}>
              {selectedCert.pdfUrl.startsWith("data:application/pdf") || selectedCert.pdfUrl.endsWith(".pdf") ? (
                <iframe src={selectedCert.pdfUrl} className="w-full h-full rounded-lg border-0 bg-white" title={selectedCert.name} />
              ) : (
                <img src={selectedCert.pdfUrl} alt={selectedCert.name} className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <a 
                href={selectedCert.pdfUrl} 
                download={`sertifikat-${selectedCert.name.toLowerCase().replace(/\s+/g, '-')}${selectedCert.pdfUrl.startsWith("data:application/pdf") || selectedCert.pdfUrl.endsWith(".pdf") ? ".pdf" : ".jpg"}`}
                className="btn-primary inline-flex items-center justify-center px-4 py-2 text-sm rounded-lg"
              >
                Download Dokumen
              </a>
              <button 
                onClick={() => setSelectedCert(null)}
                className="btn-outline px-4 py-2 rounded-lg text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
