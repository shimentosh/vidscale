import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, LayoutGrid, List, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBrandKits, deleteBrandKit, type BrandKit } from "@/lib/brandKits";

type ViewMode = "grid" | "list";

function formatFriendlyDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const then = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return `${diffDays} days ago`;
  if (diffDays > 7 && diffDays <= 14) return "Last week";
  if (diffDays > 14 && diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
  });
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "BK";
}

function BrandIcon({ kit, size = "lg" }: { kit: BrandKit; size?: "sm" | "lg" | "lgSquare" }) {
  const isSm = size === "sm";
  const isSquare = size === "lgSquare";
  const bg = kit.primaryColor || "var(--primary)";

  if (kit.logoUrl) {
    return (
      <div className={cn(
        isSm ? "w-12 h-12 rounded-xl overflow-hidden shrink-0" : "overflow-hidden bg-muted",
        isSquare ? "w-[50%] aspect-square rounded-xl shrink-0" : "relative w-full rounded-t-xl"
      )}>
        {!isSm && !isSquare && <div className="pb-[100%]" aria-hidden />}
        <img
          src={kit.logoUrl}
          alt=""
          className={cn(
            isSm ? "w-full h-full object-cover" : "object-cover",
            isSquare ? "w-full h-full" : "absolute inset-0 w-full h-full"
          )}
        />
      </div>
    );
  }

  if (isSm) {
    return (
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
        style={{ backgroundColor: bg }}
      >
        {getInitials(kit.name)}
      </div>
    );
  }

  if (isSquare) {
    return (
      <div
        className="w-[50%] aspect-square rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shrink-0 shadow-sm"
        style={{ backgroundColor: bg }}
      >
        {getInitials(kit.name)}
      </div>
    );
  }

  /* Grid card full-width: enforce square with padding-bottom trick */
  return (
    <div className="relative w-full shrink-0 rounded-t-xl overflow-hidden" style={{ backgroundColor: bg }}>
      <div className="pb-[100%]" aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl">
        {getInitials(kit.name)}
      </div>
    </div>
  );
}

