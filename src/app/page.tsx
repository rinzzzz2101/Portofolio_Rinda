"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Download, Github, Linkedin, Twitter, Instagram, Facebook, Youtube, Link as LinkIcon, Mail, MapPin, ExternalLink, Briefcase, Menu, X } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
              // Remove existing icon links to bypass browser static build caching
              const existingLinks = document.querySelectorAll("link[rel~='icon']");
              existingLinks.forEach(el => el.parentNode?.removeChild(el));

              const link = document.createElement('link');
              link.rel = 'icon';
              link.href = s.faviconUrl;
              document.getElementsByTagName('head')[0].appendChild(link);
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
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center relative overflow-hidden">
        <div className="z-10 flex flex-col items-center gap-6">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-200 rounded-full animate-spin" />
          <div className="space-y-1 text-center">
            <h3 className="text-lg font-bold tracking-widest text-zinc-100 uppercase">
              PORTFOLIO.
            </h3>
            <p className="text-xs text-zinc-500 font-medium tracking-wide">
              Menyiapkan pengalaman terbaik...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-zinc-800">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-zinc-850 bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-xl tracking-tight">{siteTitle}</span>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 text-sm font-medium text-zinc-400">
            {activeSections.overview && <a href="#about" className="hover:text-white transition">About</a>}
            {activeSections.skills && <a href="#skills" className="hover:text-white transition">Skills</a>}
            {activeSections.education && <a href="#education" className="hover:text-white transition">Pendidikan</a>}
            {activeSections.experience && <a href="#experience" className="hover:text-white transition">Experience</a>}
            {activeSections.projects && <a href="#projects" className="hover:text-white transition">Projects</a>}
            {activeSections.certificates && certificates.length > 0 && <a href="#certificates" className="hover:text-white transition">Sertifikat</a>}
            {activeSections.blogs && blogs.length > 0 && <a href="#blog" className="hover:text-white transition">Blog</a>}
            {activeSections.messages && <a href="#contact" className="hover:text-white transition">Contact</a>}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-zinc-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-[#09090b]/95 backdrop-blur-xl absolute w-full left-0 top-16 shadow-2xl">
            <div className="flex flex-col px-6 py-4 space-y-4 text-sm font-medium text-zinc-400">
              {activeSections.overview && <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-white py-2 border-b border-zinc-850">About</a>}
              {activeSections.skills && <a href="#skills" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-white py-2 border-b border-zinc-850">Skills</a>}
              {activeSections.experience && <a href="#experience" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-white py-2 border-b border-zinc-850">Experience</a>}
              {activeSections.projects && <a href="#projects" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-white py-2 border-b border-zinc-850">Projects</a>}
              {activeSections.education && <a href="#education" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-white py-2 border-b border-zinc-850">Pendidikan</a>}
              {activeSections.certificates && certificates.length > 0 && <a href="#certificates" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-white py-2 border-b border-zinc-850">Sertifikat</a>}
              {activeSections.blogs && blogs.length > 0 && <a href="#blog" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-white py-2 border-b border-zinc-850">Blog</a>}
              {activeSections.messages && <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-white py-2">Contact</a>}
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
              <div className="inline-block px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-300 text-sm font-medium mb-4">
                {hero.hireStatus}
              </div>
            )}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
              Hi, I'm {hero.name}.<br/>
              <span className="text-zinc-400">
                {hero.role}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-450 max-w-2xl mx-auto">
              {hero.description}
            </p>

            {cvActive && (
              <div className="flex items-center justify-center gap-4 pt-6">
                {activeSections.projects && (
                  <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-full px-8" asChild>
                    <a href="#projects" className="flex items-center">View Work <ArrowRight className="ml-2 w-4 h-4" /></a>
                  </Button>
                )}
                {cvUrl ? (
                  <Button size="lg" variant="outline" className="border-zinc-800 hover:bg-zinc-900 rounded-full px-8 bg-transparent text-zinc-300 hover:text-white" asChild>
                    <a href={cvUrl} download={cvFileName || "CV_Resume"} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <Download className="mr-2 w-4 h-4" /> Download CV / Resume
                    </a>
                  </Button>
                ) : null}
              </div>
            )}

            {!cvActive && activeSections.projects && (
              <div className="flex items-center justify-center gap-4 pt-6">
                <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-full px-8" asChild>
                  <a href="#projects" className="flex items-center">View Work <ArrowRight className="ml-2 w-4 h-4" /></a>
                </Button>
              </div>
            )}

            {socialActive && socialLinks.length > 0 && (
              <div className="flex justify-center gap-6 pt-12 text-zinc-500">
                {socialLinks.map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" title={link.platform}>
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
                <h2 className="text-3xl md:text-4xl font-bold">Tentang Saya</h2>
                <p className="text-gray-400 leading-relaxed text-lg">
                  {about}
                </p>
                <div className="flex items-center gap-4 text-zinc-400">
                  {settingLocation && <div className="flex items-center gap-2"><MapPin size={18} className="text-zinc-400"/>{settingLocation}</div>}
                  {settingEmail && <div className="flex items-center gap-2"><Mail size={18} className="text-zinc-400"/>{settingEmail}</div>}
                </div>
              </motion.div>
            )}

            {activeSections.skills && (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} id="skills" className="space-y-6 glass p-8 rounded-2xl">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-2xl font-bold text-white">Keahlian</h3>
                  <div className="flex gap-2">
                    {(["Semua", "Hard Skill", "Soft Skill"] as const).map((f) => (
                      <button key={f} onClick={() => setSkillFilter(f)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                          skillFilter === f
                            ? "bg-zinc-100 border-zinc-100 text-zinc-950"
                            : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                        }`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  {skills.length === 0 ? (
                    <div className="text-zinc-500 text-sm italic">Belum ada skill yang ditambahkan.</div>
                  ) : (
                    skills
                      .filter((s: any) => skillFilter === "Semua" || s.category === skillFilter)
                      .map((skill: any) => (
                        <div key={skill.id}>
                          <div className="flex justify-between mb-2 text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full inline-block bg-zinc-400" />
                              <span className="text-zinc-200">{skill.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400">{skill.category}</span>
                            </div>
                            <span className="text-zinc-400">{skill.level}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }} whileInView={{ width: `${skill.level}%` }} transition={{ duration: 1, delay: 0.2 }}
                              className="h-full rounded-full bg-zinc-350"
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
              <h2 className="text-3xl md:text-4xl font-bold text-white">Pendidikan & Organisasi</h2>
              <p className="text-zinc-400">Latar belakang akademis dan pengalaman berorganisasi.</p>
            </motion.div>

            <div className={`grid ${activeSections.education && activeSections.organizations ? "md:grid-cols-2" : "grid-cols-1 max-w-3xl mx-auto"} gap-12`}>
              {/* Pendidikan */}
              {activeSections.education && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-zinc-200"><span className="w-2 h-2 bg-zinc-350 rounded-full inline-block"></span> Pendidikan</h3>
                  {educations.length === 0 ? (
                    <p className="text-zinc-500 italic text-sm">Belum ada data pendidikan.</p>
                  ) : (
                    <div className="space-y-4">
                      {educations.map((edu: any) => (
                        <motion.div key={edu.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                          className="p-5 glass rounded-xl border border-zinc-800/80 hover:border-zinc-700/50 transition-all">
                          <div className="font-bold text-lg text-white">{edu.institution}</div>
                          <div className="text-zinc-300 text-sm font-medium mt-1">{edu.degree}{edu.fieldOfStudy ? ` • ${edu.fieldOfStudy}` : ""}</div>
                          <div className="text-zinc-500 text-xs mt-1">
                            Angkatan {new Date(edu.startDate).getFullYear()}
                          </div>
                          {edu.description && <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{edu.description}</p>}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Organisasi */}
              {activeSections.organizations && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-zinc-200"><span className="w-2 h-2 bg-zinc-350 rounded-full inline-block"></span> Organisasi</h3>
                  {organizations.length === 0 ? (
                    <p className="text-zinc-500 italic text-sm">Belum ada data organisasi.</p>
                  ) : (
                    <div className="space-y-4">
                      {organizations.map((org: any) => (
                        <motion.div key={org.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                          className="p-5 glass rounded-xl border border-zinc-800/80 hover:border-zinc-700/50 transition-all">
                          <div className="font-bold text-lg text-white">{org.name}</div>
                          <div className="text-zinc-300 text-sm font-medium mt-1">{org.role}</div>
                          <div className="text-zinc-500 text-xs mt-1">
                            {new Date(org.startDate).getFullYear()} — {org.endDate ? new Date(org.endDate).getFullYear() : "Sekarang"}
                          </div>
                          {org.description && <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{org.description}</p>}
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
              <h2 className="text-3xl md:text-4xl font-bold text-white">Pengalaman Kerja</h2>
              <p className="text-zinc-400">Perjalanan karir profesional saya sejauh ini.</p>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-zinc-800">
              {experiences.length === 0 ? (
                <div className="text-center text-zinc-550 italic py-8">Belum ada data pengalaman kerja.</div>
              ) : (
                experiences.map((exp: any) => (
                  <motion.div key={exp.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} 
                    className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-800 bg-[#09090b] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_#09090b] z-10">
                      <Briefcase className="w-4 h-4 text-zinc-400" />
                    </div>
                    <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-zinc-900/40 border-zinc-850 p-5">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-bold text-lg text-white">{exp.position}</div>
                      </div>
                      <div className="text-zinc-350 text-sm font-medium mb-3">{exp.company} • {new Date(exp.startDate).toLocaleDateString("id-ID", { year: "numeric", month: "short" })}</div>
                      <p className="text-zinc-400 text-sm leading-relaxed">{exp.description}</p>
                    </Card>
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
              <h2 className="text-3xl md:text-4xl font-bold text-white">Featured Projects</h2>
              <p className="text-zinc-400">Karya terbaik yang pernah saya buat.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.length === 0 ? (
                <div className="col-span-full text-center text-zinc-550 italic py-12 border border-dashed border-zinc-800 rounded-xl">
                  Belum ada project yang dipublikasikan.
                </div>
              ) : (
                projects.map((project: any) => (
                  <motion.div key={project.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <Card className="bg-zinc-900/30 text-white border-zinc-850 hover:border-zinc-700 transition-all duration-300 h-full flex flex-col justify-between">
                      <div>
                        <div className="h-48 bg-zinc-950 rounded-t-lg flex items-center justify-center border-b border-zinc-850 overflow-hidden relative">
                          {project.thumbnail ? (
                            <img src={project.thumbnail} alt={project.title} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-zinc-600 font-medium">No Image</span>
                          )}
                        </div>
                        <CardHeader>
                          <CardTitle className="text-white">{project.title}</CardTitle>
                          <CardDescription className="text-zinc-400">{project.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((t: string) => (
                              <span key={t} className="px-2 py-1 text-xs font-medium bg-zinc-800/80 text-zinc-350 border border-zinc-750/30 rounded-md">
                                {t}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </div>
                      <CardFooter className="flex justify-between border-t border-zinc-850/50 pt-4 mt-4">
                        {project.githubUrl ? (
                          <Button variant="ghost" size="sm" asChild className="hover:bg-zinc-800/50 hover:text-white">
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="w-4 h-4 mr-2" /> Code
                            </a>
                          </Button>
                        ) : <div />}
                        {project.demoUrl ? (
                          <Button variant="ghost" size="sm" asChild className="hover:bg-zinc-800/50 hover:text-white">
                            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" /> Demo
                            </a>
                          </Button>
                        ) : <div />}
                      </CardFooter>
                    </Card>
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
              <h2 className="text-3xl md:text-4xl font-bold text-white">Sertifikat & Penghargaan</h2>
              <p className="text-zinc-400">Pengakuan resmi atas keahlian dan kompetensi yang dimiliki.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert: any) => (
                <motion.div key={cert.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                  <div className="glass p-6 rounded-2xl border border-zinc-850 hover:border-zinc-700 transition-all space-y-3 h-full">
                    <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-zinc-350" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-snug">{cert.name}</h3>
                      <p className="text-zinc-350 text-sm mt-1">{cert.issuer}</p>
                      <p className="text-zinc-550 text-xs mt-1">{new Date(cert.issueDate).toLocaleDateString("id-ID", { year: "numeric", month: "long" })}</p>
                    </div>
                    {cert.pdfUrl && (
                      <button 
                        onClick={() => setSelectedCert(cert)}
                        className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white transition-colors font-medium cursor-pointer hover:underline"
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
              <h2 className="text-3xl md:text-4xl font-bold text-white">Tulisan Terbaru</h2>
              <p className="text-zinc-400">Insight dan pengalaman yang saya bagikan secara terbuka.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog: any) => (
                <motion.div key={blog.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                  <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-850 hover:border-zinc-700 transition-all space-y-3 h-full flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium">
                        {blog.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-lg leading-snug flex-1">{blog.title}</h3>
                    <p className="text-zinc-400 text-sm line-clamp-3">{blog.content}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-850 text-xs text-zinc-550">
                      <span>{new Date(blog.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</span>
                      {blog.tags && <span className="text-zinc-500">{blog.tags}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* CONTACT SECTION */}
        {activeSections.messages && (
          <section id="contact" className="max-w-2xl mx-auto text-center space-y-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Mari Berdiskusi</h2>
              <p className="text-zinc-400">Punya ide proyek atau lowongan pekerjaan? Jangan ragu untuk menghubungi saya melalui form di bawah ini.</p>
            </motion.div>

            <motion.form onSubmit={handleContactSubmit} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass p-8 rounded-2xl space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Nama Lengkap</label>
                  <Input required value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} placeholder="John Doe" className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Email</label>
                  <Input type="email" required value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} placeholder="john@example.com" className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-400" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Pesan</label>
                <textarea 
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="flex min-h-[120px] w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm ring-offset-background placeholder:text-zinc-550 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ceritakan tentang proyek Anda..."
                />
              </div>
              <Button disabled={sending} className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-colors font-medium">
                {sending ? "Mengirim..." : "Kirim Pesan"} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.form>
          </section>
        )}

      </div>
      
      {/* FOOTER */}
      <footer className="border-t border-zinc-850 py-8 text-center text-zinc-550 text-sm">
        <p>© {new Date().getFullYear()} {hero.name}. All rights reserved.</p>
      </footer>
      {/* Certificate Modal Overlay */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4" onClick={() => setSelectedCert(null)}>
          <div className="relative max-w-2xl w-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-xl text-white">{selectedCert.name}</h3>
                <p className="text-zinc-350 text-sm mt-1">{selectedCert.issuer}</p>
              </div>
              <button className="text-zinc-400 hover:text-white p-1" onClick={() => setSelectedCert(null)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-full min-h-[300px] h-[450px] flex items-center justify-center bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden relative p-1">
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
                className="inline-flex items-center justify-center px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium rounded-lg text-sm transition"
              >
                Download Dokumen
              </a>
              <button 
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 border border-zinc-800 hover:bg-zinc-900 text-zinc-350 rounded-lg text-sm transition"
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
