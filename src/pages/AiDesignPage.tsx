import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Settings, Flame, ShoppingCart, PartyPopper, Sparkles, ImageIcon, MessageSquare, Send, Monitor, FolderOpen, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type ModelId = "nano-banana" | "seedream-5" | "seedream-4s";

const AI_MODELS: { id: ModelId; name: string; description: string; tags: { label: string; variant: "hot" | "new" | "neutral" }[] }[] = [
  { id: "nano-banana", name: "Nano Banana", description: "Multilingual text support, rich world knowledge", tags: [{ label: "Hot", variant: "hot" }, { label: "60s", variant: "neutral" }] },
  { id: "seedream-5", name: "Seedream 5.0", description: "Better inference, enhanced realism", tags: [{ label: "New", variant: "new" }, { label: "20s", variant: "neutral" }] },
  { id: "seedream-4s", name: "Seedream 4.0S", description: "Enhanced consistency, composition, and aesthetics", tags: [{ label: "20s", variant: "neutral" }] },
];

type ChatEntry = {
  id: string;
  prompt: string;
  createdAt: string;
};

const CATEGORY_TAGS = [
  { id: "social", label: "Social media", icon: Flame },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingCart },
  { id: "promotion", label: "Promotion", icon: PartyPopper },
  { id: "graphics", label: "Graphics", icon: Sparkles },
  { id: "womans-day", label: "Woman's Day" },
  { id: "valentines", label: "Valentine's Day" },
  { id: "ramadan", label: "Ramadan" },
  { id: "cinematography", label: "Cinematography" },
] as const;

const INSPIRATION_FILTERS = ["All", "Posters", "Social media", "Business", "Brand", "Photos"] as const;

const PLACEHOLDER_TEMPLATES: { id: string; title: string; category: string; aspect: "tall" | "wide" | "square" }[] = [
  { id: "1", title: "Find Your Glow", category: "Brand", aspect: "tall" },
  { id: "2", title: "Everyday nutrition", category: "E-commerce", aspect: "wide" },
  { id: "3", title: "Deconstructed", category: "Food", aspect: "square" },
  { id: "4", title: "Minimal editorial", category: "Brand", aspect: "wide" },
  { id: "5", title: "Product shot", category: "E-commerce", aspect: "tall" },
  { id: "6", title: "Social post", category: "Social media", aspect: "square" },
];

const FREE_USES_MAX = 20;
const BULK_AMOUNT_MAX = 1000;

