import { useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { FolderSearch, Upload, Search, X, ChevronDown, RotateCcw, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type MergeStrategy = "random" | "ai-auto" | "serially" | "color-style" | "keyword-based";
type SelectedItem = { id: string; name: string; type: "folder" | "file" | "import" };

const AVAILABLE_FOLDERS = [
  "My Videos",
  "Stock Clips",
  "dev-environment",
  "FB Posting",
  "iphone 11 pro 2",
  "Iphone 13 Pro to 15 Pro Max",
  "Picture",
];

const initialLibraryItems: SelectedItem[] = AVAILABLE_FOLDERS.map((name) => ({
  id: `folder-${name}`,
  name,
  type: "folder",
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
  { title: "Call To Action Merge", description: "Ensures CTA clips appear near the end." },
  { title: "Loop settings", description: "Control how footage clips repeat to fill your video length or segment duration." },
];

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
  const [ctaMergeFolderNames, setCtaMergeFolderNames] = useState<string[]>([]);
  const [colorStyleColors, setColorStyleColors] = useState<string[]>([]);
  const [colorStyleInput, setColorStyleInput] = useState("");
  const [clipSpeed, setClipSpeed] = useState(1);
  const [loopMode, setLoopMode] = useState<"until-audio" | "fixed-times" | "play-then-reverse">("until-audio");
  const [loopTimes, setLoopTimes] = useState(2);
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

  const toggleCtaFolder = (folderName: string) => {
    setCtaMergeFolderNames((prev) =>
      prev.includes(folderName) ? prev.filter((f) => f !== folderName) : [...prev, folderName]
    );
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
        })),
      ]);
    }
    e.target.value = "";
  };

  const removeItem = (id: string) => setLibraryItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header – same as Voice Overs */}
      <div className="shrink-0 py-6 px-8 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 5</span>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Media</h1>
        <p className="text-sm text-muted-foreground mt-2">Add and arrange video in your media library.</p>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="flex-1 min-w-0 flex flex-col overflow-auto">
          <div className="p-8 space-y-6">
            {/* Media Library – one library, 3 ways to add */}
            <section className="rounded-xl border border-border bg-[#131922] p-6">
              <div className="flex items-center gap-2 mb-2">
                <FolderSearch size={20} className="text-muted-foreground shrink-0" />
                <Label className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
                  Media Library
                </Label>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Folders are listed below — select and search from there. Add more with Upload video.
              </p>

              {/* Upload video | Import */}
              <div className="flex flex-wrap gap-2 mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  className="sr-only"
                  onChange={handleFileChange}
                  aria-label="Upload video files"
                />
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleUploadClick}>
                  <Upload size={16} />
                  Upload video
                </Button>
              </div>

              {/* Search your library */}
              <div className="mb-2">
                <Label className="text-xs text-muted-foreground block mb-1.5">Search your library</Label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="Search folders and footage…"
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    className="pl-9 h-9 rounded-lg bg-background/50 border-border"
                    aria-label="Search your media library"
                  />
                </div>
              </div>

              {/* Your chosen footage */}
              <div className="rounded-lg border border-border bg-background/30 min-h-[140px] max-h-[220px] overflow-y-auto">
                <div className="p-2">
                    {filteredLibrary.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      {libraryItems.length === 0
                        ? "No footage yet. Upload video to add to your library."
                        : "No items match your search."}
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {filteredLibrary.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-white/5 group"
                        >
                          <span className="min-w-0 truncate">{item.name}</span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Remove ${item.name}`}
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                Footage in your library is used according to the merge rules below.
              </p>
            </section>

            {/* Merge Rules – section card */}
            <section className="rounded-xl border border-border bg-[#131922] p-6">
              <div className="flex items-center gap-2 mb-2">
                <ChevronDown size={18} className="text-muted-foreground rotate-180 shrink-0" />
                <Label className="text-sm font-semibold text-foreground">Merge Rules</Label>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                How clips from your footage library are chosen and combined for each segment.
              </p>

              {/* Existing settings – each inside its own box */}
              <div className="space-y-6 mb-6 pb-6 border-b border-border">
                {/* Default clip length – inside one box */}
                <div className="rounded-lg border border-border bg-background/30 px-4 py-4">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider font-medium block mb-2">
                    Default clip length (seconds)
                  </Label>
                  <div className="flex items-center gap-2 mb-1">
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
                      className="w-20 h-9 tabular-nums"
                      aria-label="Default clip length in seconds"
                    />
                    <span className="text-sm text-muted-foreground">seconds per clip</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Target length for each clip used in the video.</p>
                </div>

                {/* Primary merge strategy – label above, each option in its own box */}
                <div className="flex flex-col gap-3">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
                    Primary merge strategy
                  </Label>
                  <div className="space-y-3">
                    <label
                      className={cn(
                        "block rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                        mergeStrategy === "random"
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background/30 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="merge-strategy"
                          value="random"
                          checked={mergeStrategy === "random"}
                          onChange={() => setMergeStrategy("random")}
                          className="h-4 w-4 border-input text-primary focus:ring-ring"
                        />
                        <span className="text-sm font-medium text-foreground">Random from selected folders</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 ml-7">Pick clips randomly from the folders you selected.</p>
                    </label>

                    <label
                      className={cn(
                        "block rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                        mergeStrategy === "ai-auto"
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background/30 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="merge-strategy"
                          value="ai-auto"
                          checked={mergeStrategy === "ai-auto"}
                          onChange={() => setMergeStrategy("ai-auto")}
                          className="h-4 w-4 border-input text-primary focus:ring-ring"
                        />
                        <span className="text-sm font-medium text-foreground">AI Auto Match</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 ml-7">AI picks clips that best match each part of your script.</p>
                    </label>

                    <label
                      className={cn(
                        "block rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                        mergeStrategy === "serially"
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background/30 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="merge-strategy"
                          value="serially"
                          checked={mergeStrategy === "serially"}
                          onChange={() => setMergeStrategy("serially")}
                          className="h-4 w-4 border-input text-primary focus:ring-ring"
                        />
                        <span className="text-sm font-medium text-foreground">Serial order</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 ml-7">Use clips in order from the selected folders, one after another.</p>
                    </label>

                    <label
                      className={cn(
                        "block rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                        mergeStrategy === "color-style"
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background/30 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="merge-strategy"
                          value="color-style"
                          checked={mergeStrategy === "color-style"}
                          onChange={() => setMergeStrategy("color-style")}
                          className="h-4 w-4 border-input text-primary focus:ring-ring"
                        />
                        <span className="text-sm font-medium text-foreground">Color Style Matching</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 ml-7">Selects clips with similar color tone or visual style.</p>
                    </label>

                    <label
                      className={cn(
                        "block rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                        mergeStrategy === "keyword-based"
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background/30 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="merge-strategy"
                          value="keyword-based"
                          checked={mergeStrategy === "keyword-based"}
                          onChange={() => setMergeStrategy("keyword-based")}
                          className="h-4 w-4 border-input text-primary focus:ring-ring"
                        />
                        <span className="text-sm font-medium text-foreground">Keyword Based Merge</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 ml-7">Matches clips based on keywords detected in the script.</p>
                    </label>
                  </div>
                </div>

                {/* Color Style options – when Color Style Matching is selected */}
                {mergeStrategy === "color-style" && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider font-medium block mb-2">Color / style names</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Select colors or add your own. Clips with similar color tone or style will be preferred.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {COLOR_STYLE_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => toggleColorStylePreset(preset.name)}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                            colorStyleColors.includes(preset.name)
                              ? "border-primary bg-primary/15 text-primary ring-1 ring-primary/30"
                              : "border-border bg-background/50 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                          )}
                        >
                          <span
                            className="size-3 rounded-full shrink-0 border border-white/20"
                            style={{ backgroundColor: preset.hex }}
                          />
                          {preset.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {colorStyleColors.map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center gap-1 rounded-md bg-primary/15 text-primary px-2.5 py-1 text-xs font-medium"
                        >
                          {name}
                          <button
                            type="button"
                            onClick={() => removeColorStyleColor(name)}
                            className="rounded p-0.5 hover:bg-primary/25 transition-colors"
                            aria-label={`Remove ${name}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={colorStyleInput}
                        onChange={(e) => setColorStyleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            addColorStyleColor();
                          }
                        }}
                        placeholder="Add custom color or style name"
                        className="h-8 text-sm flex-1"
                        aria-label="Add color or style"
                      />
                      <Button type="button" size="sm" variant="outline" className="h-8 shrink-0" onClick={addColorStyleColor}>
                        Add
                      </Button>
                    </div>
                  </div>
                )}

                {/* Keyword options – when Keyword Based Merge is selected */}
                {mergeStrategy === "keyword-based" && (
                  <div className="mt-4 pt-4 border-t border-border space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider font-medium block mb-2">Keywords</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {keywordMergeKeywords.map((word) => (
                        <span
                          key={word}
                          className="inline-flex items-center gap-1 rounded-md bg-primary/15 text-primary px-2.5 py-1 text-xs font-medium"
                        >
                          {word}
                          <button
                            type="button"
                            onClick={() => removeKeyword(word)}
                            className="rounded p-0.5 hover:bg-primary/25 transition-colors"
                            aria-label={`Remove ${word}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={keywordMergeInput}
                        onChange={(e) => setKeywordMergeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            addKeyword();
                          }
                        }}
                        placeholder="Type a keyword and press Enter"
                        className="h-8 text-sm flex-1"
                        aria-label="Add keyword"
                      />
                      <Button type="button" size="sm" variant="outline" className="h-8 shrink-0" onClick={addKeyword}>
                        Add
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Select multiple keywords; clips will match these when detected in the script.</p>
                  </div>
                )}
              </div>

              {/* Merge rule options – toggles (Color Style & Keyword Based moved to Primary merge strategy) */}
              <Label className="text-muted-foreground text-xs uppercase tracking-wider font-medium block mb-3">
                Merge rule options
              </Label>
              <p className="text-xs text-muted-foreground mb-4">
                Turn each rule on or off. Enabled rules apply when merging clips.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {MERGE_RULES.map((rule) => (
                  <div
                    key={rule.title}
                    className={cn(
                      "rounded-lg border px-4 py-3 transition-colors",
                      mergeRuleEnabled[rule.title]
                        ? "border-border bg-background/30"
                        : "border-border/80 bg-background/20 opacity-80"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground mb-0.5">{rule.title}</p>
                        <p className="text-xs text-muted-foreground">{rule.description}</p>
                      </div>
                      <Switch
                        checked={mergeRuleEnabled[rule.title] ?? false}
                        onCheckedChange={(checked) => setRuleEnabled(rule.title, checked)}
                        aria-label={`Toggle ${rule.title}`}
                        className="shrink-0 mt-0.5"
                      />
                    </div>
                    {/* Each clip speed type – single speed input + slider when on */}
                    {rule.title === "Each clip speed type" && mergeRuleEnabled[rule.title] && (
                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        <p className="text-xs text-muted-foreground">
                          Set playback speed for each clip. 1× is normal playback.
                        </p>
                        <div className="rounded-lg border border-border bg-background/50 px-4 py-4 space-y-3">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-foreground">Speed</span>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={0.5}
                                max={2}
                                step={0.1}
                                value={clipSpeed}
                                onChange={(e) => {
                                  const v = Number(e.target.value);
                                  if (!Number.isNaN(v)) setClipSpeed(Math.min(2, Math.max(0.5, v)));
                                }}
                                className="w-16 h-9 text-sm tabular-nums"
                                aria-label="Clip speed"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                                onClick={() => setClipSpeed(1)}
                                aria-label="Reset speed to 1"
                              >
                                <RotateCcw size={16} />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground tabular-nums w-8">0.5</span>
                            <input
                              type="range"
                              min={0.5}
                              max={2}
                              step={0.1}
                              value={clipSpeed}
                              onChange={(e) => setClipSpeed(Number(e.target.value))}
                              className="flex-1 h-2.5 rounded-full appearance-none bg-input accent-primary cursor-pointer"
                              aria-valuemin={0.5}
                              aria-valuemax={2}
                              aria-valuenow={clipSpeed}
                            />
                            <span className="text-xs text-muted-foreground tabular-nums w-8">2</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* CTA folder selection – only when Call To Action Merge is on */}
                    {rule.title === "Call To Action Merge" && mergeRuleEnabled[rule.title] && (
                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        <Label className="text-xs text-muted-foreground block">CTA footage folders</Label>
                        <p className="text-xs text-muted-foreground">
                          Select which folders contain your call-to-action clips. These will be used near the end of the video.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {AVAILABLE_FOLDERS.map((folderName) => (
                            <label
                              key={folderName}
                              className={cn(
                                "flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors text-sm",
                                ctaMergeFolderNames.includes(folderName)
                                  ? "border-primary bg-primary/10 text-foreground"
                                  : "border-border bg-background/50 text-muted-foreground hover:bg-white/5"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={ctaMergeFolderNames.includes(folderName)}
                                onChange={() => toggleCtaFolder(folderName)}
                                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                              />
                              <span>{folderName}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Loop settings – when Loop settings option is on */}
                    {rule.title === "Loop settings" && mergeRuleEnabled[rule.title] && (
                      <div className="mt-4 pt-4 border-t border-border space-y-4">
                        <div className="flex flex-col gap-3">
                          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
                            Loop mode
                          </Label>
                          <div className="space-y-3">
                            <label
                              className={cn(
                                "block rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                                loopMode === "until-audio"
                                  ? "border-primary bg-primary/10"
                                  : "border-border bg-background/30 hover:bg-white/5"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="loop-mode"
                                  value="until-audio"
                                  checked={loopMode === "until-audio"}
                                  onChange={() => setLoopMode("until-audio")}
                                  className="h-4 w-4 border-input text-primary focus:ring-ring"
                                />
                                <span className="text-sm font-medium text-foreground">Loop until audio/voiceover duration</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1.5 ml-7">
                                Clips repeat until the total video length matches your voiceover or audio track.
                              </p>
                            </label>

                            <label
                              className={cn(
                                "block rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                                loopMode === "fixed-times"
                                  ? "border-primary bg-primary/10"
                                  : "border-border bg-background/30 hover:bg-white/5"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="loop-mode"
                                  value="fixed-times"
                                  checked={loopMode === "fixed-times"}
                                  onChange={() => setLoopMode("fixed-times")}
                                  className="h-4 w-4 border-input text-primary focus:ring-ring"
                                />
                                <span className="text-sm font-medium text-foreground">Loop how many times?</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1.5 ml-7">
                                Repeat each clip or the clip sequence a fixed number of times.
                              </p>
                            </label>

                            <label
                              className={cn(
                                "block rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                                loopMode === "play-then-reverse"
                                  ? "border-primary bg-primary/10"
                                  : "border-border bg-background/30 hover:bg-white/5"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="loop-mode"
                                  value="play-then-reverse"
                                  checked={loopMode === "play-then-reverse"}
                                  onChange={() => setLoopMode("play-then-reverse")}
                                  className="h-4 w-4 border-input text-primary focus:ring-ring"
                                />
                                <span className="text-sm font-medium text-foreground">One play, one reverse</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1.5 ml-7">
                                Within each loop: play clip forward then backward (ping-pong).
                              </p>
                            </label>
                          </div>
                        </div>

                        {loopMode === "fixed-times" && (
                          <div className="pt-4 border-t border-border">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider font-medium block mb-2">
                              Number of loops
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={1}
                                max={99}
                                value={loopTimes}
                                onChange={(e) => {
                                  const v = Number(e.target.value);
                                  if (!Number.isNaN(v)) setLoopTimes(Math.min(99, Math.max(1, Math.round(v))));
                                }}
                                className="w-20 h-9 tabular-nums"
                                aria-label="How many times to loop"
                              />
                              <span className="text-sm text-muted-foreground">times</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">e.g. 2 = play through twice.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="shrink-0 p-8 pt-4">
        <Button size="lg" className="w-full h-12 font-semibold uppercase tracking-wider text-sm gap-2" asChild>
          <Link to="/playground/overlays">Continue to Overlays &gt;</Link>
        </Button>
      </div>
    </div>
  );
}
