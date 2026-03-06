import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Sparkles, Briefcase, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getBrandKits, type BrandKit } from "@/lib/brandKits";

type ViewMode = "grid" | "list";

function BrandKitIcon({ className, size = "md", color }: { className?: string; size?: "md" | "lg"; color?: string }) {
  const isLg = size === "lg";
  const usePrimary = !color;
  return (
    <div
      className={cn(
        "rounded-lg flex items-center justify-center font-bold shrink-0 border",
        isLg ? "w-20 h-20 text-3xl" : "w-9 h-9 text-lg",
        usePrimary && "bg-primary text-primary-foreground border-primary/50",
        className
      )}
      style={color ? { backgroundColor: color, color: "#0D1117", borderColor: "rgba(255,255,255,0.3)" } : undefined}
    >
      B
    </div>
  );
}

function BrandKitCard({ kit, variant = "grid" }: { kit: BrandKit; variant?: ViewMode }) {
  const isList = variant === "list";
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-[#161B22] flex hover:border-primary/40 hover:bg-[#1C2128] transition-colors",
        isList ? "flex-row items-center gap-4 px-4 py-3" : "items-start gap-4 p-4"
      )}
    >
      <BrandKitIcon size="md" color={kit.primaryColor} className={isList ? "shrink-0" : undefined} />
      <div className={cn("flex-1 min-w-0", isList ? "flex items-center gap-4 min-w-0" : "")}>
        <div className={cn("min-w-0", isList && "flex-1")}>
          <h3 className="text-sm font-semibold text-foreground truncate">{kit.name}</h3>
          {kit.description && (
            <p className={cn("text-xs text-muted-foreground", isList ? "truncate" : "mt-0.5 line-clamp-2")}>
              {kit.description}
            </p>
          )}
        </div>
        <div className={cn("flex items-center gap-2 shrink-0", !isList && "mt-2")}>
          {kit.primaryColor && (
            <span
              className="w-3 h-3 rounded-full border border-white/20 shrink-0"
              style={{ backgroundColor: kit.primaryColor }}
              aria-hidden
            />
          )}
          <span className="text-[11px] text-muted-foreground">
            {new Date(kit.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
          </span>
        </div>
      </div>
      <Briefcase size={16} className="text-muted-foreground shrink-0" />
    </div>
  );
}

export function BrandKitsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const brandKits = getBrandKits();
  const hasBrandKits = brandKits.length > 0;

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0D1117]">
      {/* Toolbar – desktop app style */}
      <div className="shrink-0 h-12 px-4 flex items-center justify-between border-b border-border bg-[#161B22]">
        <div className="flex items-center gap-3">
          <BrandKitIcon size="md" />
          <div>
            <h1 className="text-sm font-semibold text-foreground">Brand Kits</h1>
            <p className="text-[11px] text-muted-foreground">Create and manage brand assets for consistent video styling.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasBrandKits && (
            <div className="flex rounded-md border border-border bg-[#0D1117] p-0.5" role="tablist" aria-label="View mode">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors",
                  viewMode === "grid" && "bg-primary/20 text-primary"
                )}
                aria-pressed={viewMode === "grid"}
                aria-label="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors",
                  viewMode === "list" && "bg-primary/20 text-primary"
                )}
                aria-pressed={viewMode === "list"}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          )}
          <Button className="gap-2 h-8 text-xs rounded-md" size="sm" asChild>
            <Link to="/brand-kits/new">
              <Plus size={16} />
              New Brand Kit
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto px-6 py-6">
        {hasBrandKits ? (
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-muted-foreground mb-4">
              {brandKits.length} brand kit{brandKits.length !== 1 ? "s" : ""}
            </p>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {brandKits.map((kit) => (
                  <BrandKitCard key={kit.id} kit={kit} variant="grid" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {brandKits.map((kit) => (
                  <BrandKitCard key={kit.id} kit={kit} variant="list" />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center max-w-sm h-full min-h-[280px] mx-auto">
            <BrandKitIcon size="lg" className="mb-4" />
            <h2 className="text-base font-semibold text-foreground">No brand kits yet</h2>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Brand kits help you maintain consistent styling across all your videos with logos, colors, fonts, and more.
            </p>
            <Button className="mt-6 gap-2 h-9 text-xs rounded-md" size="sm" asChild>
              <Link to="/brand-kits/new">
                <Sparkles size={16} />
                Create your first brand kit
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
