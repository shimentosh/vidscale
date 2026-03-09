import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Cloud, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "vidscale-storage-connections";

export type StorageProvider = "r2" | "digitalocean" | "aws" | "other";

export type StorageConnection = {
  id: string;
  provider: StorageProvider;
  name: string;
  accountId?: string;
  endpoint?: string;
  region?: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
};

const PROVIDERS: { id: StorageProvider; label: string; description: string }[] = [
  { id: "r2", label: "Cloudflare R2", description: "S3-compatible, no egress fees" },
  { id: "digitalocean", label: "DigitalOcean Spaces", description: "S3-compatible object storage" },
  { id: "aws", label: "AWS S3", description: "Amazon Simple Storage Service" },
  { id: "other", label: "Other (S3-compatible)", description: "Any S3-compatible endpoint" },
];

function loadConnections(): StorageConnection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveConnections(connections: StorageConnection[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
}

const defaultConnection: Omit<StorageConnection, "id"> = {
  provider: "r2",
  name: "",
  accountId: "",
  endpoint: "",
  region: "",
  accessKeyId: "",
  secretAccessKey: "",
  bucketName: "",
  publicUrl: "",
};

export function SettingsStorage() {
  const [connections, setConnections] = useState<StorageConnection[]>(() => loadConnections());
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<Omit<StorageConnection, "id">>(defaultConnection);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    saveConnections(connections);
  }, [connections]);

  const updateForm = (field: keyof StorageConnection) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setFormProvider = (provider: StorageProvider) => {
    setForm((prev) => ({ ...prev, provider }));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.bucketName.trim() || !form.accessKeyId.trim() || !form.secretAccessKey.trim())
      return;
    const conn: StorageConnection = {
      ...form,
      id: crypto.randomUUID(),
      accountId: form.accountId?.trim() || undefined,
      endpoint: form.endpoint?.trim() || undefined,
      region: form.region?.trim() || undefined,
      publicUrl: form.publicUrl?.trim() || undefined,
    };
    setConnections((prev) => [...prev, conn]);
    setForm(defaultConnection);
    setAddOpen(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemove = (id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
  };

  const providerLabel = (p: StorageProvider) => PROVIDERS.find((x) => x.id === p)?.label ?? p;

  return (
    <div className="py-10 px-8 max-w-2xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Storage
        </h1>
        <div className="mt-1 flex items-center gap-3">
          <p className="text-sm text-muted-foreground min-w-0 flex-1">
            Add one or more cloud storage connections. Use R2, DigitalOcean Spaces, AWS S3, or any S3-compatible service.
          </p>
          <Button
            type="button"
            size="sm"
            className="shrink-0 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              setForm(defaultConnection);
              setAddOpen(true);
            }}
          >
            <Plus size={16} />
            Add storage
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {connections.length === 0 ? (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <HardDrive size={40} className="text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">No storage connected</p>
              <p className="text-xs text-muted-foreground mt-1 text-center max-w-sm">
                Add Cloudflare R2, DigitalOcean Spaces, AWS S3, or another S3-compatible storage to store and serve media.
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-4 gap-2"
                onClick={() => setAddOpen(true)}
              >
                <Plus size={16} />
                Add storage
              </Button>
            </CardContent>
          </Card>
        ) : (
          connections.map((conn) => (
            <Card key={conn.id} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Cloud size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-base text-foreground">
                        {conn.name || conn.bucketName}
                      </CardTitle>
                      <CardDescription className="mt-0.5">
                        {providerLabel(conn.provider)} · {conn.bucketName}
                        {conn.region && ` · ${conn.region}`}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleRemove(conn.id)}
                    aria-label={`Remove ${conn.name}`}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
        {saved && <p className="text-xs text-primary">Storage added.</p>}
      </div>

      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setAddOpen(false)}
          aria-hidden
        >
          <div
            className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="add-storage-title"
          >
            <h2 id="add-storage-title" className="text-lg font-semibold text-foreground mb-1">
              Add storage
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Choose a provider and enter your bucket credentials.
            </p>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Provider</Label>
                <Select value={form.provider} onValueChange={(v) => setFormProvider(v as StorageProvider)}>
                  <SelectTrigger className="w-full bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="st-name" className="text-foreground">Connection name</Label>
                <Input
                  id="st-name"
                  placeholder="e.g. My media bucket"
                  value={form.name}
                  onChange={updateForm("name")}
                  className="bg-background border-border"
                />
              </div>

              {form.provider === "r2" && (
                <div className="space-y-2">
                  <Label htmlFor="st-account" className="text-foreground">Account ID</Label>
                  <Input
                    id="st-account"
                    placeholder="Cloudflare account ID"
                    value={form.accountId ?? ""}
                    onChange={updateForm("accountId")}
                    className="bg-background border-border"
                  />
                </div>
              )}

              {(form.provider === "digitalocean" || form.provider === "aws") && (
                <div className="space-y-2">
                  <Label htmlFor="st-region" className="text-foreground">Region</Label>
                  <Input
                    id="st-region"
                    placeholder={form.provider === "digitalocean" ? "e.g. nyc3" : "e.g. us-east-1"}
                    value={form.region ?? ""}
                    onChange={updateForm("region")}
                    className="bg-background border-border"
                  />
                </div>
              )}

              {form.provider === "other" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="st-endpoint" className="text-foreground">Endpoint URL</Label>
                    <Input
                      id="st-endpoint"
                      placeholder="https://s3.example.com"
                      value={form.endpoint ?? ""}
                      onChange={updateForm("endpoint")}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="st-region-other" className="text-foreground">Region (optional)</Label>
                    <Input
                      id="st-region-other"
                      placeholder="e.g. us-east-1"
                      value={form.region ?? ""}
                      onChange={updateForm("region")}
                      className="bg-background border-border"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="st-access" className="text-foreground">Access Key ID</Label>
                <Input
                  id="st-access"
                  placeholder="Access key"
                  value={form.accessKeyId}
                  onChange={updateForm("accessKeyId")}
                  className="bg-background border-border"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="st-secret" className="text-foreground">Secret Access Key</Label>
                <Input
                  id="st-secret"
                  type="password"
                  placeholder="Secret key"
                  value={form.secretAccessKey}
                  onChange={updateForm("secretAccessKey")}
                  className="bg-background border-border"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="st-bucket" className="text-foreground">Bucket name</Label>
                <Input
                  id="st-bucket"
                  placeholder="your-bucket-name"
                  value={form.bucketName}
                  onChange={updateForm("bucketName")}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="st-public" className="text-foreground">Public URL (optional)</Label>
                <Input
                  id="st-public"
                  placeholder="https://cdn.example.com or custom domain"
                  value={form.publicUrl ?? ""}
                  onChange={updateForm("publicUrl")}
                  className="bg-background border-border"
                />
                <p className="text-xs text-muted-foreground">Used to build public URLs for stored files.</p>
              </div>

              <div className={cn("flex gap-2 pt-2")}>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Add storage
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
