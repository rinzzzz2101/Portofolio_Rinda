import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, ExternalLink, Github } from "lucide-react"
import Link from "next/link"

// Dummy data for initial UI before Admin Dashboard is used
const DUMMY_PROJECTS = [
  {
    id: "1",
    title: "E-Commerce Enterprise",
    description: "Platform e-commerce modern dengan fitur lengkap termasuk payment gateway, inventaris, dan dashboard analitik.",
    technologies: ["Next.js", "TailwindCSS", "Prisma", "Supabase"],
    githubUrl: "#",
    demoUrl: "#",
    category: "Fullstack",
  },
  {
    id: "2",
    title: "Sistem Manajemen Kehadiran",
    description: "Aplikasi absensi karyawan berbasis lokasi dengan verifikasi biometrik dan pelaporan real-time.",
    technologies: ["React", "Node.js", "PostgreSQL", "Google Maps API"],
    githubUrl: "#",
    demoUrl: "#",
    category: "Web App",
  },
  {
    id: "3",
    title: "Portfolio Generator",
    description: "SaaS untuk membantu developer membuat portofolio profesional mereka dalam hitungan menit.",
    technologies: ["Next.js", "Framer Motion", "Shadcn UI"],
    githubUrl: "#",
    demoUrl: "#",
    category: "SaaS",
  }
];

export default async function ProjectsPage() {
  // Nanti ini akan diganti dengan fetch dari Prisma: await prisma.project.findMany()
  const projects = DUMMY_PROJECTS;

  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-16">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">My <span className="text-zinc-100">Projects</span></h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Berikut adalah beberapa proyek yang telah saya kerjakan. Dari aplikasi web berskala enterprise hingga bereksperimen dengan desain UI/UX. Semua data di bawah ini dapat dikelola via Admin Dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="glass-card text-white border-gray-800 hover:border-zinc-700 transition-all duration-300">
              <div className="h-48 bg-gray-900 rounded-t-lg flex items-center justify-center border-b border-gray-800">
                <span className="text-gray-600 font-medium">Image Placeholder</span>
              </div>
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription className="text-gray-400">{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="px-2 py-1 text-xs font-medium bg-zinc-850 text-zinc-300 border border-zinc-800 rounded-md">
                      {tech}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm" asChild className="hover:bg-gray-800">
                  <Link href={project.githubUrl}>
                    <Github className="w-4 h-4 mr-2" /> Code
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="hover:bg-gray-800">
                  <Link href={project.demoUrl}>
                    <ExternalLink className="w-4 h-4 mr-2" /> Demo
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="pt-8">
          <Button variant="outline" asChild className="border-gray-800 text-white hover:bg-gray-900">
            <Link href="/">
              Kembali ke Beranda
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
