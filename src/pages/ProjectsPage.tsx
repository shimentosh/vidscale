import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Plus, X, Monitor, Smartphone, Square, Sparkles, History, CheckSquare, LayoutGrid, List, MoreVertical, FileVideo, Calendar, Scissors, LayoutTemplate, Layers, Share2, ImageIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AspectRatioOption = "16:9" | "9:16" | "1:1" | "4:3";

type Project = {
  id: string;
  title: string;
  aspectRatio: AspectRatioOption;
  templateId?: string;
  createdAt: string;
  updatedAt?: string;
  durationSeconds?: number;
  sizeBytes?: number;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatTimeAgo(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const sec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return mm + ":" + ss;
}

const ASPECT_RATIO_OPTIONS: {
  value: AspectRatioOption;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  aspectClass: string;
}[] = [
  { value: "9:16", label: "Portrait", sublabel: "9:16", icon: <Smartphone size={20} className="text-muted-foreground shrink-0" />, aspectClass: "aspect-[9/16]" },
  { value: "1:1", label: "Square", sublabel: "1:1", icon: <Square size={20} className="text-muted-foreground shrink-0" />, aspectClass: "aspect-square" },
  { value: "16:9", label: "Landscape", sublabel: "16:9", icon: <Monitor size={20} className="text-muted-foreground shrink-0" />, aspectClass: "aspect-video" },
];

const PROJECT_FEATURES = [
  {
    id: "ai-video-editing",
    title: "AI Video Editing",
    description: "Automatically edit videos using AI without complex timelines. The system intelligently arranges clips, captions, animations, and music to produce a polished video in seconds.",
    icon: Scissors,
  },
  {
    id: "template-video",
    title: "Template-Based Video Creation",
    description: "Generate professional videos instantly using customizable templates. Simply add your text, images, or media and the system builds a complete video with consistent design.",
    icon: LayoutTemplate,
  },
  {
    id: "bulk-video",
    title: "Bulk Video Generation",
    description: "Create hundreds or thousands of videos at once using prompts, scripts, or spreadsheet data. Perfect for large-scale content production and automation workflows.",
    icon: Layers,
  },
  {
    id: "social-export",
    title: "Social Media Ready Videos",
    description: "Export videos optimized for platforms like YouTube, TikTok, Instagram, and Facebook with automatic aspect ratios and formats ready for publishing.",
    icon: Share2,
  },
] as const;

const TEMPLATES_FILTERS = ["All", "Posters", "Social media", "Business", "Brand", "Photos"] as const;

const TEMPLATES_CARDS: { id: string; title: string; category: string; aspect: "tall" | "wide" | "square" }[] = [
  { id: "1", title: "Find Your Glow", category: "Brand", aspect: "tall" },
  { id: "2", title: "Everyday nutrition", category: "E-commerce", aspect: "wide" },
  { id: "3", title: "Deconstructed", category: "Food", aspect: "square" },
  { id: "4", title: "Minimal editorial", category: "Brand", aspect: "wide" },
  { id: "5", title: "Product shot", category: "E-commerce", aspect: "tall" },
  { id: "6", title: "Social post", category: "Social media", aspect: "square" },
];

function templateAspectLabel(aspect: "tall" | "wide" | "square"): string {
  return aspect === "tall" ? "3:4" : aspect === "wide" ? "4:3" : "1:1";
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>("16:9");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const [templateFilter, setTemplateFilter] = useState<string>("All");
  const templatesScrollRef = useRef<HTMLDivElement>(null);

  const scrollTemplatesRight = () => {
    templatesScrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  const openProjectMenu = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (menuOpenId === projectId) {
      setMenuOpenId(null);
      setMenuPosition(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setMenuOpenId(projectId);
  };

  const closeProjectMenu = () => {
    setMenuOpenId(null);
    setMenuPosition(null);
  };

  const openModal = () => {
    setProjectTitle("");
    setAspectRatio("16:9");
    setSelectedTemplateId(null);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  useEffect(() => {
    if (!modalOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [modalOpen]);

  const handleCreateProject = () => {
    if (!selectedTemplateId) return;
    const title = projectTitle.trim() || "Untitled Project";
    const now = new Date().toISOString();
    const sizeBytes = Math.round(5.6 * 1024 * 1024);
    setProjects((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title,
        aspectRatio,
        templateId: selectedTemplateId,
        createdAt: now,
        updatedAt: now,
        durationSeconds: 6,
        sizeBytes,
      },
    ]);
    closeModal();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectMode = () => {
    setSelectMode((s) => !s);
    setSelectedIds(new Set());
  };

  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-background">
      <div className="shrink-0 flex items-center justify-between py-5 px-8 border-b border-border bg-background/40">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your video and design projects.</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-8">
        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <History size={20} className="text-muted-foreground" />
              Recent Projects
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-border bg-transparent text-foreground hover:bg-white/5"
                onClick={toggleSelectMode}
              >
                <CheckSquare size={16} className="text-muted-foreground" />
                Select
              </Button>
              <div className="flex rounded-md border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "grid" ? "bg-white/10 text-foreground" : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "list" ? "bg-white/10 text-foreground" : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                  aria-label="List view"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <button
                type="button"
                onClick={openModal}
                className="rounded-lg border-2 border-dashed border-border bg-transparent hover:border-muted-foreground/50 hover:bg-white/5 transition-colors flex flex-col items-center justify-center min-h-[180px] py-8 px-4"
              >
                <div className="rounded-full bg-card border border-border flex items-center justify-center w-12 h-12 shrink-0">
                  <Plus size={24} className="text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground mt-3">Start Blank Project</span>
              </button>
              {projects.map((p, index) => (
                <article
                  key={p.id}
                  className="rounded-lg border border-border bg-card overflow-hidden flex flex-col"
                >
                  <div className="relative flex items-center justify-center bg-background aspect-video shrink-0">
                    <FileVideo size={48} className="text-muted-foreground/60" />
                    {(p.durationSeconds ?? 0) > 0 && (
                      <span className="absolute bottom-1.5 right-1.5 text-[10px] text-muted-foreground bg-black/60 px-1.5 py-0.5 rounded">
                        {formatDuration(p.durationSeconds ?? 0)}
                      </span>
                    )}
                    {selectMode && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleSelect(p.id); }}
                        className={cn(
                          "absolute top-2 left-2 w-5 h-5 rounded border flex items-center justify-center transition-colors",
                          selectedIds.has(p.id) ? "bg-primary border-primary" : "border-border bg-card"
                        )}
                      >
                        {selectedIds.has(p.id) && <CheckSquare size={14} className="text-primary-foreground" />}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5 min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.title || String(index + 1)}</p>
                      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar size={12} className="shrink-0" />
                        Updated {formatTimeAgo(p.updatedAt ?? p.createdAt)}
                      </p>
                      {p.sizeBytes != null && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">{formatSize(p.sizeBytes)}</p>
                      )}
                    </div>
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={(e) => openProjectMenu(e, p.id)}
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/5"
                        aria-label="Project options"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="grid grid-cols-[56px_1fr_70px_72px_90px_40px] gap-3 px-3 py-2.5 border-b border-border bg-background/60 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span />
                <span>Name</span>
                <span>Duration</span>
                <span>Size</span>
                <span>Updated</span>
                <span />
              </div>
              <button
                type="button"
                onClick={openModal}
                className="grid grid-cols-[56px_1fr_70px_72px_90px_40px] gap-3 items-center w-full px-3 py-3 border-b border-border/60 hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-card border border-dashed border-border flex items-center justify-center shrink-0">
                  <Plus size={20} className="text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">Start Blank Project</span>
                <span className="text-xs text-muted-foreground">—</span>
                <span className="text-xs text-muted-foreground">—</span>
                <span className="text-xs text-muted-foreground">—</span>
                <span />
              </button>
              {projects.map((p, index) => {
                const updatedAt = p.updatedAt ?? p.createdAt;
                const duration = p.durationSeconds ?? 0;
                return (
                  <div
                    key={p.id}
                    className={cn(
                      "grid grid-cols-[56px_1fr_70px_72px_90px_40px] gap-3 items-center px-3 py-2.5 min-h-[56px] border-b border-border/60 last:border-b-0 hover:bg-white/5 transition-colors",
                      selectMode && selectedIds.has(p.id) && "bg-primary/10"
                    )}
                  >
                    <div className="relative w-10 h-10 rounded-lg bg-background flex items-center justify-center shrink-0 overflow-hidden">
                      <FileVideo size={22} className="text-muted-foreground/60" />
                      {selectMode && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleSelect(p.id); }}
                          className={cn(
                            "absolute inset-0 w-full h-full rounded-lg border flex items-center justify-center transition-colors",
                            selectedIds.has(p.id) ? "bg-primary/30 border-primary" : "border-transparent hover:border-border"
                          )}
                        >
                          {selectedIds.has(p.id) && <CheckSquare size={16} className="text-primary" />}
                        </button>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.title || "Untitled"}</p>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">{duration > 0 ? formatDuration(duration) : "—"}</span>
                    <span className="text-xs text-muted-foreground">{p.sizeBytes != null ? formatSize(p.sizeBytes) : "—"}</span>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(updatedAt)}</span>
                    <div className="relative flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => openProjectMenu(e, p.id)}
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/5"
                        aria-label="Project options"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Templates */}
        <section className="mt-10">
          <h2 className="text-sm font-semibold text-foreground mb-3">Templates</h2>
          <div className="relative flex items-center gap-1 mb-4">
            <div
              ref={templatesScrollRef}
              className="flex-1 flex gap-1.5 overflow-x-auto overflow-y-hidden py-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {TEMPLATES_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setTemplateFilter(filter)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    templateFilter === filter
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground border border-border hover:border-white/20 hover:text-foreground"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={scrollTemplatesRight}
              className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
            {TEMPLATES_CARDS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="group break-inside-avoid mb-4 rounded-lg border border-border bg-card overflow-hidden text-left hover:border-primary/40 hover:bg-card/90 transition-all block w-full"
              >
                <div
                  className={cn(
                    "w-full bg-background flex items-center justify-center",
                    item.aspect === "tall" && "aspect-[3/4]",
                    item.aspect === "wide" && "aspect-[4/3]",
                    item.aspect === "square" && "aspect-square"
                  )}
                >
                  <ImageIcon size={28} className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                </div>
                <div className="px-2.5 py-1.5 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.category}</p>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground shrink-0 tabular-nums">{templateAspectLabel(item.aspect)}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Features – last */}
        <section className="mt-10">
          <h2 className="text-base font-semibold text-foreground mb-4">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROJECT_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/40 hover:bg-card/90 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/30 transition-colors">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-snug">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {menuOpenId && menuPosition && createPortal(
        <>
          <div className="fixed inset-0 z-40" aria-hidden onClick={closeProjectMenu} />
          <div
            className="fixed z-50 min-w-[140px] rounded-md border border-border bg-card py-1 shadow-lg"
            style={{ top: menuPosition.top, right: menuPosition.right }}
            role="menu"
          >
            <button type="button" className="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-white/5" onClick={closeProjectMenu} role="menuitem">Open</button>
            <button type="button" className="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-white/5" onClick={closeProjectMenu} role="menuitem">Duplicate</button>
            <button type="button" className="w-full px-3 py-2 text-left text-xs text-destructive hover:bg-white/5" onClick={closeProjectMenu} role="menuitem">Delete</button>
          </div>
        </>,
        document.body
      )}

      {modalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" aria-hidden onClick={closeModal} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-project-title"
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card shadow-xl flex flex-col max-h-[85vh]"
          >
            <div className="flex items-start justify-between border-b border-border px-5 py-3.5 shrink-0">
              <div>
                <h2 id="new-project-title" className="text-base font-semibold text-foreground">New Video Project</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Choose a template, then name your project and pick an aspect ratio.</p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 rounded-full h-8 w-8 text-muted-foreground hover:text-foreground" onClick={closeModal} aria-label="Close">
                <X size={16} />
              </Button>
            </div>
            <div className="overflow-y-auto px-5 py-4 space-y-5">
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Choose template <span className="text-destructive">*</span></Label>
                <div className="columns-2 sm:columns-3 gap-3">
                  {TEMPLATES_CARDS.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={cn(
                        "flex flex-col rounded-lg border-2 overflow-hidden text-left transition-colors break-inside-avoid mb-3 w-full",
                        selectedTemplateId === tpl.id
                          ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                          : "border-border bg-background/30 hover:border-white/30 hover:bg-white/5"
                      )}
                    >
                      <div
                        className={cn(
                          "w-full bg-muted/50 flex items-center justify-center",
                          tpl.aspect === "tall" && "aspect-[3/4]",
                          tpl.aspect === "wide" && "aspect-[4/3]",
                          tpl.aspect === "square" && "aspect-square"
                        )}
                      >
                        <ImageIcon size={20} className="text-muted-foreground/50" />
                      </div>
                      <div className="px-1.5 py-1 flex items-end justify-between gap-2 min-h-[36px]">
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-foreground truncate">{tpl.title}</p>
                          <p className="text-[9px] text-muted-foreground truncate">{tpl.category}</p>
                        </div>
                        <span className="text-[9px] font-medium text-muted-foreground shrink-0 tabular-nums">{templateAspectLabel(tpl.aspect)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Project title</Label>
                <Input
                  type="text"
                  placeholder="My Awesome Video"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="bg-background/50 border-border h-9 text-sm"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Aspect ratio</Label>
                <div className="flex items-end gap-2">
                  {ASPECT_RATIO_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAspectRatio(opt.value)}
                      title={opt.label === opt.sublabel ? opt.sublabel : `${opt.label} ${opt.sublabel}`}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 rounded-lg border-2 min-w-0 transition-colors text-center h-16",
                        opt.aspectClass,
                        aspectRatio === opt.value ? "border-primary bg-primary/15 text-primary ring-1 ring-primary/30" : "border-border bg-background/30 text-muted-foreground hover:border-border hover:bg-muted/50"
                      )}
                    >
                      {opt.icon}
                      <span className="text-[10px] opacity-80 leading-tight">{opt.sublabel}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-3 shrink-0 bg-muted/20">
              <p className="text-[11px] text-muted-foreground">
                {selectedTemplateId ? "Template selected" : "Select a template to continue"}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={closeModal}>Cancel</Button>
                <Button size="sm" onClick={handleCreateProject} className="gap-1.5" disabled={!selectedTemplateId}>
                  <Sparkles size={14} />
                  Create Project
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
