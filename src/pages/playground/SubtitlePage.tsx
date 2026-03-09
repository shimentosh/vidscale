import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type SubtitleMode = "off" | "subtitle" | "caption";
type HighlightWords = "off" | "current-word";
type SubtitlePosition = "bottom" | "center" | "top" | "middle-left" | "middle-right" | "custom";
type AnimationType = "none" | "fade" | "pop" | "slide" | "random";
type WordByWord = "1" | "2" | "3" | "4" | "random";

type AspectRatio = "16:9" | "9:16";

const CINEMATIC_STYLES = ["Dramatic", "Minimal", "Impact", "soft"];
const CLASSIC_STYLES = ["Highlight", "HORMOZI 1", "Ali", "Noah", "DEVIN", "Elegant", "Reveal", "Shimmy", "cRay", "Cursor", "MR BEAST 1", "DAVID", "MR BEAST 2", "Iman", "Dhruv", "Flash", "Cyberpunk", "Custom"];

const PREVIEW_SAMPLE = "This is how your subtitle will look.";
const FONT_WEIGHT_MAP: Record<string, number> = { Light: 300, Regular: 400, Medium: 500, SemiBold: 600, Bold: 700 };
const TEXT_CASE_MAP: Record<string, "none" | "uppercase" | "lowercase" | "capitalize"> = {
  Default: "none",
  Uppercase: "uppercase",
  Lowercase: "lowercase",
  "Title case": "capitalize",
};

