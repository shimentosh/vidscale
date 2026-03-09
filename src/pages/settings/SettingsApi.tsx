import { useState, useCallback } from "react";
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
import { Plus, X, Trash2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const CLOUD_PROVIDERS = [
  { id: "openai", label: "OpenAI" },
  { id: "azure-openai", label: "Azure OpenAI" },
  { id: "anthropic", label: "Anthropic (Claude)" },
  { id: "google", label: "Google (Gemini)" },
  { id: "deepseek", label: "DeepSeek" },
  { id: "xai", label: "xAI (Grok)" },
  { id: "nvidia", label: "Nvidia" },
] as const;

type ApiKeyEntry = {
  id: string;
  provider: string;
  name: string;
  keyPreview: string;
  status: "active" | "inactive";
  usage?: string;
  date?: string;
};

const STORAGE_KEY = "vidscale-api-keys";

function loadApiKeys(): ApiKeyEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveApiKeys(keys: ApiKeyEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function SettingsApi() {
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>(() => loadApiKeys());
  const [addOpen, setAddOpen] = useState(false);
  const [addProvider, setAddProvider] = useState<string>(CLOUD_PROVIDERS[0].id);
  const [addName, setAddName] = useState("");
  const [addKey, setAddKey] = useState("");
  const [addTestStatus, setAddTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [addTestError, setAddTestError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleTestKey = () => {
    if (!addKey.trim()) {
      setAddTestError("Enter an API key first.");
      setAddTestStatus("error");
      return;
    }
    setAddTestStatus("testing");
    setAddTestError("");
    // Simulate API test (replace with real provider validation in production)
    setTimeout(() => {
      const key = addKey.trim();
      const looksValid = key.length >= 10 && (key.startsWith("sk-") || key.startsWith("xai-") || /^[a-zA-Z0-9-_]+$/.test(key));
      if (looksValid) {
        setAddTestStatus("success");
      } else {
        setAddTestStatus("error");
        setAddTestError("Key format looks invalid. Check your key and try again.");
      }
    }, 800);
  };

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addKey.trim() || addTestStatus !== "success") return;
    const providerLabel = CLOUD_PROVIDERS.find((p) => p.id === addProvider)?.label ?? addProvider;
    const entry: ApiKeyEntry = {
      id: crypto.randomUUID(),
      provider: providerLabel,
      name: addName.trim() || providerLabel,
      keyPreview: addKey.trim().slice(0, 6) + "…" + addKey.trim().slice(-4),
      status: "active",
      usage: "0 requests",
      date: new Date().toLocaleDateString(),
    };
    setApiKeys((prev) => [...prev, entry]);
    saveApiKeys([...apiKeys, entry]);
    setAddOpen(false);
    setAddName("");
    setAddKey("");
    setAddTestStatus("idle");
    setAddTestError("");
    setAddProvider(CLOUD_PROVIDERS[0].id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testKeyRow = (row: ApiKeyEntry) => {
    // We don't store full keys; prompt user to re-add to test
    setAddOpen(true);
    setAddTestStatus("idle");
  };

  const removeKey = useCallback(
    (id: string) => {
      const next = apiKeys.filter((k) => k.id !== id);
      setApiKeys(next);
      saveApiKeys(next);
    },
    [apiKeys]
  );

  return (
    <div className="py-10 px-8 max-w-3xl">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            API Keys
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personal API keys. These keys take precedence over system keys.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => {
            setAddTestStatus("idle");
            setAddTestError("");
            setAddOpen(true);
          }}
        >
          <Plus size={16} />
          Add API
        </Button>
      </div>

      <div className="space-y-8">
        {/* My API Keys */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">My API Keys</CardTitle>
            <CardDescription>
              Configure your own keys for OpenAI, Anthropic, Gemini, and others. You can add multiple keys per provider.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center rounded-lg border border-dashed border-border bg-muted/20">
                No API keys yet. Click &quot;Add API&quot; to add one.
              </p>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left font-medium text-foreground px-4 py-3">Provider</th>
                      <th className="text-left font-medium text-foreground px-4 py-3">Name</th>
                      <th className="text-left font-medium text-foreground px-4 py-3">Status</th>
                      <th className="text-left font-medium text-foreground px-4 py-3">Usage</th>
                      <th className="w-10 px-4 py-3" aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((row) => (
                      <tr key={row.id} className="border-b border-border/80 hover:bg-muted/20">
                        <td className="px-4 py-3 text-foreground">{row.provider}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.name}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                              row.status === "active"
                                ? "bg-primary/20 text-primary"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {row.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.usage ?? "—"} {row.date ? `· ${row.date}` : ""}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => testKeyRow(row)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10"
                              aria-label={`Test ${row.name}`}
                              title="Test connection"
                            >
                              <Play size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeKey(row.id)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              aria-label={`Remove ${row.name}`}
                              title="Remove key"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {saved && (
              <p className="text-xs text-primary mt-3">Saved.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add API Key modal */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setAddOpen(false)}
          aria-hidden
        >
          <div
            className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="add-api-key-title"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="add-api-key-title" className="text-lg font-semibold text-foreground">
                Add API Key
              </h2>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Add your own AI provider API key.
            </p>
            <form onSubmit={handleAddKey} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Provider</Label>
                <Select
                  value={addProvider}
                  onValueChange={(v) => {
                    setAddProvider(v);
                    setAddTestStatus("idle");
                    setAddTestError("");
                  }}
                >
                  <SelectTrigger className="w-full bg-background border-border">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLOUD_PROVIDERS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-name" className="text-foreground">Name (optional)</Label>
                <Input
                  id="add-name"
                  placeholder="e.g. My OpenAI key"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-key" className="text-foreground">API Key *</Label>
                <Input
                  id="add-key"
                  type="password"
                  placeholder="sk-... or your key"
                  value={addKey}
                  onChange={(e) => {
                    setAddKey(e.target.value);
                    setAddTestStatus("idle");
                    setAddTestError("");
                  }}
                  className="bg-background border-border"
                  autoComplete="off"
                />
              </div>
              {addTestStatus === "success" && (
                <p className="text-xs text-primary font-medium">Test passed. You can add this key.</p>
              )}
              {addTestStatus === "error" && addTestError && (
                <p className="text-xs text-destructive">{addTestError}</p>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestKey}
                  disabled={addTestStatus === "testing" || !addKey.trim()}
                  className="gap-1.5"
                >
                  <Play size={14} />
                  {addTestStatus === "testing" ? "Testing…" : "Test"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                {addTestStatus === "success" && (
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Add key
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
