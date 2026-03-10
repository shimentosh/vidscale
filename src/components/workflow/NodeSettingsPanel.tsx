import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getBrandKits } from "@/lib/brandKits";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { RotateCcw, FolderOpen, Settings2, Info } from "lucide-react";

export type NodeSettings = Record<string, unknown>;

type PanelProps = {
  settings: NodeSettings;
  onChange: (settings: NodeSettings) => void;
};

const DEFAULT_EXPORT_PATH = "VidScale Exports";

/** Topic – full copy from playground TopicPage */
export function TopicSettings({ settings, onChange }: PanelProps) {
  const topics = (settings.topics as string) ?? "";
  const niche = (settings.niche as string) ?? "";
  const count = Math.min(500, Math.max(1, Number(settings.count) ?? 10));
  const topicCount = topics.split("\n").map((t) => t.trim()).filter(Boolean).length;
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Topics Engine</Label>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          {topicCount > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">{topicCount} topic{topicCount === 1 ? "" : "s"}</span>
          )}
          {topicCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onChange({ ...settings, topics: "" })}
            >
              Clear all
            </Button>
          )}
        </div>
        <textarea
          value={topics}
          onChange={(e) => onChange({ ...settings, topics: e.target.value })}
          placeholder="Enter multiple topics (one per line)..."
          className="w-full min-h-[140px] rounded-md border border-border bg-background px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
          rows={6}
        />
      </div>
      <div className="rounded-lg border border-border bg-card/50 p-4 space-y-4">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">AI Topic Engine</Label>
        <div className="space-y-2">
          <Label htmlFor="topic-niche" className="text-sm text-foreground">Describe your niche...</Label>
          <Input
            id="topic-niche"
            placeholder="e.g. Finance for Gen Z"
            value={niche}
            onChange={(e) => onChange({ ...settings, niche: e.target.value })}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-foreground">Count</Label>
            <span className="text-sm font-medium tabular-nums">{count}</span>
          </div>
          <input
            type="range"
            min={1}
            max={500}
            value={count}
            onChange={(e) => onChange({ ...settings, count: Number(e.target.value) })}
            className="w-full h-2 rounded-full appearance-none bg-input accent-primary cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>500</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Voice Overs – full copy from playground VoiceOversPage */
const VOICES = [
  { id: "rachel", name: "Rachel", description: "Best for documentary and calm narration" },
  { id: "antoni", name: "Antoni", description: "Best for narration and explainer videos" },
  { id: "drew", name: "Drew", description: "Best for news and professional content" },
  { id: "clyde", name: "Clyde", description: "Best for character roles and storytelling" },
  { id: "paul", name: "Paul", description: "Best for news and authoritative delivery" },
  { id: "aria", name: "Aria", description: "Best for social media and expressive content" },
  { id: "domi", name: "Domi", description: "Best for documentary and strong narration" },
  { id: "dave", name: "Dave", description: "Best for characters and conversational content" },
  { id: "roger", name: "Roger", description: "Best for social media and confident delivery" },
  { id: "fin", name: "Fin", description: "Best for character roles and storytelling" },
];

const SPEED_MIN = 0.5;
const SPEED_MAX = 2;
const SPEED_DEFAULT = 1;

export function VoiceOversSettings({ settings, onChange }: PanelProps) {
  const voiceId = (settings.voiceId as string) ?? "rachel";
  const speed = Math.min(SPEED_MAX, Math.max(SPEED_MIN, Number(settings.speed) ?? SPEED_DEFAULT));
  const search = (settings.search as string) ?? "";
  const filteredVoices = search.trim()
    ? VOICES.filter(
        (v) =>
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          v.description.toLowerCase().includes(search.toLowerCase())
      )
    : VOICES;
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Choose a voice</Label>
        <Input
          type="search"
          placeholder="Search voices..."
          value={search}
          onChange={(e) => onChange({ ...settings, search: e.target.value })}
          className="h-9 pl-9 rounded-lg bg-background/50 border-border text-sm mb-3"
        />
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
          {filteredVoices.map((voice) => (
            <div
              key={voice.id}
              role="button"
              tabIndex={0}
              onClick={() => onChange({ ...settings, voiceId: voice.id })}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange({ ...settings, voiceId: voice.id }); } }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg border cursor-pointer transition-colors",
                voiceId === voice.id ? "bg-primary/15 border-primary ring-1 ring-primary/50" : "border-border bg-background/30 hover:bg-white/5"
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-foreground">{voice.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{voice.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card/50 p-4 space-y-3">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">Playback speed</Label>
        <div className="flex items-center justify-between gap-2">
          <Input
            type="number"
            min={SPEED_MIN}
            max={SPEED_MAX}
            step={0.1}
            value={speed}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!Number.isNaN(v)) onChange({ ...settings, speed: Math.min(SPEED_MAX, Math.max(SPEED_MIN, v)) });
            }}
            className="w-20 h-9 text-sm tabular-nums"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => onChange({ ...settings, speed: SPEED_DEFAULT })}
            aria-label="Reset speed to 1"
          >
            <RotateCcw size={16} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums w-8">{SPEED_MIN}</span>
          <input
            type="range"
            min={SPEED_MIN}
            max={SPEED_MAX}
            step={0.1}
            value={speed}
            onChange={(e) => onChange({ ...settings, speed: Number(e.target.value) })}
            className="flex-1 h-2.5 rounded-full appearance-none bg-input accent-primary cursor-pointer"
          />
          <span className="text-xs text-muted-foreground tabular-nums w-8">{SPEED_MAX}</span>
        </div>
      </div>
    </div>
  );
}