function formatTimeAgo(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const sec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

export function AiDesignPage() {
  const [prompt, setPrompt] = useState("");
  const [freeUses, setFreeUses] = useState(FREE_USES_MAX);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [inspirationFilter, setInspirationFilter] = useState<string>("All");
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelId>("seedream-5");
  const [autoModel, setAutoModel] = useState(true);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const templatesScrollRef = useRef<HTMLDivElement>(null);
  const inspirationScrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ el: HTMLDivElement; startX: number; scrollLeft: number } | null>(null);
  const didDragRef = useRef(false);

  const scrollHorizontal = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right", amount = 200) => {
    ref.current?.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = e.currentTarget;
    el.style.scrollBehavior = "auto";
    didDragRef.current = false;
    dragRef.current = { el, startX: e.clientX, scrollLeft: el.scrollLeft };
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current || dragRef.current.el !== el) return;
      const dx = dragRef.current.startX - e.clientX;
      el.scrollLeft = dragRef.current.scrollLeft + dx;
      dragRef.current.scrollLeft = el.scrollLeft;
      dragRef.current.startX = e.clientX;
      didDragRef.current = true;
    };
    const onEnd = () => {
      el.style.scrollBehavior = "";
      dragRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      setTimeout(() => { didDragRef.current = false; }, 0);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
  };

  const handleDragClickCapture = (e: React.MouseEvent) => {
    if (didDragRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    if (!plusMenuOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) setPlusMenuOpen(false);
    };
    window.addEventListener("mousedown", onOutside);
    return () => window.removeEventListener("mousedown", onOutside);
  }, [plusMenuOpen]);

  useEffect(() => {
    if (!settingsOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setSettingsOpen(false);
    };
    window.addEventListener("mousedown", onOutside);
    return () => window.removeEventListener("mousedown", onOutside);
  }, [settingsOpen]);

  const handleFromDevice = () => {
    setPlusMenuOpen(false);
    fileInputRef.current?.click();
  };
  const handleFromMediaLibrary = () => setPlusMenuOpen(false);

  const handleSubmitPrompt = useCallback(() => {
    const lines = prompt.split("\n").map((s) => s.trim()).filter(Boolean);
    if (lines.length === 0 || freeUses < 1) return;
    const maxCount = Math.min(lines.length, BULK_AMOUNT_MAX, freeUses);
    const promptsToUse = lines.slice(0, maxCount);
    const count = promptsToUse.length;
    if (count === 0) return;
    const now = new Date().toISOString();
    const entries: ChatEntry[] = promptsToUse.map((p) => ({
      id: crypto.randomUUID(),
      prompt: p,
      createdAt: now,
    }));
    setChatHistory((prev) => [...prev, ...entries]);
    setPrompt("");
    setFreeUses((u) => Math.max(0, u - count));
  }, [prompt, freeUses]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="flex-1 min-w-0 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-10">
          {/* Hero */}
          <div className="text-center mb-6">
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              Imagine it. Design it.
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter your ideas or pick a category to get started.
            </p>
          </div>

          {/* Prompt box */}
          <div className="relative rounded-xl border border-border bg-card overflow-hidden mb-6">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60">
              <div className="relative" ref={plusMenuRef}>
                <button
                  type="button"
                  onClick={() => setPlusMenuOpen((o) => !o)}
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  aria-label="Add or upload"
                  aria-expanded={plusMenuOpen}
                  aria-haspopup="true"
                >
                  <Plus size={20} />
                </button>
                {plusMenuOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-card py-0.5 shadow-lg">
                    <button
                      type="button"
                      onClick={handleFromDevice}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs text-foreground hover:bg-white/5 transition-colors"
                    >
                      <Monitor size={16} className="text-muted-foreground shrink-0" />
                      From device
                    </button>
                    <Link
                      to="/media-library"
                      onClick={handleFromMediaLibrary}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs text-foreground hover:bg-white/5 transition-colors"
                    >
                      <FolderOpen size={16} className="text-muted-foreground shrink-0" />
                      From media library
                    </Link>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={() => {}}
                  aria-hidden
                />
              </div>
<div className="relative" ref={settingsRef}>
                <button
                  type="button"
                  onClick={() => { setSettingsOpen((o) => !o); setPlusMenuOpen(false); }}
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  aria-label="Settings"
                  aria-expanded={settingsOpen}
                  aria-haspopup="true"
                >
                  <Settings size={18} />
                </button>
                {settingsOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-[320px] rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60">
                      <span className="text-xs font-semibold text-foreground">Model</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Auto</span>
                        <Switch checked={autoModel} onCheckedChange={setAutoModel} className="scale-75 origin-right" />
                      </div>
                    </div>
                    <div className="max-h-[280px] overflow-y-auto py-1">
                      {AI_MODELS.map((model) => (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => setSelectedModel(model.id)}
                          className={cn(
                            "w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors",
                            selectedModel === model.id ? "bg-primary/10" : "hover:bg-white/5"
                          )}
                        >
                          <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center shrink-0">
                            <Sparkles size={16} className="text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-medium text-foreground">{model.name}</span>
                              {model.tags.map((tag) => (
                                <span
                                  key={tag.label}
                                  className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded font-medium",
                                    tag.variant === "hot" && "bg-red-500/20 text-red-400",
                                    tag.variant === "new" && "bg-sky-500/20 text-sky-400",
                                    tag.variant === "neutral" && "bg-white/10 text-muted-foreground"
                                  )}
                                >
                                  {tag.label}
                                </span>
                              ))}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{model.description}</p>
                          </div>
                          {selectedModel === model.id && (
                            <Check size={16} className="text-primary shrink-0 mt-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0" />
            </div>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitPrompt();
                  }
                }}
                placeholder="Type one idea per line — each line becomes its own image. Add as many lines as you want."
                className="w-full min-h-[120px] px-4 py-3 pr-12 bg-transparent text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-0 border-0"
                rows={4}
              />
              <Button
                type="button"
                size="sm"
                className="absolute right-3 bottom-3 gap-1.5 text-xs"
                onClick={handleSubmitPrompt}
                disabled={!prompt.trim().split("\n").some((l) => l.trim()) || freeUses < 1}
              >
                <Send size={14} />
                Generate
              </Button>
            </div>
            <p className="px-4 pb-3 text-[11px] text-muted-foreground">
              One line = one prompt. Generate creates one image per line (max 1000 per run).
            </p>
          </div>

          {/* Category tags (Design type quick starters) */}
          <div className="mb-6">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Design templates
            </p>
            <div className="relative flex items-center gap-1">
              <div
                ref={templatesScrollRef}
                onMouseDown={handleDragStart}
                onClickCapture={handleDragClickCapture}
                className="flex-1 flex gap-1.5 overflow-x-auto overflow-y-hidden py-1 scroll-smooth cursor-grab active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {CATEGORY_TAGS.map((tag) => {
                  const Icon = tag.icon;
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setSelectedCategory(selectedCategory === tag.id ? null : tag.id)}
                      className={cn(
                        "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                        selectedCategory === tag.id
                          ? "bg-primary/15 text-primary border-primary/40"
                          : "bg-card text-muted-foreground border-border hover:border-white/20 hover:text-foreground"
                      )}
                    >
                      {Icon && <Icon size={14} className="shrink-0" />}
                      {tag.label}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => scrollHorizontal(templatesScrollRef, "right")}
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Templates – Design templates grid */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3">Templates</h2>
            <div className="relative flex items-center gap-1 mb-4">
              <div
                ref={inspirationScrollRef}
                onMouseDown={handleDragStart}
                onClickCapture={handleDragClickCapture}
                className="flex-1 flex gap-1.5 overflow-x-auto overflow-y-hidden py-1 scroll-smooth cursor-grab active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {INSPIRATION_FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setInspirationFilter(filter)}
                    className={cn(
                      "shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      inspirationFilter === filter
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
                onClick={() => scrollHorizontal(inspirationScrollRef, "right")}
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            {/* Pinterest-style masonry grid */}
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
              {PLACEHOLDER_TEMPLATES.map((item) => (
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
                  <div className="px-2.5 py-1.5">
                    <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{item.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

        {/* Right: Chat history / projects (same design as other sidebars) */}
        <aside className="w-[320px] min-w-[320px] shrink-0 flex flex-col border-l border-border/80 bg-card overflow-hidden hidden lg:flex">
          <div className="shrink-0 px-4 py-3 border-b border-border/60 flex items-center gap-2">
            <MessageSquare size={14} className="text-muted-foreground shrink-0" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Design history
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
            {chatHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8 px-2">
                Your designs will appear here. Enter an idea above and click Generate to create a project.
              </p>
            ) : (
              <ul className="space-y-3">
                {[...chatHistory].reverse().map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-lg border border-border bg-card/80 overflow-hidden"
                  >
                    <div className="px-3 py-2.5">
                      <p className="text-[12px] text-foreground line-clamp-3 break-words">
                        {entry.prompt}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        {formatTimeAgo(entry.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
