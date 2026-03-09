import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Cloud, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "vidscale-integrations";

type IntegrationId = "dropbox" | "google-drive" | "one-drive" | "icloud";

const INTEGRATIONS: { id: IntegrationId; name: string; description: string }[] = [
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Access and sync files from your Dropbox account. Import media and export projects.",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Connect Google Drive to use files in your projects and back up your media library.",
  },
  {
    id: "one-drive",
    name: "OneDrive",
    description: "Link your Microsoft OneDrive to import and sync files across devices.",
  },
  {
    id: "icloud",
    name: "iCloud Drive",
    description: "Use files from iCloud Drive in VidScale. Available on supported devices.",
  },
];

function loadConnected(): Set<IntegrationId> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveConnected(ids: IntegrationId[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function SettingsIntegration() {
  const [connected, setConnected] = useState<Set<IntegrationId>>(() => loadConnected());
  const [connecting, setConnecting] = useState<IntegrationId | null>(null);

  useEffect(() => {
    saveConnected(Array.from(connected));
  }, [connected]);

  const handleConnect = (id: IntegrationId) => {
    setConnecting(id);
    // Simulate OAuth flow; in production would redirect to provider
    setTimeout(() => {
      setConnected((prev) => new Set(prev).add(id));
      setConnecting(null);
    }, 1200);
  };

  const handleDisconnect = (id: IntegrationId) => {
    setConnected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <div className="py-8 px-6 md:px-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          Integration
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Connect cloud storage to import media and sync files.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {INTEGRATIONS.map((integration) => {
          const isConnected = connected.has(integration.id);
          const isConnecting = connecting === integration.id;

          return (
            <div
              key={integration.id}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg border border-border/80 bg-card/50 px-3 py-2.5 transition-all hover:border-border hover:bg-card hover:shadow-sm",
                isConnected && "border-primary/20 bg-primary/5"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                  isConnected ? "bg-primary/15 text-primary" : "bg-muted/80 text-muted-foreground group-hover:bg-muted"
                )}
              >
                <Cloud size={16} />
              </div>
              <p className="min-w-0 flex-1 text-sm font-medium text-foreground truncate">
                {integration.name}
              </p>
              <div className="shrink-0">
                {isConnected ? (
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                      <CheckCircle size={11} />
                      On
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDisconnect(integration.id)}
                    >
                      Off
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    className="h-6 gap-1 px-2 text-[10px] bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleConnect(integration.id)}
                    disabled={isConnecting}
                  >
                    <Link2 size={11} />
                    {isConnecting ? "…" : "Connect"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground mt-4">
        Connecting opens the provider&apos;s sign-in. Revoke access here or in your account on the provider&apos;s site.
      </p>
    </div>
  );
}
