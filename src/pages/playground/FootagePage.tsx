import { useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { FolderOpen, Upload, Search, X, ChevronRight, RotateCcw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { AVAILABLE_FOLDERS } from "./constants";

type MergeStrategy = "random" | "ai-auto" | "serially" | "color-style" | "keyword-based";
type FillMode = "one-clip" | "multi-clip" | "loop";
type SelectedItem = { id: string; name: string; type: "folder" | "file" | "import"; itemCount?: number };

/** Default item counts per folder for display (placeholder until real counts exist) */
const DEFAULT_FOLDER_COUNTS: Record<string, number> = {
  "My Videos": 12,
  "Stock Clips": 8,
  "dev-environment": 5,
  "FB Posting": 3,
  "iphone 11 pro 2": 7,
  "Iphone 13 Pro to 15 Pro Max": 4,
  "Picture": 6,
};

const initialLibraryItems: SelectedItem[] = AVAILABLE_FOLDERS.map((name) => ({
  id: `folder-${name}`,
  name,
  type: "folder",
  itemCount: DEFAULT_FOLDER_COUNTS[name] ?? 0,
}));

const COLOR_STYLE_PRESETS: { name: string; hex: string }[] = [
  { name: "Warm", hex: "#E07C4C" },
  { name: "Cool", hex: "#4A90B8" },
  { name: "Neutral", hex: "#8B8B8B" },
  { name: "Earth tones", hex: "#8B6914" },
  { name: "Vibrant", hex: "#D8438F" },
  { name: "Pastel", hex: "#B8A9C9" },
  { name: "Monochrome", hex: "#2D2D2D" },
  { name: "Ocean", hex: "#2E86AB" },
  { name: "Forest", hex: "#2D5A27" },
  { name: "Sunset", hex: "#E85D04" },
];

const MERGE_RULES: { title: string; description: string }[] = [
  { title: "Hook Priority Merge", description: "First clips are optimized for viewer attention." },
  { title: "Each clip speed type", description: "Set playback speed for each clip. One speed value applied to clips." },
  { title: "Clip Freshness Merge", description: "Prefers clips that were used less frequently in previous videos." },
  { title: "No Repeat Mode", description: "Avoids repeating the same clip within the same video." },
  { title: "Loop settings", description: "Control how footage clips repeat to fill your video length or segment duration." },
];

type TransitionMode = "single" | "random" | "serial";
const TRANSITION_MODES: { value: TransitionMode; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "random", label: "Random" },
  { value: "serial", label: "Serial" },
];

const TRANSITION_TYPES = [
  "Cut", "Fade", "Cross Fade", "Fade to Black", "Fade to White",
  "Slide Left", "Slide Right", "Slide Up", "Slide Down", "Push",
  "Zoom In", "Zoom Out", "Zoom Blur", "Blur", "Motion Blur", "Gaussian Blur",
  "Glitch", "Digital Distortion", "RGB Split", "Spin", "Rotate", "Ripple", "Wave",
] as const;

export function FootagePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [libraryItems, setLibraryItems] = useState<SelectedItem[]>(initialLibraryItems);
  const [librarySearch, setLibrarySearch] = useState("");
  const [clipLength, setClipLength] = useState(3);
  const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>("ai-auto");
  const [mergeRuleEnabled, setMergeRuleEnabled] = useState<Record<string, boolean>>(() =>
    MERGE_RULES.reduce<Record<string, boolean>>((acc, r) => ({ ...acc, [r.title]: false }), {})
  );
  const [keywordMergeKeywords, setKeywordMergeKeywords] = useState<string[]>([]);
  const [keywordMergeInput, setKeywordMergeInput] = useState("");
  const [colorStyleColors, setColorStyleColors] = useState<string[]>([]);
  const [colorStyleInput, setColorStyleInput] = useState("");
  const [clipSpeed, setClipSpeed] = useState(1);
  const [fillMode, setFillMode] = useState<FillMode>("multi-clip");
  const [loopMode, setLoopMode] = useState<"fixed-times" | "play-then-reverse">("fixed-times");
  const [loopTimes, setLoopTimes] = useState(2);
  const [serialOrder, setSerialOrder] = useState<"from-start" | "from-end">("from-start");

  const [transitionOn, setTransitionOn] = useState(false);
  const [transitionMode, setTransitionMode] = useState<TransitionMode>("single");
  const [transitionType, setTransitionType] = useState<string>(TRANSITION_TYPES[0]);
  const [transitionDuration, setTransitionDuration] = useState(0.5);

  const setRuleEnabled = (title: string, enabled: boolean) => {
    setMergeRuleEnabled((prev) => ({ ...prev, [title]: enabled }));
  };

  const addKeyword = () => {
    const trimmed = keywordMergeInput.trim();
    if (trimmed && !keywordMergeKeywords.includes(trimmed)) {
      setKeywordMergeKeywords((prev) => [...prev, trimmed]);
      setKeywordMergeInput("");
    }
  };

  const removeKeyword = (word: string) => {
    setKeywordMergeKeywords((prev) => prev.filter((w) => w !== word));
  };

  const addColorStyleColor = () => {
    const trimmed = colorStyleInput.trim();
    if (trimmed && !colorStyleColors.includes(trimmed)) {
      setColorStyleColors((prev) => [...prev, trimmed]);
      setColorStyleInput("");
    }
  };

  const removeColorStyleColor = (name: string) => {
    setColorStyleColors((prev) => prev.filter((c) => c !== name));
  };

  const toggleColorStylePreset = (name: string) => {
    setColorStyleColors((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const filteredLibrary = useMemo(() => {
    if (!librarySearch.trim()) return libraryItems;
    const q = librarySearch.trim().toLowerCase();
    return libraryItems.filter((item) => item.name.toLowerCase().includes(q));
  }, [libraryItems, librarySearch]);

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      setLibraryItems((prev) => [
        ...prev,
        ...Array.from(files).map((f, i) => ({
          id: `file-${Date.now()}-${i}`,
          name: f.name,
          type: "file" as const,
          itemCount: 1,
        })),
      ]);
    }
    e.target.value = "";
  };

  const removeItem = (id: string) => setLibraryItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0D1117]">
      {/* Toolbar – clean bar with breadcrumb */}
      <div className="shrink-0 h-12 px-5 flex items-center gap-3 border-b border-border/80 bg-[#161B22]">
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Step 4</span>
          <ChevronRight size={14} className="text-muted-foreground/50" aria-hidden />
          <h1 className="text-sm font-semibold text-foreground truncate">Media</h1>
        </div>
        <div className="flex-1 min-w-0 max-w-[200px] mx-4">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search library…"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              className="h-8 w-full min-w-0 pl-8 pr-2 text-xs bg-background/50 border-border/80 rounded-lg"
              aria-label="Search media library"
            />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Upload video files"
        />
        <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs px-3 shrink-0" onClick={handleUploadClick}>
          <Upload size={14} />
          Add files
        </Button>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left: Library panel – file-manager style */}
        <aside className="w-[220px] min-w-[200px] shrink-0 flex flex-col border-r border-border/80 bg-[#161B22]">
          <div className="shrink-0 px-3 py-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <FolderOpen size={14} className="text-muted-foreground shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Library</span>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto py-1">
            {filteredLibrary.length === 0 ? (
              <p className="text-[11px] text-muted-foreground px-3 py-4 text-center">
                {libraryItems.length === 0 ? "No folders. Add files." : "No matches."}
              </p>
            ) : (
              <ul className="space-y-0.5 px-1">
                {filteredLibrary.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 rounded px-2 py-1.5 text-[13px] text-foreground hover:bg-white/5 group"
                  >
                    <span className="min-w-0 flex-1 truncate" title={item.name}>
                      {item.name}
                    </span>
                    <span className="w-9 shrink-0 text-right text-muted-foreground tabular-nums">({item.itemCount ?? 0})</span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove ${item.name}`}
                    >
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

            {/* Center: empty / info (desktop app main area) */}
        <main className="flex-1 min-w-0 flex flex-col items-center justify-center p-8 bg-[#0D1117]">
          <p className="text-[13px] text-muted-foreground text-center max-w-sm">
            Select folders in the library. Configure fill mode and merge rules in the Properties panel.
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-2">{libraryItems.length} item{libraryItems.length !== 1 ? "s" : ""} in library</p>
        </main>

        {/* Right: Properties panel – desktop inspector style */}
        <aside className="w-[320px] shrink-0 flex flex-col border-l border-border/80 bg-[#161B22] overflow-hidden">
          <div className="shrink-0 px-3 py-2 border-b border-border/60 flex items-center gap-2">
            <Settings2 size={14} className="text-muted-foreground shrink-0" />
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Properties</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-4">
            {/* Clip length */}
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block mb-1.5">Clip length (sec)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0.5}
                  max={60}
                  step={0.5}
                  value={clipLength}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isNaN(v)) setClipLength(Math.min(60, Math.max(0.5, v)));
                  }}
                  className="w-16 h-8 text-xs tabular-nums"
                  aria-label="Default clip length in seconds"
                />
                <span className="text-[11px] text-muted-foreground">per clip</span>
              </div>
            </div>

            {/* Fill Mode – compact list */}
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block mb-2">Fill Mode</Label>
              <div className="space-y-1">
                {(
                  [
                    { value: "one-clip" as const, label: "One Clip", hint: "clip 10s → video 10s" },
                    { value: "multi-clip" as const, label: "Multi Clip", hint: "clip1 + clip2 + clip3" },
                    { value: "loop" as const, label: "Loop", hint: "clip1 + clip1 + clip1" },
                  ] as const
                ).map(({ value, label, hint }) => (
                  <label
                    key={value}
                    className={cn(
                      "flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-[13px]",
                      fillMode === value ? "bg-sky-500/10 text-sky-300" : "text-foreground hover:bg-white/5"
                    )}
                  >
                    <input
                      type="radio"
                      name="fill-mode"
                      value={value}
                      checked={fillMode === value}
                      onChange={() => setFillMode(value)}
                      className="h-3.5 w-3.5 shrink-0 accent-sky-400 border-border bg-background focus:ring-2 focus:ring-sky-400/25 focus:ring-offset-0"
                    />
                    <span className="flex-1 min-w-0">{label}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{hint}</span>
                  </label>
                ))}
              </div>
              {/* Loop options – only when Fill Mode is Loop */}
              {fillMode === "loop" && (
                <div className="mt-2 pt-2 border-t border-border/60 space-y-2">
                  <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block mb-1.5">Loop</Label>
                  <div className="space-y-1">
                    {(["fixed-times", "play-then-reverse"] as const).map((mode) => (
                      <label
                        key={mode}
                        className={cn(
                          "flex items-center gap-2 rounded px-1.5 py-1 cursor-pointer text-[12px]",
                          loopMode === mode ? "bg-sky-500/10 text-sky-300" : "text-foreground hover:bg-white/5"
                        )}
                      >
                        <input
                          type="radio"
                          name="loop-mode"
                          value={mode}
                          checked={loopMode === mode}
                          onChange={() => setLoopMode(mode)}
                          className="h-3 w-3 shrink-0 accent-sky-400 border-border bg-background focus:ring-2 focus:ring-sky-400/25 focus:ring-offset-0"
                        />
                        {mode === "fixed-times" ? "Fixed times" : "Play + reverse"}
                      </label>
                    ))}
                  </div>
                  {loopMode === "fixed-times" && (
                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        type="number"
                        min={1}
                        max={99}
                        value={loopTimes}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!Number.isNaN(v)) setLoopTimes(Math.min(99, Math.max(1, Math.round(v))));
                        }}
                        className="w-14 h-7 text-xs tabular-nums"
                      />
                      <span className="text-[11px] text-muted-foreground">times</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Merge strategy – compact list */}
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block mb-2">Merge strategy</Label>
              <div className="space-y-1">
                {(
                  [
                    { value: "random" as const, label: "Random" },
                    { value: "ai-auto" as const, label: "AI Auto Clip Match" },
                    { value: "serially" as const, label: "In order (one after another)" },
                    { value: "color-style" as const, label: "AI Color style" },
                    { value: "keyword-based" as const, label: "Keyword" },
                  ] as const
                ).map(({ value, label }) => (
                  <label
                    key={value}
                    className={cn(
                      "flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-[13px]",
                      mergeStrategy === value ? "bg-sky-500/10 text-sky-300" : "text-foreground hover:bg-white/5"
                    )}
                  >
                    <input
                      type="radio"
                      name="merge-strategy"
                      value={value}
                      checked={mergeStrategy === value}
                      onChange={() => setMergeStrategy(value)}
                      className="h-3.5 w-3.5 shrink-0 accent-sky-400 border-border bg-background focus:ring-2 focus:ring-sky-400/25 focus:ring-offset-0"
                    />
                    {label}
                  </label>
                ))}
              </div>
              {/* Serial order – when Serial is selected */}
              {mergeStrategy === "serially" && (
                <div className="mt-2 pt-2 border-t border-border/60 space-y-2">
                  <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block mb-1.5">Order</Label>
                  <div className="space-y-1">
                    <label
                      className={cn(
                        "flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-[13px]",
                        serialOrder === "from-start" ? "bg-sky-500/10 text-sky-300" : "text-foreground hover:bg-white/5"
                      )}
                    >
                      <input
                        type="radio"
                        name="serial-order"
                        value="from-start"
                        checked={serialOrder === "from-start"}
                        onChange={() => setSerialOrder("from-start")}
                        className="h-3.5 w-3.5 shrink-0 accent-sky-400 border-border bg-background focus:ring-2 focus:ring-sky-400/25 focus:ring-offset-0"
                      />
                      <span className="flex-1 min-w-0">From start</span>
                      <span className="text-[10px] text-muted-foreground">First clip first, then next</span>
                    </label>
                    <label
                      className={cn(
                        "flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-[13px]",
                        serialOrder === "from-end" ? "bg-sky-500/10 text-sky-300" : "text-foreground hover:bg-white/5"
                      )}
                    >
                      <input
                        type="radio"
                        name="serial-order"
                        value="from-end"
                        checked={serialOrder === "from-end"}
                        onChange={() => setSerialOrder("from-end")}
                        className="h-3.5 w-3.5 shrink-0 accent-sky-400 border-border bg-background focus:ring-2 focus:ring-sky-400/25 focus:ring-offset-0"
                      />
                      <span className="flex-1 min-w-0">From end</span>
                      <span className="text-[10px] text-muted-foreground">Last clip first, then previous</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

                {mergeStrategy === "color-style" && (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Color / style</Label>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => toggleColorStylePreset(preset.name)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded border px-1.5 py-1 text-[11px] transition-colors",
                        colorStyleColors.includes(preset.name)
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border/80 bg-background/50 text-muted-foreground hover:bg-white/5"
                      )}
                    >
                      <span className="size-2 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: preset.hex }} />
                      {preset.name}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <Input
                    value={colorStyleInput}
                    onChange={(e) => setColorStyleInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addColorStyleColor(); } }}
                    placeholder="Custom…"
                    className="h-7 text-xs flex-1"
                  />
                  <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs shrink-0" onClick={addColorStyleColor}>Add</Button>
                </div>
              </div>
            )}
            {mergeStrategy === "keyword-based" && (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Keywords</Label>
                <div className="flex flex-wrap gap-1.5">
                  {keywordMergeKeywords.map((word) => (
                    <span key={word} className="inline-flex items-center gap-1 rounded bg-primary/15 text-primary px-1.5 py-0.5 text-[11px]">
                      {word}
                      <button type="button" onClick={() => removeKeyword(word)} className="rounded p-0.5 hover:bg-primary/25" aria-label={`Remove ${word}`}><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <Input value={keywordMergeInput} onChange={(e) => setKeywordMergeInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addKeyword(); } }} placeholder="Keyword + Enter" className="h-7 text-xs flex-1" />
                  <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs shrink-0" onClick={addKeyword}>Add</Button>
                </div>
              </div>
            )}

            {/* Video Transition */}
            <div className="pt-3 border-t border-border/60 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Video Transition</Label>
                <Switch
                  checked={transitionOn}
                  onCheckedChange={setTransitionOn}
                  aria-label="Video transition on or off"
                  className="shrink-0 scale-75 origin-right"
                />
              </div>
              <span className="text-[10px] text-muted-foreground block -mt-1">{transitionOn ? "ON" : "OFF"}</span>

              {transitionOn && (
                <>
                  <div>
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block mb-1.5">Transition Mode</Label>
                    <div className="space-y-1">
                      {TRANSITION_MODES.map(({ value, label }) => (
                        <label
                          key={value}
                          className={cn(
                            "flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-[13px]",
                            transitionMode === value ? "bg-sky-500/10 text-sky-300" : "text-foreground hover:bg-white/5"
                          )}
                        >
                          <input
                            type="radio"
                            name="transition-mode"
                            value={value}
                            checked={transitionMode === value}
                            onChange={() => setTransitionMode(value)}
                            className="h-3.5 w-3.5 shrink-0 accent-sky-400 border-border bg-background focus:ring-2 focus:ring-sky-400/25 focus:ring-offset-0"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block mb-1.5">Transition Type</Label>
                    <Select value={transitionType} onValueChange={setTransitionType}>
                      <SelectTrigger className="h-8 text-xs w-full">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSITION_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="text-xs">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block mb-1.5">Transition Duration</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0.1}
                        max={5}
                        step={0.1}
                        value={transitionDuration}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!Number.isNaN(v)) setTransitionDuration(Math.min(5, Math.max(0.1, v)));
                        }}
                        className="w-16 h-8 text-xs tabular-nums"
                        aria-label="Transition duration in seconds"
                      />
                      <span className="text-[11px] text-muted-foreground">sec</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Merge rules – compact toggles */}
            <div className="pt-3 border-t border-border/60">
              <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block mb-2">Rules</Label>
              <div className="space-y-1">
                {MERGE_RULES.filter((rule) => rule.title !== "Loop settings").map((rule) => (
                  <div key={rule.title} className={cn("rounded px-2 py-1.5", mergeRuleEnabled[rule.title] ? "bg-background/30" : "opacity-75")}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] text-foreground truncate" title={rule.description}>{rule.title}</span>
                      <Switch
                        checked={mergeRuleEnabled[rule.title] ?? false}
                        onCheckedChange={(checked) => setRuleEnabled(rule.title, checked)}
                        aria-label={`Toggle ${rule.title}`}
                        className="shrink-0 scale-75 origin-right"
                      />
                    </div>
                    {rule.title === "Each clip speed type" && mergeRuleEnabled[rule.title] && (
                      <div className="mt-2 pt-2 border-t border-border/60 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-muted-foreground">Speed</span>
                          <div className="flex items-center gap-1">
                            <Input type="number" min={0.5} max={2} step={0.1} value={clipSpeed} onChange={(e) => { const v = Number(e.target.value); if (!Number.isNaN(v)) setClipSpeed(Math.min(2, Math.max(0.5, v))); }} className="w-12 h-7 text-xs tabular-nums" />
                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setClipSpeed(1)} aria-label="Reset speed"><RotateCcw size={12} /></Button>
                          </div>
                        </div>
                        <input type="range" min={0.5} max={2} step={0.1} value={clipSpeed} onChange={(e) => setClipSpeed(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none bg-input accent-primary cursor-pointer" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Status bar + action – desktop style */}
      <div className="shrink-0 h-9 px-4 flex items-center justify-between border-t border-border/80 bg-[#161B22]">
        <span className="text-[11px] text-muted-foreground">{libraryItems.length} item{libraryItems.length !== 1 ? "s" : ""}</span>
        <Button size="sm" className="h-7 text-xs px-4" asChild>
          <Link to="/playground/overlays">Continue to Overlays</Link>
        </Button>
      </div>
    </div>
  );
}
