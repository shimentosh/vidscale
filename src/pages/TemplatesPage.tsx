import { useState, useRef } from "react";
import { ImageIcon, ChevronRight, MessageSquarePlus, X, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

export function TemplatesPage() {
  const [templateFilter, setTemplateFilter] = useState<string>("All");
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestLink, setRequestLink] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const templatesScrollRef = useRef<HTMLDivElement>(null);

  const scrollTemplatesRight = () => {
    templatesScrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  const openRequestModal = () => {
    setRequestLink("");
    setRequestDescription("");
    setRequestModalOpen(true);
  };

  const closeRequestModal = () => setRequestModalOpen(false);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestDescription.trim()) return;
    // In a real app: send requestLink + requestDescription to your backend
    closeRequestModal();
  };

  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-background">
      <div className="shrink-0 flex items-center justify-between gap-4 py-5 px-8 border-b border-border bg-background/40">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and use templates for videos and assets.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-2 border-border bg-card hover:bg-card/90"
          onClick={openRequestModal}
        >
          <MessageSquarePlus size={16} />
          Request Template
        </Button>
      </div>

      {/* Request Template modal */}
      {requestModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={closeRequestModal}
          aria-hidden
        >
          <div
            className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="request-template-title"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="request-template-title" className="text-lg font-semibold text-foreground">
                Request a template
              </h2>
              <button
                type="button"
                onClick={closeRequestModal}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Share a link to a video or reference and describe what you need. We&apos;ll consider adding it as a template.
            </p>
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="request-link" className="text-foreground">
                  Link to video or reference
                </Label>
                <div className="relative">
                  <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    id="request-link"
                    type="url"
                    placeholder="https://... (YouTube, Vimeo, or image URL)"
                    value={requestLink}
                    onChange={(e) => setRequestLink(e.target.value)}
                    className="pl-9 bg-background border-border"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Optional. Paste a link so we can match the style you want.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-description" className="text-foreground">
                  What do you need?
                </Label>
                <textarea
                  id="request-description"
                  placeholder="e.g. A 15s product reveal with text overlay, vertical format for Instagram..."
                  value={requestDescription}
                  onChange={(e) => setRequestDescription(e.target.value)}
                  rows={4}
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeRequestModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!requestDescription.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Submit request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-auto p-8">
        <section>
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
      </div>
    </div>
  );
}