function BrandKitCard({
  kit,
  variant = "grid",
  onDelete,
}: {
  kit: BrandKit;
  variant?: ViewMode;
  onDelete: (id: string) => void;
}) {
  const isList = variant === "list";
  const accent = kit.primaryColor || "var(--primary)";

  return (
    <div
      className={cn(
        "relative group overflow-hidden transition-all duration-200",
        isList ? "rounded-xl border border-border bg-card grid grid-cols-[56px_1fr_auto_44px] md:grid-cols-[64px_1fr_100px_44px] gap-3 md:gap-4 items-center px-3 py-3 md:px-4 md:py-3 min-h-[72px] hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20" : "rounded-2xl w-full min-h-[200px] flex flex-col border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 hover:border-border hover:scale-[1.02] hover:-translate-y-0.5"
      )}
    >
      <Link
        to={`/brand-kits/${kit.id}`}
        className={cn(
          "flex min-w-0 outline-none",
          isList ? "col-span-1 flex items-center shrink-0" : "flex-col"
        )}
        aria-label={`Open ${kit.name}`}
      >
        {isList ? (
          <>
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl shrink-0 overflow-hidden flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{ backgroundColor: kit.primaryColor || "var(--primary)" }}>
              {kit.logoUrl ? (
                <img src={kit.logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                getInitials(kit.name)
              )}
            </div>
          </>
        ) : null}
      </Link>
      {isList ? (
        <Link to={`/brand-kits/${kit.id}`} className="min-w-0 flex flex-col justify-center py-1 outline-none col-span-1">
          <h3 className="text-sm font-semibold text-foreground truncate">{kit.name}</h3>
          {kit.description ? (
            <p className="text-[13px] text-muted-foreground mt-0.5 truncate">{kit.description}</p>
          ) : (
            <p className="text-[11px] text-muted-foreground mt-0.5">{formatFriendlyDate(kit.createdAt)}</p>
          )}
          {kit.description && (
            <p className="text-[11px] text-muted-foreground mt-1 md:hidden">{formatFriendlyDate(kit.createdAt)}</p>
          )}
        </Link>
      ) : null}
      {isList ? (
        <Link to={`/brand-kits/${kit.id}`} className="hidden md:block text-xs text-muted-foreground shrink-0 outline-none py-1">
          {formatFriendlyDate(kit.createdAt)}
        </Link>
      ) : null}
      {!isList && (
        <Link
          to={`/brand-kits/${kit.id}`}
          className="flex flex-1 flex-col min-h-0 outline-none rounded-2xl p-6 pb-5 text-center sm:text-left"
          aria-label={`Open ${kit.name}`}
        >
          {/* Soft tint strip at top */}
          <div className="absolute inset-x-0 top-0 h-20 rounded-t-2xl opacity-[0.06] pointer-events-none" style={{ backgroundColor: accent }} aria-hidden />
          {/* Circle logo */}
          <div className="relative flex justify-center sm:justify-start mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg ring-4 ring-black/5 dark:ring-white/10 shrink-0"
              style={{ backgroundColor: accent }}
            >
              {kit.logoUrl ? (
                <img src={kit.logoUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(kit.name)
              )}
            </div>
          </div>
          <h3 className="relative text-base font-semibold text-foreground truncate mb-1">{kit.name}</h3>
          <p className="relative text-[13px] text-muted-foreground line-clamp-2 min-h-[2.5rem] leading-snug">
            {kit.description || "Add a short description in settings"}
          </p>
          <p className="relative text-[11px] text-muted-foreground/80 mt-auto pt-3">
            Updated {formatFriendlyDate(kit.createdAt)}
          </p>
        </Link>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(kit.id);
        }}
        className={cn(
          "p-2 rounded-lg text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors focus:outline-none shrink-0",
          isList ? "opacity-70 hover:opacity-100" : "absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus:opacity-100"
        )}
        aria-label={`Delete ${kit.name}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export function BrandKitsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [brandKits, setBrandKits] = useState<BrandKit[]>(() => getBrandKits());
  const hasBrandKits = brandKits.length > 0;

  const refreshKits = useCallback(() => setBrandKits(getBrandKits()), []);
  const handleDelete = useCallback(
    (id: string) => {
      if (deleteBrandKit(id)) refreshKits();
    },
    [refreshKits]
  );

  return (
    <div className="flex flex-col w-full h-full min-h-0">
      <div className="flex-1 min-w-0 overflow-auto">
        {/* Header: title + description, Grid/List toggle on the right */}
        <div className="shrink-0 border-b border-border bg-background/40">
          <div className="py-5 px-6 md:px-8 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground tracking-tight">Brand Kits</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Manage logos, colors, and styles for your videos. Create a kit to keep branding consistent.
              </p>
            </div>
            {hasBrandKits && (
              <div className="flex rounded-lg bg-muted/50 p-0.5 shrink-0" role="tablist" aria-label="View mode">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                    viewMode === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-pressed={viewMode === "grid"}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={14} />
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                    viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-pressed={viewMode === "list"}
                  aria-label="List view"
                >
                  <List size={14} />
                  List
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8">
          {hasBrandKits ? (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  <Link
                    to="/brand-kits/new"
                    className="min-h-[200px] rounded-2xl border-2 border-dashed border-border bg-card/50 hover:border-primary/40 hover:bg-card hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-3 py-10 px-6 shadow-sm"
                  >
                    <div className="rounded-2xl bg-muted/80 border-2 border-dashed border-border flex items-center justify-center w-14 h-14 shrink-0">
                      <Plus size={28} className="text-muted-foreground" aria-hidden />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Create New Kit</span>
                    <span className="text-xs text-muted-foreground text-center">New branding kit</span>
                  </Link>
                  {brandKits.map((kit) => (
                    <BrandKitCard key={kit.id} kit={kit} variant="grid" onDelete={handleDelete} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <Link
                    to="/brand-kits/new"
                    className="grid grid-cols-[56px_1fr_auto_44px] md:grid-cols-[64px_1fr_100px_44px] gap-3 md:gap-4 items-center w-full px-3 py-3 md:px-4 border-b border-border/60 hover:bg-white/5 transition-colors text-left rounded-t-lg"
                  >
                    <div className="w-10 h-10 rounded-lg bg-card border-2 border-dashed border-border flex items-center justify-center shrink-0">
                      <Plus size={20} className="text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Create New Kit</span>
                    <span className="hidden md:inline text-xs text-muted-foreground">—</span>
                    <span />
                  </Link>
                  <div className="grid grid-cols-[56px_1fr_auto_44px] md:grid-cols-[64px_1fr_100px_44px] gap-3 md:gap-4 px-3 py-2.5 md:px-4 border-b border-border bg-background/60 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <span />
                    <span>Name</span>
                    <span className="hidden md:inline">Updated</span>
                    <span />
                  </div>
                  {brandKits.map((kit) => (
                    <BrandKitCard key={kit.id} kit={kit} variant="list" onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center min-h-[320px] py-12">
              <p className="text-sm font-medium text-foreground">No brand kits yet</p>
              <p className="text-[13px] text-muted-foreground mt-1 max-w-sm">
                Create a kit to set your logo, colors, and style for videos.
              </p>
              <Link
                to="/brand-kits/new"
                className="mt-6 rounded-lg border-2 border-dashed border-border bg-transparent hover:border-muted-foreground/50 hover:bg-white/5 transition-colors flex flex-col items-center justify-center min-h-[180px] py-8 px-4 w-full max-w-[280px]"
              >
                <div className="rounded-full bg-card border border-border flex items-center justify-center w-12 h-12 shrink-0">
                  <Plus size={24} className="text-muted-foreground" aria-hidden />
                </div>
                <span className="text-sm font-medium text-foreground mt-3">Create your first kit</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
