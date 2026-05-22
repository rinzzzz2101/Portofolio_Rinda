"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Download, Github, Linkedin, Twitter, Mail, MapPin, ExternalLink, Briefcase } from "lucide-react";
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
import { useToast } from "@/components/ui/toast-provider";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function Home() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [hero, setHero] = useState({
    name: "Nama Anda",
    role: "Profesi / Jabatan",
    description: "Tuliskan deskripsi singkat tentang diri Anda di sini melalui Admin Dashboard.",
  });
  const [about, setAbout] = useState("Deskripsi 'Tentang Saya' belum diisi. Silakan tambahkan melalui panel admin.");
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
  const [socialLinks, setSocialLinks] = useState({ github: "", linkedin: "", twitter: "", instagram: "" });
  const [siteTitle, setSiteTitle] = useState("Portfolio.");
  const [faviconUrl, setFaviconUrl] = useState("");
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [skillFilter, setSkillFilter] = useState<"Semua" | "Hard Skill" | "Soft Skill">("Semua");

  // Load settings and DB data
  useEffect(() => {
    setMounted(true);
    registerProfileView().catch(() => {});

    const loadAll = async () => {
      // Load Settings from DB
      const settingsRes = await getSettings();
      if (settingsRes.success && settingsRes.data) {
        const s = settingsRes.data;
        setHero({
          name: s.name || "Nama Anda",
          role: s.role || "Profesi / Jabatan",
          description: s.description || "Tuliskan deskripsi singkat tentang diri Anda di sini melalui Admin Dashboard.",
        });
        setAbout(s.about || "Deskripsi 'Tentang Saya' belum diisi. Silakan tambahkan melalui panel admin.");
        setCvUrl(s.cvUrl || "");
        setCvFileName(s.cvFileName || "CV.pdf");
        setSettingEmail(s.email || "");
        setSettingLocation(s.location || "");
        setSocialLinks({
          github: s.github || "",
          linkedin: s.linkedin || "",
          twitter: s.twitter || "",
          instagram: s.instagram || "",
        });
        setSiteTitle(s.siteTitle || "Portfolio.");
        setFaviconUrl(s.faviconUrl || "");

        // Dynamically update document title & favicon
        if (typeof document !== "undefined") {
          document.title = s.siteTitle || "Portfolio.";
          if (s.faviconUrl) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = s.faviconUrl;
          }
        }
      }

      // Fetch Database Data
      const [projRes, skillRes, expRes, eduRes, orgRes, certRes, blogRes] = await Promise.all([
        getProjects(),
        getSkills(),
        getExperiences(),
        getEducations(),
        getOrganizations(),
        getCertificates(),
        getBlogs(true),
      ]);
      if (projRes.success) setProjects(projRes.data);
      if (skillRes.success) setSkills(skillRes.data);
      if (expRes.success) setExperiences(expRes.data);
      if (eduRes.success) setEducations(eduRes.data);
      if (orgRes.success) setOrganizations(orgRes.data);
      if (certRes.success) setCertificates(certRes.data);
      if (blogRes.success) setBlogs(blogRes.data);
    };

    loadAll();
  }, []);

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
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden">
        {/* Glowing Backgrounds */}
        <div className="absolute top-[35%] left-[30%] w-[300px] h-[300px] bg-purple-900/10 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[35%] right-[30%] w-[300px] h-[300px] bg-blue-900/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="z-10 flex flex-col items-center gap-6">
          {/* Glowing Nested Spinner */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Outer Ring */}
            <div className="absolute inset-0 border-2 border-transparent border-t-purple-500 border-l-purple-500 rounded-full animate-spin" style={{ animationDuration: "1.2s" }} />
            {/* Inner Ring */}
            <div className="absolute w-10 h-10 border-2 border-transparent border-b-blue-400 border-r-blue-400 rounded-full animate-spin" style={{ animationDuration: "0.8s", animationDirection: "reverse" }} />
            {/* Core Dot */}
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
          </div>

          <div className="space-y-1.5 text-center">
            <h3 className="text-xl font-bold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 animate-pulse">
              PORTFOLIO.
            </h3>
            <p className="text-xs text-gray-500 font-medium tracking-wide animate-pulse" style={{ animationDelay: "0.5s" }}>
              Menyiapkan pengalaman terbaik...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      
      {/* NAVBAR (Sederhana) */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-xl tracking-tight">{siteTitle}</span>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-300">
            <a href="#about" className="hover:text-white transition">About</a>
            <a href="#skills" className="hover:text-white transition">Skills</a>
            <a href="#experience" className="hover:text-white transition">Experience</a>
            <a href="#projects" className="hover:text-white transition">Projects</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="hero" className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full z-0 pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full z-0 pointer-events-none" />

        <motion.div 
          initial="hidden" animate="visible" variants={fadeInUp}
          className="z-10 max-w-3xl text-center space-y-6"
        >
          <div className="inline-block px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium mb-4">
            Available for hire
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
            Hi, I'm {hero.name}.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
              {hero.role}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            {hero.description}
          </p>

          <div className="flex items-center justify-center gap-4 pt-6">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-full px-8" asChild>
              <a href="#projects" className="flex items-center">View Work <ArrowRight className="ml-2 w-4 h-4" /></a>
            </Button>
            {cvUrl ? (
              <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-900 rounded-full px-8 bg-transparent" asChild>
                <a href={cvUrl} download={cvFileName} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <Download className="mr-2 w-4 h-4" /> Download CV
                </a>
              </Button>
            ) : (
              <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-900 rounded-full px-8 bg-transparent opacity-50 cursor-pointer" onClick={() => toast("CV belum diunggah oleh admin.", "warning")}>
                <Download className="mr-2 w-4 h-4" /> Download CV
              </Button>
            )}
          </div>

          <div className="flex justify-center gap-6 pt-12 text-gray-500">
            {socialLinks.github ? (
              <a href={socialLinks.github} target="_blank" rel="noopener noreferrer">
                <Github className="w-6 h-6 hover:text-white cursor-pointer transition-colors" />
              </a>
            ) : <Github className="w-6 h-6 opacity-30" />}
            {socialLinks.linkedin ? (
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-6 h-6 hover:text-white cursor-pointer transition-colors" />
              </a>
            ) : <Linkedin className="w-6 h-6 opacity-30" />}
            {socialLinks.twitter ? (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                <Twitter className="w-6 h-6 hover:text-white cursor-pointer transition-colors" />
              </a>
            ) : <Twitter className="w-6 h-6 opacity-30" />}
          </div>
        </motion.div>
      </section>

      <div className="max-w-6xl mx-auto px-6 space-y-32 pb-32">
        
        {/* ABOUT & SKILLS SECTION */}
        <section id="about" className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Tentang Saya</h2>
            <p className="text-gray-400 leading-relaxed text-lg">
              {about}
            </p>
            <div className="flex items-center gap-4 text-gray-400">
              {settingLocation && <div className="flex items-center gap-2"><MapPin size={18} className="text-purple-400"/>{settingLocation}</div>}
              {settingEmail && <div className="flex items-center gap-2"><Mail size={18} className="text-blue-400"/>{settingEmail}</div>}
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} id="skills" className="space-y-6 glass p-8 rounded-2xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-2xl font-bold">Keahlian</h3>
              <div className="flex gap-2">
                {(["Semua", "Hard Skill", "Soft Skill"] as const).map((f) => (
                  <button key={f} onClick={() => setSkillFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      skillFilter === f
                        ? f === "Soft Skill" ? "bg-blue-600/20 border-blue-500 text-blue-300" : "bg-purple-600/20 border-purple-500 text-purple-300"
                        : "border-gray-700 text-gray-400 hover:border-gray-600"
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {skills.length === 0 ? (
                <div className="text-gray-500 text-sm italic">Belum ada skill yang ditambahkan.</div>
              ) : (
                skills
                  .filter((s: any) => skillFilter === "Semua" || s.category === skillFilter)
                  .map((skill: any) => (
                    <div key={skill.id}>
                      <div className="flex justify-between mb-2 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full inline-block ${skill.category === "Hard Skill" ? "bg-purple-400" : "bg-blue-400"}`} />
                          <span>{skill.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                            skill.category === "Hard Skill" ? "text-purple-400 border-purple-500/30 bg-purple-500/10" : "text-blue-400 border-blue-500/30 bg-blue-500/10"
                          }`}>{skill.category}</span>
                        </div>
                        <span className={skill.category === "Hard Skill" ? "text-purple-400" : "text-blue-400"}>{skill.level}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} whileInView={{ width: `${skill.level}%` }} transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full rounded-full ${skill.category === "Hard Skill" ? "bg-gradient-to-r from-purple-500 to-purple-400" : "bg-gradient-to-r from-blue-500 to-blue-400"}`}
                        />
                      </div>
                    </div>
                  ))
              )}
            </div>
          </motion.div>
        </section>

        {/* EDUCATION & ORGANIZATION SECTION */}
        <section id="education" className="space-y-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Pendidikan & Organisasi</h2>
            <p className="text-gray-400">Latar belakang akademis dan pengalaman berorganisasi.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Pendidikan */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-purple-400"><span className="w-2 h-2 bg-purple-400 rounded-full inline-block"></span> Pendidikan</h3>
              {educations.length === 0 ? (
                <p className="text-gray-500 italic text-sm">Belum ada data pendidikan.</p>
              ) : (
                <div className="space-y-4">
                  {educations.map((edu: any) => (
                    <motion.div key={edu.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                      className="p-5 glass rounded-xl border border-gray-800 hover:border-purple-500/30 transition-all">
                      <div className="font-bold text-lg text-white">{edu.institution}</div>
                      <div className="text-purple-400 text-sm font-medium mt-1">{edu.degree}{edu.fieldOfStudy ? ` • ${edu.fieldOfStudy}` : ""}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        {new Date(edu.startDate).getFullYear()} — {edu.endDate ? new Date(edu.endDate).getFullYear() : "Sekarang"}
                      </div>
                      {edu.description && <p className="text-gray-400 text-sm mt-2 leading-relaxed">{edu.description}</p>}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Organisasi */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-blue-400"><span className="w-2 h-2 bg-blue-400 rounded-full inline-block"></span> Organisasi</h3>
              {organizations.length === 0 ? (
                <p className="text-gray-500 italic text-sm">Belum ada data organisasi.</p>
              ) : (
                <div className="space-y-4">
                  {organizations.map((org: any) => (
                    <motion.div key={org.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                      className="p-5 glass rounded-xl border border-gray-800 hover:border-blue-500/30 transition-all">
                      <div className="font-bold text-lg text-white">{org.name}</div>
                      <div className="text-blue-400 text-sm font-medium mt-1">{org.role}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        {new Date(org.startDate).getFullYear()} — {org.endDate ? new Date(org.endDate).getFullYear() : "Sekarang"}
                      </div>
                      {org.description && <p className="text-gray-400 text-sm mt-2 leading-relaxed">{org.description}</p>}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* EXPERIENCE SECTION */}
        <section id="experience" className="space-y-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Pengalaman Kerja</h2>
            <p className="text-gray-400">Perjalanan karir profesional saya sejauh ini.</p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-800 before:to-transparent">
            {experiences.length === 0 ? (
              <div className="text-center text-gray-500 italic py-8">Belum ada data pengalaman kerja.</div>
            ) : (
              experiences.map((exp: any) => (
                <motion.div key={exp.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} 
                  className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-800 bg-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_black] z-10">
                    <Briefcase className="w-4 h-4 text-purple-400" />
                  </div>
                  <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card border-gray-800 p-5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-lg text-white">{exp.position}</div>
                    </div>
                    <div className="text-purple-400 text-sm font-medium mb-3">{exp.company} • {new Date(exp.startDate).toLocaleDateString("id-ID", { year: "numeric", month: "short" })}</div>
                    <p className="text-gray-400 text-sm">{exp.description}</p>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="space-y-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Projects</h2>
            <p className="text-gray-400">Karya terbaik yang pernah saya buat.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 italic py-12 border border-dashed border-gray-800 rounded-xl">
                Belum ada project yang dipublikasikan.
              </div>
            ) : (
              projects.map((project: any) => (
                <motion.div key={project.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                  <Card className="glass-card text-white border-gray-800 hover:border-purple-500/50 transition-all duration-300 h-full flex flex-col justify-between">
                    <div>
                      <div className="h-48 bg-gray-900 rounded-t-lg flex items-center justify-center border-b border-gray-800 overflow-hidden relative">
                        {project.thumbnail ? (
                          <img src={project.thumbnail} alt={project.title} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-gray-600 font-medium">No Image</span>
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription className="text-gray-400">{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((t: string) => (
                            <span key={t} className="px-2 py-1 text-xs font-medium bg-purple-500/10 text-purple-400 rounded-md">
                              {t}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </div>
                    <CardFooter className="flex justify-between border-t border-gray-800/50 pt-4 mt-4">
                      {project.githubUrl ? (
                        <Button variant="ghost" size="sm" asChild className="hover:bg-gray-800">
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" /> Code
                          </a>
                        </Button>
                      ) : <div />}
                      {project.demoUrl ? (
                        <Button variant="ghost" size="sm" asChild className="hover:bg-gray-800">
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

        {/* CERTIFICATES SECTION */}
        {certificates.length > 0 && (
          <section id="certificates" className="space-y-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Sertifikat & Penghargaan</h2>
              <p className="text-gray-400">Pengakuan resmi atas keahlian dan kompetensi yang dimiliki.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert: any) => (
                <motion.div key={cert.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                  <div className="glass p-6 rounded-2xl border border-gray-800 hover:border-purple-500/30 transition-all space-y-3 h-full">
                    <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-snug">{cert.name}</h3>
                      <p className="text-purple-400 text-sm mt-1">{cert.issuer}</p>
                      <p className="text-gray-500 text-xs mt-1">{new Date(cert.issueDate).toLocaleDateString("id-ID", { year: "numeric", month: "long" })}</p>
                    </div>
                    {cert.pdfUrl && (
                      <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
                        <ExternalLink className="w-3 h-3" /> Lihat Sertifikat
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* BLOG SECTION */}
        {blogs.length > 0 && (
          <section id="blog" className="space-y-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Tulisan Terbaru</h2>
              <p className="text-gray-400">Insight dan pengalaman yang saya bagikan secara terbuka.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog: any) => (
                <motion.div key={blog.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                  <div className="glass p-6 rounded-2xl border border-gray-800 hover:border-purple-500/30 transition-all space-y-3 h-full flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                        {blog.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-lg leading-snug flex-1">{blog.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-3">{blog.content}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs text-gray-500">
                      <span>{new Date(blog.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</span>
                      {blog.tags && <span className="text-gray-600">{blog.tags}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* CONTACT SECTION */}
        <section id="contact" className="max-w-2xl mx-auto text-center space-y-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Mari Berdiskusi</h2>
            <p className="text-gray-400">Punya ide proyek atau lowongan pekerjaan? Jangan ragu untuk menghubungi saya melalui form di bawah ini.</p>
          </motion.div>

          <motion.form onSubmit={handleContactSubmit} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass p-8 rounded-2xl space-y-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Nama Lengkap</label>
                <Input required value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} placeholder="John Doe" className="bg-gray-900/50 border-gray-800 focus-visible:ring-purple-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <Input type="email" required value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} placeholder="john@example.com" className="bg-gray-900/50 border-gray-800 focus-visible:ring-purple-500" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Pesan</label>
              <textarea 
                required
                value={contactForm.message}
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                className="flex min-h-[120px] w-full rounded-md border border-gray-800 bg-gray-900/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Ceritakan tentang proyek Anda..."
              />
            </div>
            <Button disabled={sending} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
              {sending ? "Mengirim..." : "Kirim Pesan"} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.form>
        </section>

      </div>
      
      {/* FOOTER */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} {hero.name}. All rights reserved.</p>
      </footer>
    </main>
  );
}
