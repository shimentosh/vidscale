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

  return (
    <div
      className={cn(
        "relative group rounded-xl border border-border/50 bg-[#161B22]/40 transition-colors hover:border-border hover:bg-[#161B22]/60",
        isList ? "flex flex-row items-center gap-5 px-5 py-3.5" : "p-5"
      )}
    >
      {/* Minimal accent: thin left edge */}
      {kit.primaryColor && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
          style={{ backgroundColor: kit.primaryColor }}
          aria-hidden
        />
      )}

      <Link
        to={`/brand-kits/${kit.id}`}
        className={cn("flex min-w-0 flex-1 gap-4 pl-4 outline-none", isList && "flex-row items-start pl-5")}
        aria-label={`Open ${kit.name}`}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground truncate">
            {kit.name}
          </h3>
          {kit.description && (
            <p className={cn("text-[13px] text-muted-foreground mt-0.5 leading-snug", isList ? "truncate" : "line-clamp-2")}>
              {kit.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5 text-muted-foreground">
            {kit.primaryColor && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: kit.primaryColor }}
                aria-hidden
              />
            )}
            <span
              className="text-[11px]"
              title={new Date(kit.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
            >
              {formatFriendlyDate(kit.createdAt)}
            </span>
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(kit.id);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 shrink-0 p-1.5 rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-destructive/5 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
        aria-label={`Delete ${kit.name}`}
      >
        <Trash2 size={15} />
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
    <div className="flex flex-col h-full min-h-0 bg-[#0D1117]">
      <div className="flex-1 min-h-0 overflow-auto px-6 py-10">
        <div className="max-w-3xl mx-auto">
          {/* Minimal header */}
          <div className="flex items-center justify-between gap-4 mb-10">
            <h1 className="text-[15px] font-medium text-foreground/90 tracking-tight">
              Brand Kits
            </h1>
            <div className="flex items-center gap-2">
              {hasBrandKits && (
                <div className="flex rounded-md bg-white/[0.03] p-0.5" role="tablist" aria-label="View mode">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors",
                      viewMode === "grid" && "text-foreground bg-white/5"
                    )}
                    aria-pressed={viewMode === "grid"}
                    aria-label="Grid view"
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors",
                      viewMode === "list" && "text-foreground bg-white/5"
                    )}
                    aria-pressed={viewMode === "list"}
                    aria-label="List view"
                  >
                    <List size={15} />
                  </button>
                </div>
              )}
              <Link
                to="/brand-kits/new"
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus size={14} />
                Create New Kit
              </Link>
            </div>
          </div>

        {hasBrandKits ? (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {brandKits.map((kit) => (
                  <BrandKitCard key={kit.id} kit={kit} variant="grid" onDelete={handleDelete} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {brandKits.map((kit) => (
                  <BrandKitCard key={kit.id} kit={kit} variant="list" onDelete={handleDelete} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center min-h-[280px] py-12">
            <p className="text-[13px] text-muted-foreground">No brand kits yet.</p>
            <Link
              to="/brand-kits/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={14} />
              Create one
            </Link>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
