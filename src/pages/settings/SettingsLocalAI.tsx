import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Download, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const LOCAL_AI_OPTIONS = [
  {
    id: "minimax",
    name: "MiniMax",
    model: "minimax-m2",
    modelSize: "230B params",
    description: "MiniMax M2 excels in coding, reasoning, and office tasks. Run locally or via API.",
    tags: ["coding", "reasoning"],
    installUrl: "https://github.com/minimax-ai",
    installed: false,
  },
  {
    id: "qwen",
    name: "Qwen",
    model: "qwen2.5",
    modelSize: "0.5B–72B (varies)",
    description: "Qwen 2.5 by Alibaba: strong multilingual coding and general tasks. Run locally.",
    tags: ["coding", "multilingual"],
    installUrl: "https://github.com/QwenLM/Qwen2",
    installed: false,
  },
  {
    id: "ollama",
    name: "Ollama",
    model: "ollama",
    modelSize: "Varies (e.g. 7B–70B)",
    description: "Run LLaMA, Mistral, and other models locally. One install, many models.",
    tags: ["local", "llm"],
    installUrl: "https://ollama.com",
    installed: false,
  },
  {
    id: "lm-studio",
    name: "LM Studio",
    model: "lm-studio",
    modelSize: "Varies by model",
    description: "Discover, download, and run local LLMs. No GPU required for many models.",
    tags: ["local", "gui"],
    installUrl: "https://lmstudio.ai",
    installed: false,
  },
];

const STORAGE_LOCAL = "vidscale-local-ai-installed";
const STORAGE_LOCAL_COMPUTE = "vidscale-local-ai-compute";
const STORAGE_LOCAL_AI_ENABLED = "vidscale-local-ai-enabled";

type LocalCompute = "cpu" | "gpu";

function loadLocalAiEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const v = localStorage.getItem(STORAGE_LOCAL_AI_ENABLED);
  return v !== "false";
}

function setLocalAiEnabled(enabled: boolean) {
  localStorage.setItem(STORAGE_LOCAL_AI_ENABLED, String(enabled));
}

function loadLocalInstalled(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_LOCAL);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function setLocalInstalled(ids: string[]) {
  localStorage.setItem(STORAGE_LOCAL, JSON.stringify(ids));
}

function loadLocalCompute(): LocalCompute {
  if (typeof window === "undefined") return "gpu";
  const v = localStorage.getItem(STORAGE_LOCAL_COMPUTE);
  return v === "cpu" || v === "gpu" ? v : "gpu";
}

function setLocalCompute(value: LocalCompute) {
  localStorage.setItem(STORAGE_LOCAL_COMPUTE, value);
}

export function SettingsLocalAI() {
  const [localInstalled, setLocalInstalledState] = useState<Set<string>>(() => loadLocalInstalled());
  const [localCompute, setLocalComputeState] = useState<LocalCompute>(() => loadLocalCompute());
  const [localAiEnabled, setLocalAiEnabledState] = useState<boolean>(() => loadLocalAiEnabled());

  const handleLocalAiEnabledChange = (checked: boolean) => {
    setLocalAiEnabledState(checked);
    setLocalAiEnabled(checked);
  };

  const handleLocalComputeChange = (value: LocalCompute) => {
    setLocalComputeState(value);
    setLocalCompute(value);
  };

  const handleLocalInstall = (id: string, installUrl: string) => {
    setLocalInstalledState((prev) => {
      const next = new Set(prev);
      next.add(id);
      setLocalInstalled(Array.from(next));
      return next;
    });
    window.open(installUrl, "_blank", "noopener,noreferrer");
  };

  const localOptionsWithStatus = LOCAL_AI_OPTIONS.map((opt) => ({
    ...opt,
    installed: localInstalled.has(opt.id),
  }));

  return (
    <div className="py-10 px-8 max-w-3xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Local machine AI
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Run AI models on your machine. Install a runtime below, then use Minimax, Qwen, or other models in the app.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Cpu size={20} className="text-muted-foreground" />
                <CardTitle className="text-foreground">Enable local AI</CardTitle>
              </div>
              <CardDescription className="mt-1">
                Use local runtimes (Ollama, LM Studio, etc.) for models when this is on.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Label htmlFor="local-ai-enabled" className="text-sm font-medium text-foreground cursor-pointer">
                {localAiEnabled ? "On" : "Off"}
              </Label>
              <Switch
                id="local-ai-enabled"
                checked={localAiEnabled}
                onCheckedChange={handleLocalAiEnabledChange}
                aria-label="Enable or disable local machine AI"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className={cn("space-y-6", !localAiEnabled && "opacity-60 pointer-events-none")}>
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
            <Label className="text-sm font-medium text-foreground shrink-0">Compute</Label>
            <Select value={localCompute} onValueChange={(v) => handleLocalComputeChange(v as LocalCompute)}>
              <SelectTrigger className="w-[140px] bg-background border-border">
                <SelectValue placeholder="CPU or GPU" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpu">CPU</SelectItem>
                <SelectItem value="gpu">GPU</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Local AI will use {localCompute === "gpu" ? "GPU" : "CPU"} when available.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {localOptionsWithStatus.map((opt) => (
              <div
                key={opt.id}
                className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{opt.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.model}</p>
                    <p className="text-[11px] text-muted-foreground/90 mt-1 font-medium">
                      Size: {opt.modelSize}
                    </p>
                  </div>
                  {opt.installed ? (
                    <span className="shrink-0 text-xs font-medium text-primary bg-primary/15 px-2 py-1 rounded-md">
                      Installed
                    </span>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-1.5 shrink-0"
                      onClick={() => handleLocalInstall(opt.id, opt.installUrl)}
                    >
                      <Download size={14} />
                      Install
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                  {opt.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {opt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