export function SubtitlePage() {
  const [subtitleMode, setSubtitleMode] = useState<SubtitleMode>("subtitle");
  const [voiceoverAutoDetect, setVoiceoverAutoDetect] = useState(true);
  const [maxWordsPerLine, setMaxWordsPerLine] = useState(5);
  const [karaokeStyle, setKaraokeStyle] = useState(false);
  const [wordByWord, setWordByWord] = useState(false);
  const [wordByWordCount, setWordByWordCount] = useState<WordByWord>("2");
  const [highlightWords, setHighlightWords] = useState<HighlightWords>("off");
  const [selectedCinematicStyle, setSelectedCinematicStyle] = useState<string | null>(null);
  const [selectedClassicStyle, setSelectedClassicStyle] = useState<string | null>("Highlight");
  const [position, setPosition] = useState<SubtitlePosition>("bottom");
  const [posX, setPosX] = useState(110);
  const [posY, setPosY] = useState(1400);
  const [width, setWidth] = useState(860);
  const [height, setHeight] = useState(168);
  const [rotation, setRotation] = useState(0);
  const [fontSize, setFontSize] = useState(80);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [springAnimation, setSpringAnimation] = useState(true);
  const [tiltAnimation, setTiltAnimation] = useState(true);
  const [animationType, setAnimationType] = useState<AnimationType>("fade");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [fontFamily, setFontFamily] = useState("Montserrat");
  const [fontWeight, setFontWeight] = useState("Bold");
  const [textCase, setTextCase] = useState<"Default" | "Uppercase" | "Lowercase" | "Title case">("Default");

  const isSubtitleOrCaption = subtitleMode === "subtitle" || subtitleMode === "caption";

  // Preview font scale: design fontSize is for ~1080p; preview frame is small
  const previewFontSize = Math.max(10, Math.min(24, Math.round((fontSize / 1080) * 280)));
  const positionClasses: Record<SubtitlePosition, string> = {
    bottom: "justify-end items-center pb-4",
    top: "justify-start items-center pt-4",
    center: "justify-center items-center",
    "middle-left": "justify-start items-center pl-4",
    "middle-right": "justify-end items-center pr-4",
    custom: "justify-end items-center pb-4",
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      {/* Title bar */}
      <div className="shrink-0 h-11 px-4 flex items-center gap-3 border-b border-border bg-card">
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Step 6</span>
          <ChevronRight size={12} className="text-muted-foreground/50 shrink-0" aria-hidden />
          <h1 className="text-sm font-semibold text-foreground truncate">Subtitle</h1>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="max-w-4xl mx-auto px-5 py-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left column */}
            <div className="space-y-5">
              {/* Subtitle Mode */}
              <section className="rounded-md border border-border bg-card overflow-hidden">
                <div className="shrink-0 px-3 py-2 border-b border-border bg-card/80">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Subtitle Mode</span>
                </div>
                <div className="p-3 space-y-0.5">
                  {(["off", "subtitle", "caption"] as const).map((value) => (
                    <label
                      key={value}
                      className={cn(
                        "flex items-center gap-2 rounded px-2.5 py-2 cursor-pointer text-[12px] transition-colors",
                        subtitleMode === value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                      )}
                    >
                      <input
                        type="radio"
                        name="subtitle-mode"
                        value={value}
                        checked={subtitleMode === value}
                        onChange={() => setSubtitleMode(value)}
                        className="h-3 w-3 shrink-0 accent-primary"
                      />
                      <span className="capitalize">{value === "off" ? "Off" : value === "subtitle" ? "Subtitle" : "Caption"}</span>
                    </label>
                  ))}
                </div>
              </section>

              {isSubtitleOrCaption && (
                <>
                  {/* Subtitle: Voiceover Auto Detect — only when Subtitle mode is selected */}
                  {subtitleMode === "subtitle" && (
                    <section className="rounded-md border border-border bg-card overflow-hidden">
                      <div className="shrink-0 px-3 py-2 border-b border-border bg-card/80">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Subtitle</span>
                      </div>
                      <div className="p-3">
                        <label className={cn(
                          "flex items-center gap-2 rounded px-2.5 py-2 cursor-pointer text-[12px] transition-colors",
                          voiceoverAutoDetect ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                        )}>
                          <input
                            type="radio"
                            name="subtitle-source"
                            checked={voiceoverAutoDetect}
                            onChange={() => setVoiceoverAutoDetect(true)}
                            className="h-3 w-3 shrink-0 accent-primary"
                          />
                          Voiceover Auto Detect
                        </label>
                      </div>
                    </section>
                  )}

                  {/* Caption Style */}
                  <section className="rounded-md border border-border bg-card overflow-hidden">
                    <div className="shrink-0 px-3 py-2 border-b border-border bg-card/80">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Caption Style</span>
                    </div>
                    <div className="p-3 space-y-3">
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">Max Words Per Line</Label>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={maxWordsPerLine}
                          onChange={(e) => setMaxWordsPerLine(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
                          className="h-8 w-20 text-xs"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-foreground">Karaoke Style</span>
                        <Switch checked={karaokeStyle} onCheckedChange={setKaraokeStyle} className="scale-75 origin-right" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-foreground">Word by Word</span>
                        <Switch checked={wordByWord} onCheckedChange={setWordByWord} className="scale-75 origin-right" />
                      </div>
                      {wordByWord && (
                        <div className="flex flex-wrap gap-1.5 pl-2">
                          {(["1", "2", "3", "4", "random"] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setWordByWordCount(opt)}
                              className={cn(
                                "px-2.5 py-1 rounded text-[11px] border transition-colors",
                                wordByWordCount === opt ? "bg-primary/10 text-primary border-primary/40" : "border-border text-muted-foreground hover:bg-white/5"
                              )}
                            >
                              {opt === "random" ? "Random" : `${opt} word${opt === "1" ? "" : "s"}`}
                            </button>
                          ))}
                        </div>
                      )}
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">Highlight Words</Label>
                        <div className="space-y-0.5">
                          {(["off", "current-word"] as const).map((value) => (
                            <label
                              key={value}
                              className={cn(
                                "flex items-center gap-2 rounded px-2.5 py-2 cursor-pointer text-[12px] transition-colors",
                                highlightWords === value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                              )}
                            >
                              <input
                                type="radio"
                                name="highlight-words"
                                value={value}
                                checked={highlightWords === value}
                                onChange={() => setHighlightWords(value)}
                                className="h-3 w-3 shrink-0 accent-primary"
                              />
                              {value === "off" ? "Off" : "Current Word"}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Subtitle Position */}
                  <section className="rounded-md border border-border bg-card overflow-hidden">
                    <div className="shrink-0 px-3 py-2 border-b border-border bg-card/80">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Subtitle Position</span>
                    </div>
                    <div className="p-3 space-y-0.5">
                      {(
                        [
                          { value: "bottom" as const, label: "Bottom" },
                          { value: "center" as const, label: "Center" },
                          { value: "top" as const, label: "Top" },
                          { value: "middle-left" as const, label: "Middle Left" },
                          { value: "middle-right" as const, label: "Middle Right" },
                          { value: "custom" as const, label: "Custom" },
                        ] as const
                      ).map(({ value, label }) => (
                        <label
                          key={value}
                          className={cn(
                            "flex items-center gap-2 rounded px-2.5 py-2 cursor-pointer text-[12px] transition-colors",
                            position === value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                          )}
                        >
                          <input
                            type="radio"
                            name="position"
                            value={value}
                            checked={position === value}
                            onChange={() => setPosition(value)}
                            className="h-3 w-3 shrink-0 accent-primary"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </section>

                  {/* Animation type */}
                  <section className="rounded-md border border-border bg-card overflow-hidden">
                    <div className="shrink-0 px-3 py-2 border-b border-border bg-card/80">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Animation</span>
                    </div>
                    <div className="p-3 space-y-0.5">
                      {(["none", "fade", "pop", "slide", "random"] as const).map((value) => (
                        <label
                          key={value}
                          className={cn(
                            "flex items-center gap-2 rounded px-2.5 py-2 cursor-pointer text-[12px] transition-colors",
                            animationType === value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                          )}
                        >
                          <input
                            type="radio"
                            name="animation-type"
                            value={value}
                            checked={animationType === value}
                            onChange={() => setAnimationType(value)}
                            className="h-3 w-3 shrink-0 accent-primary"
                          />
                          <span className="capitalize">{value}</span>
                        </label>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* Cinematic Styles */}
              {isSubtitleOrCaption && (
                <section className="rounded-md border border-border bg-card overflow-hidden">
                  <div className="shrink-0 px-3 py-2 border-b border-border bg-card/80">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Cinematic Styles</span>
                  </div>
                  <div className="p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {CINEMATIC_STYLES.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setSelectedCinematicStyle(selectedCinematicStyle === name ? null : name)}
                          className={cn(
                            "w-full rounded-lg border-2 py-2 text-center text-[13px] font-medium transition-all",
                            selectedCinematicStyle === name
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background/30 text-foreground hover:border-primary/50 hover:bg-white/5"
                          )}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Classic Styles */}
              {isSubtitleOrCaption && (
                <section className="rounded-md border border-border bg-card overflow-hidden">
                  <div className="shrink-0 px-3 py-2 border-b border-border bg-card/80">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Classic Styles</span>
                  </div>
                  <div className="p-3 max-h-[280px] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                      {CLASSIC_STYLES.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setSelectedClassicStyle(name)}
                          className={cn(
                            "w-full rounded-lg border-2 py-2 text-center text-[12px] font-medium transition-all truncate",
                            selectedClassicStyle === name
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background/30 text-foreground hover:border-primary/50 hover:bg-white/5"
                          )}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Layout – X, Y, W, H, Rotation (only when Custom position is selected) */}
              {isSubtitleOrCaption && position === "custom" && (
                <section className="rounded-md border border-border bg-card overflow-hidden">
                  <div className="shrink-0 px-3 py-2 border-b border-border bg-card/80">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Custom position</span>
                  </div>
                  <div className="p-3 space-y-3">
                    <div>
                      <Label className="text-[10px] text-muted-foreground block mb-1.5">X</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground tabular-nums w-8">0</span>
                        <input
                          type="range"
                          min={0}
                          max={1920}
                          step={1}
                          value={posX}
                          onChange={(e) => setPosX(Number(e.target.value))}
                          className="flex-1 h-2.5 rounded-full appearance-none bg-input accent-primary cursor-pointer"
                          aria-valuemin={0}
                          aria-valuemax={1920}
                          aria-valuenow={posX}
                        />
                        <span className="text-xs text-muted-foreground tabular-nums w-8">1920</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground block mb-1.5">Y</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground tabular-nums w-8">0</span>
                        <input
                          type="range"
                          min={0}
                          max={2160}
                          step={1}
                          value={posY}
                          onChange={(e) => setPosY(Number(e.target.value))}
                          className="flex-1 h-2.5 rounded-full appearance-none bg-input accent-primary cursor-pointer"
                          aria-valuemin={0}
                          aria-valuemax={2160}
                          aria-valuenow={posY}
                        />
                        <span className="text-xs text-muted-foreground tabular-nums w-8">2160</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground block mb-1.5">W</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground tabular-nums w-8">100</span>
                        <input
                          type="range"
                          min={100}
                          max={1920}
                          step={10}
                          value={width}
                          onChange={(e) => setWidth(Number(e.target.value))}
                          className="flex-1 h-2.5 rounded-full appearance-none bg-input accent-primary cursor-pointer"
                          aria-valuemin={100}
                          aria-valuemax={1920}
                          aria-valuenow={width}
                        />
                        <span className="text-xs text-muted-foreground tabular-nums w-8">1920</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground block mb-1.5">H</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground tabular-nums w-8">50</span>
                        <input
                          type="range"
                          min={50}
                          max={500}
                          step={5}
                          value={height}
                          onChange={(e) => setHeight(Number(e.target.value))}
                          className="flex-1 h-2.5 rounded-full appearance-none bg-input accent-primary cursor-pointer"
                          aria-valuemin={50}
                          aria-valuemax={500}
                          aria-valuenow={height}
                        />
                        <span className="text-xs text-muted-foreground tabular-nums w-8">500</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground block mb-1.5">Rotation</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground tabular-nums w-8">-180</span>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          step={1}
                          value={rotation}
                          onChange={(e) => setRotation(Number(e.target.value))}
                          className="flex-1 h-2.5 rounded-full appearance-none bg-input accent-primary cursor-pointer"
                          aria-valuemin={-180}
                          aria-valuemax={180}
                          aria-valuenow={rotation}
                        />
                        <span className="text-xs text-muted-foreground tabular-nums w-8">180</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Typography */}
              {isSubtitleOrCaption && (
                <section className="rounded-md border border-border bg-card overflow-hidden">
                  <div className="shrink-0 px-3 py-2 border-b border-border bg-card/80">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Typography</span>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-medium text-muted-foreground block">Font Family</Label>
                        <Select value={fontFamily} onValueChange={setFontFamily}>
                          <SelectTrigger className="w-[180px] h-9 bg-background/50 border-border text-sm">
                            <SelectValue style={{ fontFamily }} />
                          </SelectTrigger>
                          <SelectContent>
                            {["Montserrat", "Inter", "Roboto", "Open Sans", "Lato", "Poppins", "Playfair Display", "Source Sans 3"].map((font) => (
                              <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                {font}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-medium text-muted-foreground block">Font Weight</Label>
                        <Select value={fontWeight} onValueChange={setFontWeight}>
                          <SelectTrigger className="w-[120px] h-9 bg-background/50 border-border text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["Light", "Regular", "Medium", "SemiBold", "Bold"].map((weight) => (
                              <SelectItem key={weight} value={weight}>
                                {weight}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground block mb-1">Max Font Size</Label>
                      <Input type="number" min={1} max={500} value={fontSize} onChange={(e) => setFontSize(Math.min(500, Math.max(1, Number(e.target.value) || 1)))} className="h-8 w-20 text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] text-muted-foreground block mb-1">Line Height</Label>
                        <Input type="number" min={0.5} max={5} step={0.1} value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value) || 1)} className="h-8 text-xs" />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground block mb-1">Letter Spacing</Label>
                        <Input type="number" value={letterSpacing} onChange={(e) => setLetterSpacing(Number(e.target.value) || 0)} className="h-8 text-xs" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-medium text-muted-foreground block">Text Case</Label>
                      <Select value={textCase} onValueChange={(v) => setTextCase(v as typeof textCase)}>
                        <SelectTrigger className="w-full h-9 bg-background/50 border-border text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(["Default", "Uppercase", "Lowercase", "Title case"] as const).map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>
              )}

              {/* Animation toggles */}
              {isSubtitleOrCaption && (
                <section className="rounded-md border border-border bg-card overflow-hidden">
                  <div className="shrink-0 px-3 py-2 border-b border-border bg-card/80">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Effects</span>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-foreground">Spring Animation</span>
                      <Switch checked={springAnimation} onCheckedChange={setSpringAnimation} className="scale-75 origin-right" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-foreground">Tilt Animation</span>
                      <Switch checked={tiltAnimation} onCheckedChange={setTiltAnimation} className="scale-75 origin-right" />
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </main>

        {/* Right: Live preview sidebar (same design as Topic/VoiceOvers) */}
        <aside className="w-[320px] min-w-[320px] shrink-0 flex flex-col border-l border-border/80 bg-card overflow-hidden hidden lg:flex">
          <div className="shrink-0 px-4 py-3 border-b border-border/60 flex items-center gap-2">
            <Monitor size={14} className="text-muted-foreground shrink-0" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Live preview
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 flex flex-col gap-3">
            {/* Aspect ratio */}
            <div className="shrink-0">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Aspect ratio</span>
              <div className="flex gap-1.5">
                {(["16:9", "9:16"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={cn(
                      "flex-1 py-2 rounded-md text-[12px] font-medium border transition-colors",
                      aspectRatio === ratio
                        ? "bg-primary/10 text-primary border-primary/40"
                        : "border-border text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview frame */}
            <div className="flex-1 min-h-0 flex flex-col">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Preview</span>
              <div
                className={cn(
                  "w-full rounded-lg overflow-hidden border border-border bg-black flex-shrink-0",
                  aspectRatio === "16:9" ? "aspect-video max-h-[180px]" : "aspect-[9/16] max-h-[360px]"
                )}
              >
                {subtitleMode === "off" ? (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs px-4 text-center">
                    Turn on Subtitle or Caption to see a live preview.
                  </div>
                ) : (
                  <div
                    className={cn(
                      "w-full h-full relative flex flex-col bg-neutral-950",
                      positionClasses[position]
                    )}
                  >
                    <div
                      className="px-3 py-1.5 text-center max-w-[90%]"
                      style={{
                        fontFamily,
                        fontWeight: FONT_WEIGHT_MAP[fontWeight] ?? 700,
                        fontSize: `${previewFontSize}px`,
                        lineHeight: lineHeight,
                        letterSpacing: `${letterSpacing}px`,
                        textTransform: TEXT_CASE_MAP[textCase] ?? "none",
                        transform: `rotate(${rotation}deg)`,
                      }}
                    >
                      <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        {PREVIEW_SAMPLE}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {isSubtitleOrCaption && (
                <p className="text-[11px] text-muted-foreground mt-2 px-0.5">
                  Style: {selectedClassicStyle ?? selectedCinematicStyle ?? "Default"} · {position} · {animationType}
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom bar */}
      <div className="shrink-0 h-9 px-4 flex items-center justify-between border-t border-border bg-card">
        <span className="text-[11px] text-muted-foreground">
          {subtitleMode === "off" ? "Subtitle off" : `${subtitleMode} · ${selectedClassicStyle ?? "No style"}`}
        </span>
        <Button size="sm" className="h-7 text-xs px-4" asChild>
          <Link to="/playground/audio">Continue to Audio</Link>
        </Button>
      </div>
    </div>
  );
}
