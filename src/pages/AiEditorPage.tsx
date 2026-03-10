import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, X, Monitor, Smartphone, Square, Crop, Sparkles, History, CheckSquare, LayoutGrid, List, MoreVertical, FileVideo, Calendar, Scissors, LayoutTemplate, Layers, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AspectRatioOption = "16:9" | "9:16" | "1:1" | "4:3";

type Project = {
  id: string;
  title: string;
  aspectRatio: AspectRatioOption;
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
  { value: "4:3", label: "4:3", sublabel: "4:3", icon: <Crop size={20} className="text-muted-foreground shrink-0" />, aspectClass: "aspect-[4/3]" },
];

const AI_EDITOR_FEATURES = [
  {
    id: "ai-video-editing",
    title: "AI Video Editing",
    description: "Automatically edit videos using AI without using a complex timeline. The system intelligently arranges clips, captions, animations, and music to create a polished final video in seconds.",
    icon: Scissors,
    remotionFeature: "ai-video-editing",
  },
  {
    id: "smart-video-templates",
    title: "Smart Video Templates",
    description: "Create professional videos instantly using ready-made templates. Just add your text, media, or content and the system generates a fully styled video with consistent design and structure.",
    icon: LayoutTemplate,
    remotionFeature: "smart-video-templates",
  },
  {
    id: "bulk-video-automation",
    title: "Bulk Video Automation",
    description: "Generate hundreds or thousands of videos automatically from prompts, scripts, or spreadsheet data. Perfect for large-scale content creation and social media automation.",
    icon: Layers,
    remotionFeature: "bulk-video-automation",
  },
  {
    id: "social-media-export",
    title: "Social Media Ready Export",
    description: "Export videos optimized for every major platform including YouTube, TikTok, Instagram, and Facebook with automatic aspect ratio and format adjustments.",
    icon: Share2,
    remotionFeature: "social-media-export",
  },
] as const;

export function AiEditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>("16:9");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

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
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // Open New Project modal when navigated from header "With AI Editor" with state
  useEffect(() => {
    const state = location.state as { openNewProjectModal?: boolean } | null;
    if (state?.openNewProjectModal) {
      setProjectTitle("");
      setAspectRatio("16:9");
      setModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state]);

  useEffect(() => {
    if (!modalOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [modalOpen]);

  const handleCreateProject = () => {
    const title = projectTitle.trim() || "Untitled Project";
    const now = new Date().toISOString();
    // Placeholder size in bytes (e.g. 5.6 MB); replace with real size when project is saved/exported
    const sizeBytes = Math.round(5.6 * 1024 * 1024);
    setProjects((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title,
        aspectRatio,
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
          <h1 className="text-xl font-bold text-foreground tracking-tight">Ai Editor</h1>
          <p className="text-sm text-muted-foreground mt-1">Edit and refine content with AI assistance.</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-8">
        {/* Recent Projects */}
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
                {/* Start Blank Project card */}
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
              /* List view: table-like, compact rows */
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                {/* Column headers */}
                <div className="grid grid-cols-[56px_1fr_70px_72px_90px_40px] gap-3 px-3 py-2.5 border-b border-border bg-background/60 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <span />
                  <span>Name</span>
                  <span>Duration</span>
                  <span>Size</span>
                  <span>Updated</span>
                  <span />
                </div>
                {/* Start Blank Project row */}
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
                {/* Project rows */}
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

        {/* Features (Remotion) – last */}
        <section className="mt-10">
          <h2 className="text-base font-semibold text-foreground mb-4">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AI_EDITOR_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => {
                    // Wire to Remotion: open composer for feature.remotionFeature
                    console.log("Feature:", feature.remotionFeature);
                  }}
                  className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/40 hover:bg-card/90 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/30 transition-colors">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-snug">{feature.description}</p>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Project menu dropdown – portaled so it is not clipped by overflow */}
      {menuOpenId && menuPosition && createPortal(
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={closeProjectMenu}
          />
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

      {/* New Project modal (same as Projects page) */}
      {modalOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            aria-hidden
            onClick={closeModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-editor-new-project-title"
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card shadow-xl"
          >
            <div className="flex items-start justify-between border-b border-border px-6 py-4">
              <div>
                <h2 id="ai-editor-new-project-title" className="text-lg font-semibold text-foreground">
                  New AI Editor Project
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Create a new project in the AI Editor. Set a title and aspect ratio, then start editing with AI.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={18} />
              </Button>
            </div>

            <div className="px-6 py-5 space-y-6">
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Project Title
                </Label>
                <Input
                  type="text"
                  placeholder="My Awesome Video"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="bg-background/50 border-border"
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Aspect Ratio
                </Label>
                <div className="flex items-end gap-3">
                  {ASPECT_RATIO_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAspectRatio(opt.value)}
                      title={`${opt.label} ${opt.sublabel}`}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 min-w-0 transition-colors text-center h-20",
                        opt.aspectClass,
                        aspectRatio === opt.value
                          ? "border-primary bg-primary/15 text-primary ring-1 ring-primary/30"
                          : "border-border bg-background/30 text-muted-foreground hover:border-border hover:bg-muted/50"
                      )}
                    >
                      {opt.icon}
                      <span className="text-[11px] opacity-80 leading-tight">{opt.sublabel}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
              <Button variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject} className="gap-2">
                <Sparkles size={16} />
                Create Project
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
