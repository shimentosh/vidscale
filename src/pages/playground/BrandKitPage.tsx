import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Plus, Info, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { getBrandKits } from "@/lib/brandKits";

const STORAGE_ENABLED = "vidscale-playground-brand-kit-enabled";
const STORAGE_KIT_ID = "vidscale-playground-brand-kit-id";

function loadBrandKitEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_ENABLED) === "true";
}

function saveBrandKitEnabled(enabled: boolean) {
  localStorage.setItem(STORAGE_ENABLED, String(enabled));
}

function loadSelectedKitId(): string | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(STORAGE_KIT_ID);
  return id || null;
}

function saveSelectedKitId(id: string | null) {
  if (id) localStorage.setItem(STORAGE_KIT_ID, id);
  else localStorage.removeItem(STORAGE_KIT_ID);
}

export function BrandKitPage() {
  const brandKits = useMemo(() => getBrandKits(), []);
  const [brandKitEnabled, setBrandKitEnabled] = useState(() => loadBrandKitEnabled());
  const [selectedKitId, setSelectedKitId] = useState<string | null>(() => loadSelectedKitId());
  const hasBrandKits = brandKits.length > 0;

  useEffect(() => {
    saveBrandKitEnabled(brandKitEnabled);
  }, [brandKitEnabled]);

  useEffect(() => {
    saveSelectedKitId(selectedKitId);
  }, [selectedKitId]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <div className="shrink-0 h-11 px-4 flex items-center gap-3 border-b border-border bg-card">
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Step 8</span>
          <ChevronRight size={12} className="text-muted-foreground/50 shrink-0" aria-hidden />
          <h1 className="text-sm font-semibold text-foreground truncate">Brand Kit</h1>
        </div>
        <div className="flex-1 min-w-0" />
        <Link
          to="/brand-kits"
          className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          Manage brand kits
        </Link>
        <Link
          to="/brand-kits/new"
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus size={12} />
          Create kit
        </Link>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="max-w-2xl mx-auto px-5 py-5">
            <section className="rounded-md border border-border bg-card overflow-hidden">
              <div className="shrink-0 px-3 py-2 border-b border-border flex items-center justify-between gap-2 bg-card/80">
                <div className="flex items-center gap-2">
                  <Settings2 size={12} className="text-muted-foreground shrink-0" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Brand kit</span>
                  <span className="text-[10px] text-muted-foreground/80">(optional)</span>
                </div>
                <Switch checked={brandKitEnabled} onCheckedChange={setBrandKitEnabled} className="scale-75 origin-right" />
              </div>
              <div className="p-3 space-y-3">
                {brandKitEnabled && (
                  <>
                    <div className="flex items-start gap-2 rounded px-2 py-1.5 bg-primary/5 border border-primary/20">
                      <Info size={14} className="text-primary shrink-0 mt-0.5" aria-hidden />
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground leading-snug">
                          A brand kit stores your visual identity (colors, fonts, watermark, CTA) and is applied on export. Create or manage kits via the links above.
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block mb-2">Select kit</Label>
                      {hasBrandKits ? (
                        <div className="space-y-0.5 rounded border border-border/60 bg-background/30 overflow-hidden">
                          {brandKits.map((kit) => (
                            <label
                              key={kit.id}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2 cursor-pointer text-[12px] transition-colors border-b border-border/40 last:border-b-0",
                                selectedKitId === kit.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                              )}
                            >
                              <input
                                type="radio"
                                name="brand-kit"
                                value={kit.id}
                                checked={selectedKitId === kit.id}
                                onChange={() => setSelectedKitId(kit.id)}
                                className="h-3 w-3 shrink-0 accent-primary border-border bg-background focus:ring-2 focus:ring-primary/25 focus:ring-offset-0"
                              />
                              {kit.primaryColor && (
                                <span className="w-2 h-2 rounded-full shrink-0 border border-white/10" style={{ backgroundColor: kit.primaryColor }} aria-hidden />
                              )}
                              <span className="flex-1 min-w-0 truncate">{kit.name}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground py-2">No brand kits. <Link to="/brand-kits/new" className="text-primary hover:underline">Create one</Link></p>
                      )}
                    </div>
                  </>
                )}
                {!brandKitEnabled && (
                  <p className="text-[11px] text-muted-foreground">Turn on to apply a brand kit when exporting.</p>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      <div className="shrink-0 h-9 px-4 flex items-center justify-between border-t border-border bg-card">
        <span className="text-[11px] text-muted-foreground">
          {brandKitEnabled ? (selectedKitId ? "1 kit selected" : "No kit selected") : "Brand kit off"}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" className="h-7 text-xs px-3 text-muted-foreground hover:text-foreground" asChild>
            <Link to="/">Skip</Link>
          </Button>
          <Button size="sm" className="h-7 text-xs px-4" asChild>
            <Link to="/playground/export">Continue to Export</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
