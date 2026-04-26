import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  useGetProjects,
  useGetFeaturedProjects,
  useGetProjectStats,
  useGetSkills,
  useSubmitContact,
} from "@workspace/api-client-react";

const STATUSES = ["all", "published", "in-progress", "archived"] as const;
type Status = (typeof STATUSES)[number];

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const handler = () => {
      for (const id of [...ids].reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 100) {
          setActive(id);
          return;
        }
      }
      setActive(ids[0]);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [ids]);
  return active;
}

function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(value / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref}>{inView ? count : 0}</span>;
}

function Section({ children, id, className = "" }: { children: React.ReactNode; id: string; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`py-24 px-6 max-w-6xl mx-auto ${className}`}
    >
      {children}
    </motion.section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-widest mb-4 border border-primary/30 bg-primary/5 px-3 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground font-sans">
      {children}
    </h2>
  );
}

function ProjectCard({
  project,
  featured = false,
  onClick,
}: {
  project: {
    id: number;
    title: string;
    description: string;
    longDescription?: string | null;
    status: string;
    tags: string[];
    techStack: string[];
    replitUrl?: string | null;
    liveUrl?: string | null;
    githubUrl?: string | null;
    featured: boolean;
  };
  featured?: boolean;
  onClick: () => void;
}) {
  const statusColors: Record<string, string> = {
    published: "text-primary border-primary/40 bg-primary/10",
    "in-progress": "text-accent border-accent/40 bg-accent/10",
    archived: "text-muted-foreground border-border bg-muted/30",
  };

  const statusLabels: Record<string, string> = {
    published: "// shipped",
    "in-progress": "// wip",
    archived: "// archived",
  };

  return (
    <motion.div
      whileHover={{ y: -4, borderColor: "hsl(var(--primary) / 0.5)" }}
      className={`group relative border bg-card p-6 cursor-pointer transition-colors ${
        featured ? "border-primary/30" : "border-border"
      }`}
      onClick={onClick}
    >
      {featured && (
        <div className="absolute top-0 right-0 text-xs font-mono bg-primary text-primary-foreground px-2 py-0.5">
          FEATURED
        </div>
      )}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors font-sans">
          {project.title}
        </h3>
        <span
          className={`text-xs font-mono border px-2 py-0.5 shrink-0 ${statusColors[project.status] || statusColors.archived}`}
        >
          {statusLabels[project.status] || project.status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {project.techStack.slice(0, 5).map((t) => (
          <span
            key={t}
            className="text-xs font-mono bg-muted border border-border px-2 py-0.5 text-muted-foreground"
          >
            {t}
          </span>
        ))}
        {project.techStack.length > 5 && (
          <span className="text-xs font-mono text-muted-foreground px-1">
            +{project.techStack.length - 5}
          </span>
        )}
      </div>
      <div className="mt-4 text-xs font-mono text-muted-foreground/60 group-hover:text-primary/60 transition-colors">
        click to expand →
      </div>
    </motion.div>
  );
}

function ProjectModal({
  project,
  onClose,
}: {
  project: {
    id: number;
    title: string;
    description: string;
    longDescription?: string | null;
    status: string;
    tags: string[];
    techStack: string[];
    replitUrl?: string | null;
    liveUrl?: string | null;
    githubUrl?: string | null;
    featured: boolean;
  };
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-primary/20 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-xs font-mono text-primary mb-2">
              {project.status === "published"
                ? "// shipped"
                : project.status === "in-progress"
                ? "// work in progress"
                : "// archived"}
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight font-sans">{project.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-xl font-mono"
          >
            [x]
          </button>
        </div>

        <p className="text-muted-foreground mb-4">{project.description}</p>
        {project.longDescription && (
          <p className="text-sm text-muted-foreground/80 mb-6 border-l-2 border-primary/30 pl-4">
            {project.longDescription}
          </p>
        )}

        <div className="mb-6">
          <div className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">
            tech stack
          </div>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((t) => (
              <span key={t} className="text-sm font-mono bg-muted border border-border px-2 py-1">
                {t}
              </span>
            ))}
          </div>
        </div>

        {project.tags.length > 0 && (
          <div className="mb-6">
            <div className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">
              tags
            </div>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <span key={t} className="text-xs font-mono border border-border px-2 py-0.5 text-muted-foreground">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-6">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono border border-primary text-primary px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              view on github →
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono border border-border text-foreground px-4 py-2 hover:border-primary transition-colors"
            >
              live demo →
            </a>
          )}
          {project.replitUrl && (
            <a
              href={project.replitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono border border-secondary/40 text-secondary px-4 py-2 hover:bg-secondary/10 transition-colors"
            >
              view on replit →
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

const NAV_SECTIONS = ["hero", "about", "projects", "skills", "contact"];

export default function Home() {
  const active = useScrollSpy(NAV_SECTIONS);
  const [statusFilter, setStatusFilter] = useState<Status>("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactSuccess, setContactSuccess] = useState(false);

  const { data: projects = [], isLoading: projectsLoading } = useGetProjects(
    { status: statusFilter === "all" ? "all" : statusFilter, ...(tagFilter ? { tag: tagFilter } : {}) },
    { query: { enabled: true } }
  );
  const { data: featuredProjects = [] } = useGetFeaturedProjects({ query: { enabled: true } });
  const { data: stats } = useGetProjectStats({ query: { enabled: true } });
  const { data: skillCategories = [] } = useGetSkills({ query: { enabled: true } });
  const submitContact = useSubmitContact();

  const selectedProjectData = selectedProject != null
    ? projects.find((p) => p.id === selectedProject) || featuredProjects.find((p) => p.id === selectedProject)
    : null;

  const allTags = Array.from(
    new Set([...projects.flatMap((p) => [...p.tags, ...p.techStack])])
  ).slice(0, 18);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitContact.mutateAsync({ data: contactForm });
      setContactSuccess(true);
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      // error handled by mutation state
    }
  };

  const levelOrder = { expert: 4, advanced: 3, intermediate: 2, beginner: 1 };
  const levelColors: Record<string, string> = {
    expert: "bg-primary",
    advanced: "bg-accent",
    intermediate: "bg-secondary",
    beginner: "bg-muted-foreground",
  };

  return (
    <div className="min-h-[100dvh] w-full text-foreground relative font-sans overflow-x-hidden">
      {/* Background grid */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Sticky Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a
            href="#hero"
            className="text-primary font-bold tracking-tighter text-lg font-mono hover:opacity-80 transition-opacity"
          >
            ./portfolio
          </a>
          <div className="hidden md:flex items-center gap-6 text-sm font-mono">
            {NAV_SECTIONS.slice(1).map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className={`transition-colors ${
                  active === id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {id === "contact" ? "contact()" : `/${id}`}
              </a>
            ))}
            <a
              href="https://github.com/jasonclarkagain"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors border border-border/40 px-2 py-0.5 hover:border-primary/40"
            >
              gh
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        id="hero"
        className="min-h-[100dvh] flex flex-col items-start justify-center px-6 max-w-6xl mx-auto relative pt-14"
      >
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-1/4 -right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 border border-primary/40 bg-primary/10 text-primary px-3 py-1 text-xs font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            STATUS: HYPERFOCUSED / SHIPPING
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter max-w-5xl font-sans uppercase leading-none"
        >
          I turn <span className="text-primary">caffeine</span>
          <br />
          into{" "}
          <span
            style={{
              WebkitTextStroke: "2px hsl(var(--primary))",
              color: "transparent",
            }}
          >
            systems
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl font-mono leading-relaxed"
        >
          Building things, breaking things, rebuilding them better — occasionally shipping something
          that works on the first try. Currently: 61 repos across AI agents, security tools, and
          systems that definitely don't have bugs. Simultaneously.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <a
            href="#projects"
            className="bg-primary text-primary-foreground px-8 py-3.5 font-bold text-sm hover:bg-primary/90 transition-colors uppercase tracking-wider font-mono"
          >
            ./run projects
          </a>
          <a
            href="#contact"
            className="border border-border hover:border-primary/50 bg-card px-8 py-3.5 font-bold text-sm transition-colors uppercase tracking-wider font-mono"
          >
            ping me
          </a>
        </motion.div>

        {/* Stats ticker */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 flex flex-wrap gap-8 text-sm font-mono border-t border-border/40 pt-8 w-full"
          >
            <div>
              <div className="text-3xl font-extrabold text-primary">
                <AnimatedCounter value={stats.total} />
              </div>
              <div className="text-muted-foreground text-xs mt-1">total_projects</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold">
                <AnimatedCounter value={stats.published} />
              </div>
              <div className="text-muted-foreground text-xs mt-1">shipped</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-accent">
                <AnimatedCounter value={stats.inProgress} />
              </div>
              <div className="text-muted-foreground text-xs mt-1">in_progress</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-muted-foreground">
                <AnimatedCounter value={stats.archived} />
              </div>
              <div className="text-muted-foreground text-xs mt-1">archived // rip</div>
            </div>
            {stats.topLanguages.slice(0, 3).map((lang) => (
              <div key={lang.name}>
                <div className="text-3xl font-extrabold">{lang.name}</div>
                <div className="text-muted-foreground text-xs mt-1">{lang.count}x used</div>
              </div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <div className="text-xs font-mono text-muted-foreground">scroll_down()</div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-primary to-transparent"
          />
        </motion.div>
      </section>

      {/* About */}
      <Section id="about">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <SectionLabel>about_me.ts</SectionLabel>
            <SectionTitle>
              The human behind
              <br />
              the <span className="text-primary">commits</span>
            </SectionTitle>
            <div className="mt-6 space-y-4 text-muted-foreground font-mono text-sm leading-relaxed">
              <p>
                I build things. Systems, tools, apps — the kind of software that either solves a real
                problem or teaches me exactly why it was a bad idea. Usually both.
              </p>
              <p>
                ADHD meant learning 12 programming languages before finishing a single project. Turns
                out that is called "breadth of experience" on a resume, so: everything worked out.
              </p>
              <p>
                I am drawn to hard problems, new languages, and the specific satisfaction of a system
                coming together. I will learn Zig for a weekend project. I will rewrite it in Rust
                when I realize I was holding it wrong. The second version is always better.
              </p>
              <p className="text-primary/80">
                Currently: drinking too much coffee, building in multiple languages simultaneously,
                and maintaining{" "}
                <span className="text-primary">exactly</span> the number of open browser tabs I need.
              </p>
            </div>
          </div>

          {/* Terminal block */}
          <div className="border border-border bg-card/50 font-mono text-sm">
            <div className="border-b border-border px-4 py-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span className="ml-2 text-xs text-muted-foreground">~/portfolio — bash</span>
            </div>
            <div className="p-4 space-y-2">
              <div className="text-muted-foreground">
                <span className="text-primary">$</span> whoami
              </div>
              <div className="text-foreground pl-2">builder, systems-thinker, hyperfocuser</div>
              <div className="mt-3 text-muted-foreground">
                <span className="text-primary">$</span> cat interests.txt
              </div>
              <div className="text-foreground pl-2">
                {["AI Agents & Orchestration", "Security & Cryptography", "Distributed Systems", "TypeScript / Python / Rust", "Next.js / React", "System Automation"].map(
                  (i) => (
                    <div key={i} className="text-xs">
                      → {i}
                    </div>
                  )
                )}
              </div>
              <div className="mt-3 text-muted-foreground">
                <span className="text-primary">$</span> git log --oneline | wc -l
              </div>
              <div className="text-foreground pl-2">
                {stats ? (
                  <span>
                    <span className="text-primary">{stats.total * 47}</span> // estimated, trust me
                  </span>
                ) : (
                  "counting..."
                )}
              </div>
              <div className="mt-3 text-muted-foreground">
                <span className="text-primary">$</span>{" "}
                <span className="animate-pulse">_</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="py-12 px-6 bg-card/20 border-y border-border/40">
          <div className="max-w-6xl mx-auto">
            <div className="text-xs font-mono text-muted-foreground mb-4">
              // pinned —{" "}
              <span className="text-primary">
                {featuredProjects.length} featured project{featuredProjects.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredProjects.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <ProjectCard project={p} featured onClick={() => setSelectedProject(p.id)} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Projects */}
      <Section id="projects">
        <SectionLabel>ls -la ./projects</SectionLabel>
        <SectionTitle>
          Things I've <span className="text-primary">built</span>
        </SectionTitle>
        <p className="mt-3 text-muted-foreground font-mono text-sm">
          {stats ? (
            <>
              {stats.total} total — {stats.published} shipped, {stats.inProgress} in progress,{" "}
              {stats.archived} archived
            </>
          ) : (
            "loading project manifest..."
          )}
        </p>

        {/* Filters */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs font-mono px-3 py-1.5 border transition-colors ${
                  statusFilter === s
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {s === "all" ? "all" : s === "in-progress" ? "in progress" : s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                className={`text-xs font-mono px-2 py-1 border transition-colors ${
                  tagFilter === tag
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border/50 text-muted-foreground/60 hover:border-border hover:text-muted-foreground"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Project grid */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-border bg-card/50 p-6 animate-pulse">
                <div className="h-4 bg-muted w-3/4 mb-3" />
                <div className="h-3 bg-muted w-full mb-2" />
                <div className="h-3 bg-muted w-4/5" />
              </div>
            ))
          ) : projects.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-muted-foreground font-mono">
              <div className="text-4xl mb-4">404</div>
              <div>no projects match that filter // try a different one</div>
            </div>
          ) : (
            projects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <ProjectCard project={p} onClick={() => setSelectedProject(p.id)} />
              </motion.div>
            ))
          )}
        </div>
      </Section>

      {/* Skills */}
      <Section id="skills" className="bg-card/10 border-y border-border/40">
        <SectionLabel>cat skills.json</SectionLabel>
        <SectionTitle>
          What I <span className="text-primary">actually</span> know
          <br />
          <span className="text-muted-foreground text-3xl font-mono font-normal">
            (and what I'm still Googling)
          </span>
        </SectionTitle>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((cat, ci) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.1 }}
            >
              <div className="text-xs font-mono text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="text-muted-foreground">//</span> {cat.category}
              </div>
              <div className="space-y-2">
                {cat.skills
                  .sort((a, b) => (levelOrder[b.level as keyof typeof levelOrder] || 0) - (levelOrder[a.level as keyof typeof levelOrder] || 0))
                  .map((skill) => (
                    <div key={skill.id} className="flex items-center gap-3 group">
                      <div
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${levelColors[skill.level] || "bg-muted-foreground"}`}
                      />
                      <span className="text-sm font-mono text-foreground flex-1">{skill.name}</span>
                      <span className="text-xs font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {skill.level}
                      </span>
                      {skill.yearsOfExperience && (
                        <span className="text-xs font-mono text-muted-foreground/50">
                          {skill.yearsOfExperience}y
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 flex flex-wrap gap-4 text-xs font-mono text-muted-foreground border-t border-border/40 pt-6">
          {Object.entries(levelColors).map(([level, color]) => (
            <div key={level} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              {level}
            </div>
          ))}
        </div>
      </Section>

      {/* Stats Deep Dive */}
      {stats && (
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-xs font-mono text-muted-foreground mb-8">
              // top_languages && top_tags — from actual projects, not resume padding
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="text-sm font-mono text-primary mb-4 uppercase tracking-wider">
                  Languages by project count
                </div>
                <div className="space-y-2">
                  {stats.topLanguages.slice(0, 8).map((lang, i) => (
                    <div key={lang.name} className="flex items-center gap-3">
                      <div className="text-xs font-mono text-muted-foreground w-4 text-right">
                        {i + 1}
                      </div>
                      <div className="flex-1 bg-muted/30 border border-border/40 h-6 relative overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-primary/40"
                          initial={{ width: 0 }}
                          whileInView={{
                            width: `${(lang.count / stats.topLanguages[0].count) * 100}%`,
                          }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                        />
                        <span className="absolute inset-0 flex items-center px-2 text-xs font-mono z-10">
                          {lang.name}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground w-4">
                        {lang.count}x
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-mono text-primary mb-4 uppercase tracking-wider">
                  Project tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {stats.topTags.slice(0, 15).map((tag) => (
                    <button
                      key={tag.name}
                      onClick={() => {
                        setTagFilter(tag.name);
                        document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="group border border-border/50 bg-muted/20 px-3 py-1.5 text-xs font-mono text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                    >
                      #{tag.name}{" "}
                      <span className="text-primary/60 group-hover:text-primary transition-colors">
                        ({tag.count})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <Section id="contact">
        <SectionLabel>contact()</SectionLabel>
        <SectionTitle>
          Let's build something
          <br />
          <span className="text-primary">that actually works</span>
        </SectionTitle>
        <p className="mt-4 text-muted-foreground font-mono text-sm max-w-lg">
          Have an interesting problem? A weird project idea? Want to talk systems design at 2am? Send
          it. I respond when I resurface from the current hyperfocus session.
        </p>

        <div className="mt-10 max-w-xl">
          {contactSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-primary/30 bg-primary/10 p-8 font-mono text-center"
            >
              <div className="text-primary text-2xl font-bold mb-2">message_received()</div>
              <div className="text-muted-foreground text-sm">
                Will respond when I resurface from the current hyperfocus session.
                <br />
                Estimated wait time: unknown.
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-muted-foreground block mb-1.5">
                    name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full bg-card border border-border px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary transition-colors"
                    placeholder="your_name"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground block mb-1.5">
                    email *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full bg-card border border-border px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary transition-colors"
                    placeholder="you@domain.com"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">
                  subject *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.subject}
                  onChange={(e) => setContactForm((f) => ({ ...f, subject: e.target.value }))}
                  className="w-full bg-card border border-border px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary transition-colors"
                  placeholder="re: interesting_problem"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">
                  message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={contactForm.message}
                  onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full bg-card border border-border px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="describe the problem... or the project... or just say hi"
                />
              </div>
              <button
                type="submit"
                disabled={submitContact.isPending}
                className="bg-primary text-primary-foreground px-8 py-3 text-sm font-bold font-mono uppercase tracking-wider hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {submitContact.isPending ? "sending..." : "send_message()"}
              </button>
              {submitContact.isError && (
                <div className="text-destructive text-xs font-mono">
                  // error: message failed to send. try again.
                </div>
              )}
            </form>
          )}
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
          <div>
            // built with TypeScript, React, Vite, Express, PostgreSQL — and too much coffee
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/jasonclarkagain"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              github.com/jasonclarkagain
            </a>
            <span>// no light mode. never.</span>
            <span className="text-primary">2026</span>
          </div>
        </div>
      </footer>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProjectData && (
          <ProjectModal
            project={selectedProjectData}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