/** Export – full copy from playground ExportPage */
export function ExportSettings({ settings, onChange }: PanelProps) {
  const exportPath = (settings.exportPath as string) ?? DEFAULT_EXPORT_PATH;
  const filenameOption = (settings.filenameOption as string) ?? "script-title";
  const frameRate = (settings.frameRate as string) ?? "30";
  const resolution = (settings.resolution as string) ?? "1080p";

  const handleBrowseFolder = async () => {
    try {
      if ("showDirectoryPicker" in window) {
        const dir = await (window as Window & { showDirectoryPicker?: () => Promise<{ name: string }> }).showDirectoryPicker();
        onChange({ ...settings, exportPath: dir.name });
      }
    } catch {
      // User cancelled or API not supported
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <div className="px-3 py-2 border-b border-border flex items-center gap-2 bg-card/80">
          <FolderOpen size={12} className="text-muted-foreground shrink-0" />
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Export path</span>
        </div>
        <div className="p-3 space-y-2">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block">Where to save videos</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={exportPath}
              onChange={(e) => onChange({ ...settings, exportPath: e.target.value })}
              placeholder={DEFAULT_EXPORT_PATH}
              className="flex-1 min-w-0 h-8 text-xs bg-background/50 border-border"
            />
            <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 text-xs" onClick={handleBrowseFolder}>
              <FolderOpen size={14} />
              Browse
            </Button>
          </div>
          {exportPath !== DEFAULT_EXPORT_PATH && (
            <button
              type="button"
              onClick={() => onChange({ ...settings, exportPath: DEFAULT_EXPORT_PATH })}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset to default
            </button>
          )}
          <p className="text-[11px] text-muted-foreground">Default: <span className="font-medium text-foreground/80">{DEFAULT_EXPORT_PATH}</span></p>
        </div>
      </div>
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-card/80">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Filename</span>
        </div>
        <div className="p-3 space-y-0.5">
          {([{ value: "project-name" as const, label: "Use Project Name" }, { value: "script-title" as const, label: "Use Script Title", default: true }, { value: "auto-number" as const, label: "Auto Numbering" }]).map(({ value, label, default: isDefault }) => (
            <label key={value} className={cn("flex items-center gap-2 rounded px-2.5 py-2 cursor-pointer text-[12px] transition-colors", filenameOption === value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5")}>
              <input type="radio" name="filename" value={value} checked={filenameOption === value} onChange={() => onChange({ ...settings, filenameOption: value })} className="h-3 w-3 shrink-0 accent-primary" />
              <span className="flex-1">{label}</span>
              {isDefault && <span className="text-[10px] text-muted-foreground">(Default)</span>}
            </label>
          ))}
        </div>
      </div>
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-card/80">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Frame rate</span>
        </div>
        <div className="p-3 space-y-0.5">
          {([{ value: "24" as const, label: "24 fps" }, { value: "30" as const, label: "30 fps", default: true }, { value: "60" as const, label: "60 fps" }]).map(({ value, label, default: isDefault }) => (
            <label key={value} className={cn("flex items-center gap-2 rounded px-2.5 py-2 cursor-pointer text-[12px] transition-colors", frameRate === value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5")}>
              <input type="radio" name="frame-rate" value={value} checked={frameRate === value} onChange={() => onChange({ ...settings, frameRate: value })} className="h-3 w-3 shrink-0 accent-primary" />
              <span className="flex-1">{label}</span>
              {isDefault && <span className="text-[10px] text-muted-foreground">(Default)</span>}
            </label>
          ))}
        </div>
      </div>
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-card/80">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Resolution</span>
        </div>
        <div className="p-3 space-y-0.5">
          {([{ value: "1080p" as const, label: "1080p (Full HD)" }, { value: "720p" as const, label: "720p (HD)" }, { value: "4k" as const, label: "4K" }]).map(({ value, label }) => (
            <label key={value} className={cn("flex items-center gap-2 rounded px-2.5 py-2 cursor-pointer text-[12px] transition-colors", resolution === value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5")}>
              <input type="radio" name="resolution" value={value} checked={resolution === value} onChange={() => onChange({ ...settings, resolution: value })} className="h-3 w-3 shrink-0 accent-primary" />
              <span className="flex-1">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Brand Kit – full copy from playground BrandKitPage */
export function BrandKitSettings({ settings, onChange }: PanelProps) {
  const brandKits = getBrandKits();
  const enabled = (settings.brandKitEnabled as boolean) ?? false;
  const selectedKitId = (settings.selectedKitId as string) ?? "";
  const hasBrandKits = brandKits.length > 0;
  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between gap-2 bg-card/80">
        <div className="flex items-center gap-2">
          <Settings2 size={12} className="text-muted-foreground shrink-0" />
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Brand kit</span>
          <span className="text-[10px] text-muted-foreground/80">(optional)</span>
        </div>
        <Switch checked={enabled} onCheckedChange={(v) => onChange({ ...settings, brandKitEnabled: v })} className="scale-75 origin-right" />
      </div>
      <div className="p-3 space-y-3">
        {enabled && (
          <>
            <div className="flex items-start gap-2 rounded px-2 py-1.5 bg-primary/5 border border-primary/20">
              <Info size={14} className="text-primary shrink-0 mt-0.5" aria-hidden />
              <p className="text-[11px] text-muted-foreground leading-snug">
                A brand kit stores your visual identity (colors, fonts, watermark, CTA) and is applied on export. Create or manage kits via the links below.
              </p>
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
                        onChange={() => onChange({ ...settings, selectedKitId: kit.id })}
                        className="h-3 w-3 shrink-0 accent-primary"
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
            <p className="text-[10px] text-muted-foreground">
              <Link to="/brand-kits" className="text-primary hover:underline">Manage brand kits</Link>
            </p>
          </>
        )}
        {!enabled && (
          <p className="text-[11px] text-muted-foreground">Turn on to apply a brand kit when exporting.</p>
        )}
      </div>
    </div>
  );
}

/** Script Writing – full copy from playground ScriptWritingPage */
const HOOK_STYLE_OPTIONS = [
  "question", "shock", "curiosity", "story", "statistic", "bold", "contrarian", "myth-busting", "list", "promise",
  "fear", "humor", "quote", "scenario", "secret", "controversy", "transformation", "direct-address", "mystery", "custom",
] as const;
const HOOK_STYLE_LABELS: Record<string, string> = {
  question: "Question Hook", shock: "Shock Hook", curiosity: "Curiosity Hook", story: "Story Hook", statistic: "Statistic Hook",
  bold: "Bold Statement Hook", contrarian: "Contrarian Hook", "myth-busting": "Myth Busting Hook", list: "List Hook", promise: "Promise Hook",
  fear: "Fear Hook", humor: "Humor Hook", quote: "Quote Hook", scenario: "Scenario Hook", secret: "Secret Hook",
  controversy: "Controversy Hook", transformation: "Transformation Hook", "direct-address": "Direct Address Hook", mystery: "Mystery Hook", custom: "Custom",
};
const HOOK_WORD_PRESETS = [
  { value: "6-12", label: "6–12 words — Short video" },
  { value: "12-20", label: "12–20 words — Medium" },
  { value: "15-25", label: "15–25 words — Long video" },
];
const NARRATIVE_OPTIONS = [
  { value: "first", label: "First Person (I/we)" },
  { value: "second", label: "Second Person (you)" },
  { value: "third", label: "Third Person (he/she/they)" },
];
const WORD_COUNT_MIN = 50;
const WORD_COUNT_MAX = 25000;
const WORDS_PER_MINUTE = 150;

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m} min ${s} sec` : `${m} min`;
}

export function ScriptWritingSettings({ settings, onChange }: PanelProps) {
  const niche = (settings.niche as string) ?? "";
  const customPrompt = (settings.customPrompt as string) ?? "";
  const targetWordCount = Math.min(WORD_COUNT_MAX, Math.max(WORD_COUNT_MIN, Number(settings.targetWordCount) ?? 300));
  const narrativePerson = (settings.narrativePerson as string) ?? "third";
  const sectionHook = (settings.sectionHook as boolean) ?? true;
  const sectionIntro = (settings.sectionIntro as boolean) ?? true;
  const sectionMainContent = (settings.sectionMainContent as boolean) ?? true;
  const sectionEnding = (settings.sectionEnding as boolean) ?? true;
  const hookStyle = (settings.hookStyle as string) ?? "question";
  const hookStyleCustom = (settings.hookStyleCustom as string) ?? "";
  const hookWordCountPreset = (settings.hookWordCountPreset as string) ?? "6-12";
  const durationEstimateSeconds = Math.round((targetWordCount / WORDS_PER_MINUTE) * 60);

  const update = (key: string, value: unknown) => onChange({ ...settings, [key]: value });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Prompt template / Niche</Label>
        <Input
          placeholder="e.g. Finance for Gen Z, True Crime..."
          value={niche}
          onChange={(e) => update("niche", e.target.value)}
          className="h-9 text-sm"
        />
        <div className="mt-2">
          <Label className="text-xs text-muted-foreground block mb-1">Custom instructions</Label>
          <textarea
            value={customPrompt}
            onChange={(e) => update("customPrompt", e.target.value)}
            placeholder="e.g. Focus on beginner-friendly explanations..."
            className="w-full min-h-[60px] rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card/80 p-4 space-y-3">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">Script length</Label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={WORD_COUNT_MIN}
            max={WORD_COUNT_MAX}
            value={targetWordCount}
            onChange={(e) => update("targetWordCount", Number(e.target.value))}
            className="flex-1 h-2 rounded-full appearance-none bg-input accent-primary"
          />
          <Input
            type="number"
            min={WORD_COUNT_MIN}
            max={WORD_COUNT_MAX}
            value={targetWordCount}
            onChange={(e) => update("targetWordCount", Math.min(WORD_COUNT_MAX, Math.max(WORD_COUNT_MIN, Number(e.target.value) || WORD_COUNT_MIN)))}
            className="w-20 h-9 text-sm tabular-nums"
          />
        </div>
        <p className="text-xs text-muted-foreground">Est. duration: <span className="font-medium text-foreground">{formatDuration(durationEstimateSeconds)}</span></p>
      </div>
      <div className="rounded-lg border border-border bg-card/80 p-4 space-y-3">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">Structure</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background/30 px-3 py-2">
            <span className="text-xs">Hook</span>
            <Switch checked={sectionHook} onCheckedChange={(v) => update("sectionHook", v)} />
          </div>
          <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background/30 px-3 py-2">
            <span className="text-xs">Intro</span>
            <Switch checked={sectionIntro} onCheckedChange={(v) => update("sectionIntro", v)} />
          </div>
          <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background/30 px-3 py-2">
            <span className="text-xs">Main</span>
            <Switch checked={sectionMainContent} onCheckedChange={(v) => update("sectionMainContent", v)} />
          </div>
          <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background/30 px-3 py-2">
            <span className="text-xs">Ending</span>
            <Switch checked={sectionEnding} onCheckedChange={(v) => update("sectionEnding", v)} />
          </div>
        </div>
        {sectionHook && (
          <div className="pt-3 border-t border-border space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground block mb-1">Hook style</Label>
              <Select value={hookStyle} onValueChange={(v) => update("hookStyle", v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HOOK_STYLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{HOOK_STYLE_LABELS[opt] ?? opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hookStyle === "custom" && (
                <Input value={hookStyleCustom} onChange={(e) => update("hookStyleCustom", e.target.value)} placeholder="Describe your hook..." className="mt-2 h-9 text-sm" />
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground block mb-1">Hook length</Label>
              <Select value={hookWordCountPreset} onValueChange={(v) => update("hookWordCountPreset", v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HOOK_WORD_PRESETS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Voice (narrative perspective)</Label>
        <Select value={narrativePerson} onValueChange={(v) => update("narrativePerson", v)}>
          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {NARRATIVE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/** Media Library (Footage) – same settings as FootagePage */
const FOOTAGE_FILL_MODES = [
  { value: "one-clip" as const, label: "One Clip", hint: "clip 10s → video 10s" },
  { value: "multi-clip" as const, label: "Multi Clip", hint: "clip1 + clip2 + clip3" },
  { value: "loop" as const, label: "Loop", hint: "clip1 + clip1 + clip1" },
];
const FOOTAGE_MERGE_STRATEGIES = [
  { value: "serially" as const, label: "In order (one after another)" },
  { value: "ai-auto" as const, label: "AI Auto Clip Match" },
  { value: "color-style" as const, label: "AI Color style" },
  { value: "keyword-based" as const, label: "Keyword" },
];
const FOOTAGE_TRANSITION_MODES = [
  { value: "single" as const, label: "Single" },
  { value: "random" as const, label: "Random" },
  { value: "serial" as const, label: "Serial" },
  { value: "multiple" as const, label: "Multiple" },
];
const FOOTAGE_TRANSITION_TYPES = [
  "Cut", "Fade", "Cross Fade", "Fade to Black", "Fade to White",
  "Slide Left", "Slide Right", "Slide Up", "Slide Down", "Push",
  "Zoom In", "Zoom Out", "Zoom Blur", "Blur", "Motion Blur", "Gaussian Blur",
  "Glitch", "Digital Distortion", "RGB Split", "Spin", "Rotate", "Ripple", "Wave",
];

export function MediaLibrarySettings({ settings, onChange }: PanelProps) {
  const clipLength = Math.min(60, Math.max(0.5, Number(settings.clipLength) ?? 3));
  const mergeStrategy = (settings.mergeStrategy as "ai-auto" | "serially" | "color-style" | "keyword-based") ?? "ai-auto";
  const serialOrder = (settings.serialOrder as "from-start" | "from-end" | "random") ?? "from-start";
  const fillMode = (settings.fillMode as "one-clip" | "multi-clip" | "loop") ?? "multi-clip";
  const loopMode = (settings.loopMode as "fixed-times" | "play-then-reverse") ?? "fixed-times";
  const loopTimes = Math.min(100, Math.max(1, Number(settings.loopTimes) ?? 2));
  const transitionOn = (settings.transitionOn as boolean) ?? false;
  const transitionMode = (settings.transitionMode as "single" | "random" | "serial" | "multiple") ?? "single";
  const transitionType = (settings.transitionType as string) ?? FOOTAGE_TRANSITION_TYPES[0];
  const transitionDuration = Math.min(5, Math.max(0.1, Number(settings.transitionDuration) ?? 0.5));
  const clipSpeed = Math.min(2, Math.max(0.5, Number(settings.clipSpeed) ?? 1));
  const update = (key: string, value: unknown) => onChange({ ...settings, [key]: value });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Clip length (sec)</Label>
        <div className="flex items-center gap-2">
          <Input type="number" min={0.5} max={60} step={0.5} value={clipLength} onChange={(e) => update("clipLength", Math.min(60, Math.max(0.5, Number(e.target.value) || 0.5)))} className="w-16 h-8 text-xs" />
          <span className="text-[11px] text-muted-foreground">per clip</span>
        </div>
      </div>
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Fill Mode</Label>
        <div className="space-y-1">
          {FOOTAGE_FILL_MODES.map(({ value, label, hint }) => (
            <label key={value} className={cn("flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-[13px]", fillMode === value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5")}>
              <input type="radio" name="fill-mode" value={value} checked={fillMode === value} onChange={() => update("fillMode", value)} className="h-3.5 w-3.5 shrink-0 accent-primary" />
              <span className="flex-1 min-w-0">{label}</span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{hint}</span>
            </label>
          ))}
        </div>
        {fillMode === "loop" && (
          <div className="mt-2 pt-2 border-t border-border/60 space-y-2">
            <Label className="text-[11px] text-muted-foreground block mb-1.5">Loop</Label>
            {(["fixed-times", "play-then-reverse"] as const).map((mode) => (
              <label key={mode} className={cn("flex items-center gap-2 rounded px-1.5 py-1 cursor-pointer text-[12px]", loopMode === mode ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5")}>
                <input type="radio" name="loop-mode" value={mode} checked={loopMode === mode} onChange={() => update("loopMode", mode)} className="h-3 w-3 shrink-0 accent-primary" />
                {mode === "fixed-times" ? "Infinite" : "Play + reverse"}
              </label>
            ))}
            <div className="flex items-center gap-2">
              <Input type="number" min={1} max={100} value={loopTimes} onChange={(e) => update("loopTimes", Math.min(100, Math.max(1, Number(e.target.value) || 1)))} className="w-14 h-8 text-xs" />
              <span className="text-[11px] text-muted-foreground">times</span>
            </div>
          </div>
        )}
      </div>
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Merge strategy</Label>
        <div className="space-y-1">
          {FOOTAGE_MERGE_STRATEGIES.map(({ value, label }) => (
            <label key={value} className={cn("flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-[13px]", mergeStrategy === value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5")}>
              <input type="radio" name="merge-strategy" value={value} checked={mergeStrategy === value} onChange={() => update("mergeStrategy", value)} className="h-3.5 w-3.5 shrink-0 accent-primary" />
              {label}
            </label>
          ))}
        </div>
        {mergeStrategy === "serially" && (
          <div className="ml-4 mt-1.5 flex rounded-md border border-border/80 overflow-hidden bg-muted/30">
            {(["from-start", "from-end", "random"] as const).map((v) => (
              <button key={v} type="button" onClick={() => update("serialOrder", v)} className={cn("flex-1 min-w-0 py-1.5 px-2 text-[11px] font-medium border-r border-border/60 last:border-r-0", serialOrder === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/20")}>
                {v === "from-start" ? "From start" : v === "from-end" ? "From end" : "Random"}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="pt-2 border-t border-border/60">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Clip speed</Label>
          <div className="flex items-center gap-1">
            <Input type="number" min={0.5} max={2} step={0.1} value={clipSpeed} onChange={(e) => update("clipSpeed", Math.min(2, Math.max(0.5, Number(e.target.value) || 1)))} className="w-12 h-7 text-xs" />
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => update("clipSpeed", 1)} aria-label="Reset"><RotateCcw size={12} /></Button>
          </div>
        </div>
        <input type="range" min={0.5} max={2} step={0.1} value={clipSpeed} onChange={(e) => update("clipSpeed", Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none bg-input accent-primary" />
      </div>
      <div className="pt-2 border-t border-border/60 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Video Transition</Label>
          <Switch checked={transitionOn} onCheckedChange={(v) => update("transitionOn", v)} className="scale-75 origin-right" />
        </div>
        {transitionOn && (
          <>
            <div>
              <Label className="text-[11px] text-muted-foreground block mb-1.5">Mode</Label>
              <div className="space-y-1">
                {FOOTAGE_TRANSITION_MODES.map(({ value, label }) => (
                  <label key={value} className={cn("flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-[12px]", transitionMode === value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5")}>
                    <input type="radio" name="transition-mode" value={value} checked={transitionMode === value} onChange={() => update("transitionMode", value)} className="h-3 w-3 shrink-0 accent-primary" />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground block mb-1.5">Type</Label>
              <Select value={transitionType} onValueChange={(v) => update("transitionType", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FOOTAGE_TRANSITION_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-[11px] text-muted-foreground shrink-0">Duration (sec)</Label>
              <Input type="number" min={0.1} max={5} step={0.1} value={transitionDuration} onChange={(e) => update("transitionDuration", Math.min(5, Math.max(0.1, Number(e.target.value) || 0.1)))} className="w-16 h-8 text-xs" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Overlays – same settings as OverlaysPage */
export function OverlaysSettings({ settings, onChange }: PanelProps) {
  const overlaySource = (settings.overlaySource as "global-library" | "my-library") ?? "global-library";
  const fillMode = (settings.fillMode as "single-clip" | "multiple-clips") ?? "multiple-clips";
  const multiClipOrder = (settings.multiClipOrder as "from-start" | "from-end" | "random") ?? "from-start";
  const update = (key: string, value: unknown) => onChange({ ...settings, [key]: value });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Overlay source</Label>
        <div className="flex rounded-md border border-border/80 overflow-hidden bg-muted/30">
          {(["global-library", "my-library"] as const).map((v) => (
            <button key={v} type="button" onClick={() => update("overlaySource", v)} className={cn("flex-1 min-w-0 py-2 px-2 text-[12px] font-medium", overlaySource === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/20")}>
              {v === "global-library" ? "Global Library" : "My Library"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Fill Mode</Label>
        <div className="space-y-1">
          {[
            { value: "single-clip" as const, label: "Single Clip", hint: "One overlay for the segment" },
            { value: "multiple-clips" as const, label: "Multiple Clips", hint: "Overlay 1 + overlay 2 + …" },
          ].map(({ value, label, hint }) => (
            <label key={value} className={cn("flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-[13px]", fillMode === value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5")}>
              <input type="radio" name="overlay-fill-mode" value={value} checked={fillMode === value} onChange={() => update("fillMode", value)} className="h-3.5 w-3.5 shrink-0 accent-primary" />
              <span className="flex-1 min-w-0">{label}</span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{hint}</span>
            </label>
          ))}
        </div>
        {fillMode === "multiple-clips" && (
          <div className="mt-2 pt-2 border-t border-border/60 space-y-1">
            <Label className="text-[11px] text-muted-foreground block mb-1.5">Order</Label>
            {(["from-start", "from-end", "random"] as const).map((v) => (
              <label key={v} className={cn("flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-[12px]", multiClipOrder === v ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5")}>
                <input type="radio" name="multi-clip-order" value={v} checked={multiClipOrder === v} onChange={() => update("multiClipOrder", v)} className="h-3 w-3 shrink-0 accent-primary" />
                {v === "from-start" ? "From Start" : v === "from-end" ? "From End" : "Random"}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Audio – same settings as AudioPage */
const AUDIO_VOLUME_MIN = 0.5;
const AUDIO_VOLUME_MAX = 2;

export function AudioSettings({ settings, onChange }: PanelProps) {
  const audioSource = (settings.audioSource as "global-library" | "my-library") ?? "global-library";
  const fillMode = (settings.fillMode as "single-audio" | "multiple-audio") ?? "multiple-audio";
  const multiAudioOrder = (settings.multiAudioOrder as "from-start" | "from-end" | "random") ?? "from-start";
  const volume = Math.min(AUDIO_VOLUME_MAX, Math.max(AUDIO_VOLUME_MIN, Number(settings.volume) ?? 1));
  const fadeIn = Math.min(30, Math.max(0, Number(settings.fadeIn) ?? 1));
  const fadeOut = Math.min(30, Math.max(0, Number(settings.fadeOut) ?? 2));
  const update = (key: string, value: unknown) => onChange({ ...settings, [key]: value });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Audio source</Label>
        <div className="flex rounded-md border border-border/80 overflow-hidden bg-muted/30">
          {(["global-library", "my-library"] as const).map((v) => (
            <button key={v} type="button" onClick={() => update("audioSource", v)} className={cn("flex-1 min-w-0 py-2 px-2 text-[12px] font-medium", audioSource === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/20")}>
              {v === "global-library" ? "Global Library" : "My Library"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Volume</Label>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-6">{AUDIO_VOLUME_MIN}</span>
          <input type="range" min={AUDIO_VOLUME_MIN} max={AUDIO_VOLUME_MAX} step={0.1} value={volume} onChange={(e) => update("volume", Number(e.target.value))} className="flex-1 h-2.5 rounded-full appearance-none bg-input accent-primary" />
          <span className="text-[10px] text-muted-foreground w-6">{AUDIO_VOLUME_MAX}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">Sound level: {volume.toFixed(1)}</p>
      </div>
      <div className="pt-2 border-t border-border/60">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Fade Control</Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px]">Fade In</span>
            <div className="flex items-center gap-2">
              <Input type="number" min={0} max={30} step={0.5} value={fadeIn} onChange={(e) => update("fadeIn", Math.min(30, Math.max(0, Number(e.target.value) || 0)))} className="w-16 h-8 text-xs" />
              <span className="text-[11px] text-muted-foreground">s</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px]">Fade Out</span>
            <div className="flex items-center gap-2">
              <Input type="number" min={0} max={30} step={0.5} value={fadeOut} onChange={(e) => update("fadeOut", Math.min(30, Math.max(0, Number(e.target.value) || 0)))} className="w-16 h-8 text-xs" />
              <span className="text-[11px] text-muted-foreground">s</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Fill Mode</Label>
        <div className="space-y-1">
          {[
            { value: "single-audio" as const, label: "Single Audio", hint: "One audio for the segment" },
            { value: "multiple-audio" as const, label: "Multiple Audio", hint: "Audio 1 + audio 2 + …" },
          ].map(({ value, label, hint }) => (
            <label key={value} className={cn("flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-[13px]", fillMode === value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5")}>
              <input type="radio" name="audio-fill-mode" value={value} checked={fillMode === value} onChange={() => update("fillMode", value)} className="h-3.5 w-3.5 shrink-0 accent-primary" />
              <span className="flex-1 min-w-0">{label}</span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{hint}</span>
            </label>
          ))}
        </div>
        {fillMode === "multiple-audio" && (
          <div className="mt-2 pt-2 border-t border-border/60 space-y-1">
            <Label className="text-[11px] text-muted-foreground block mb-1.5">Order</Label>
            {(["from-start", "from-end", "random"] as const).map((v) => (
              <label key={v} className={cn("flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-[12px]", multiAudioOrder === v ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5")}>
                <input type="radio" name="multi-audio-order" value={v} checked={multiAudioOrder === v} onChange={() => update("multiAudioOrder", v)} className="h-3 w-3 shrink-0 accent-primary" />
                {v === "from-start" ? "From Start" : v === "from-end" ? "From End" : "Random"}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Subtitle – main settings from SubtitlePage */
const SUBTITLE_POSITIONS = ["top-left", "top-center", "top-right", "center-left", "center", "center-right", "bottom-left", "bottom-center", "bottom-right"] as const;
const SUBTITLE_ANIMATIONS = ["none", "fade", "pop", "slide", "random"] as const;

export function SubtitleSettings({ settings, onChange }: PanelProps) {
  const subtitleMode = (settings.subtitleMode as "off" | "subtitle" | "caption") ?? "subtitle";
  const position = (settings.position as string) ?? "bottom-center";
  const fontSize = Math.min(200, Math.max(12, Number(settings.fontSize) ?? 44));
  const fontFamily = (settings.fontFamily as string) ?? "Montserrat";
  const fontWeight = (settings.fontWeight as string) ?? "Bold";
  const animationType = (settings.animationType as string) ?? "none";
  const aspectRatio = (settings.aspectRatio as "16:9" | "9:16") ?? "16:9";
  const subtitleColor = (settings.subtitleColor as string) ?? "#ffffff";
  const strokeEnabled = (settings.strokeEnabled as boolean) ?? false;
  const strokeWidth = Math.min(10, Math.max(0, Number(settings.strokeWidth) ?? 2));
  const strokeColor = (settings.strokeColor as string) ?? "#000000";
  const update = (key: string, value: unknown) => onChange({ ...settings, [key]: value });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Display type</Label>
        <div className="flex rounded-lg border border-border bg-background/50 p-0.5">
          {(["off", "subtitle", "caption"] as const).map((v) => (
            <label key={v} className={cn("flex-1 flex flex-col items-center justify-center rounded-md px-2 py-2 cursor-pointer text-center text-[12px] font-medium", subtitleMode === v ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-white/5")}>
              <input type="radio" name="subtitle-mode" value={v} checked={subtitleMode === v} onChange={() => update("subtitleMode", v)} className="sr-only" />
              {v === "off" ? "Off" : v === "subtitle" ? "Subtitle" : "Caption"}
            </label>
          ))}
        </div>
      </div>
      {subtitleMode !== "off" && (
        <>
          <div>
            <Label className="text-[11px] text-muted-foreground block mb-1.5">Position</Label>
            <Select value={position} onValueChange={(v) => update("position", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUBTITLE_POSITIONS.map((p) => (
                  <SelectItem key={p} value={p}>{p.replace("-", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[11px] text-muted-foreground block mb-1.5">Font size</Label>
              <Input type="number" min={12} max={200} value={fontSize} onChange={(e) => update("fontSize", Math.min(200, Math.max(12, Number(e.target.value) || 12)))} className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground block mb-1.5">Font weight</Label>
              <Select value={fontWeight} onValueChange={(v) => update("fontWeight", v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Light", "Regular", "Medium", "SemiBold", "Bold"].map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground block mb-1.5">Font family</Label>
            <Input value={fontFamily} onChange={(e) => update("fontFamily", e.target.value)} className="h-9 text-sm" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground block mb-1.5">Animation</Label>
            <Select value={animationType} onValueChange={(v) => update("animationType", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUBTITLE_ANIMATIONS.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground block mb-1.5">Aspect ratio</Label>
            <div className="flex rounded-md border border-border/80 overflow-hidden bg-muted/30">
              {(["16:9", "9:16"] as const).map((v) => (
                <button key={v} type="button" onClick={() => update("aspectRatio", v)} className={cn("flex-1 min-w-0 py-2 px-2 text-[12px] font-medium", aspectRatio === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/20")}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-[11px] text-muted-foreground shrink-0">Text color</Label>
            <input type="color" value={subtitleColor} onChange={(e) => update("subtitleColor", e.target.value)} className="h-8 w-10 rounded border border-border cursor-pointer" />
            <Input value={subtitleColor} onChange={(e) => update("subtitleColor", e.target.value)} className="h-9 text-sm flex-1 font-mono text-xs" />
          </div>
          <div className="pt-2 border-t border-border/60 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-[11px] text-muted-foreground">Stroke</Label>
              <Switch checked={strokeEnabled} onCheckedChange={(v) => update("strokeEnabled", v)} />
            </div>
            {strokeEnabled && (
              <div className="flex items-center gap-2">
                <Input type="number" min={0} max={10} value={strokeWidth} onChange={(e) => update("strokeWidth", Math.min(10, Math.max(0, Number(e.target.value) || 0)))} className="w-16 h-8 text-xs" />
                <input type="color" value={strokeColor} onChange={(e) => update("strokeColor", e.target.value)} className="h-8 w-10 rounded border border-border cursor-pointer" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Placeholder for steps that have complex UI – link to playground */
function PlaceholderSettings({ modulePath, label }: { modulePath: string; label: string }) {
  return (
    <div className="space-y-2 text-sm text-muted-foreground">
      <p>Configure this step in the Playground for full options.</p>
      <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
        <Link to={`/playground/${modulePath}`}>Open {label} in Playground</Link>
      </Button>
    </div>
  );
}

/** Picks and renders the right settings form for a module path */
export function NodeSettingsPanel({
  moduleType,
  label,
  settings,
  onChange,
}: {
  moduleType: string;
  label: string;
  settings: NodeSettings;
  onChange: (settings: NodeSettings) => void;
}) {
  const props = { settings, onChange };

  switch (moduleType) {
    case "topic":
      return <TopicSettings {...props} />;
    case "voice-overs":
      return <VoiceOversSettings {...props} />;
    case "export":
      return <ExportSettings {...props} />;
    case "brand-kit":
      return <BrandKitSettings {...props} />;
    case "script-writing":
      return <ScriptWritingSettings settings={settings} onChange={onChange} />;
    case "media-library":
      return <MediaLibrarySettings settings={settings} onChange={onChange} />;
    case "overlays":
      return <OverlaysSettings settings={settings} onChange={onChange} />;
    case "subtitle":
      return <SubtitleSettings settings={settings} onChange={onChange} />;
    case "audio":
      return <AudioSettings settings={settings} onChange={onChange} />;
    default:
      return (
        <div className="text-sm text-muted-foreground">
          No custom settings for this module.
        </div>
      );
  }
}
