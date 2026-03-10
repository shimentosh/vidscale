import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Monitor, Loader2, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type SubtitleMode = "off" | "subtitle" | "caption";
type CaptionSource = "auto" | "script" | "custom" | "topic_headline" | "video_frames" | "upload";
type HighlightWords = "off" | "current-word";
type SubtitlePosition =
  | "top-left" | "top-center" | "top-right"
  | "center-left" | "center" | "center-right"
  | "bottom-left" | "bottom-center" | "bottom-right"
  | "custom";
type AnimationType = "none" | "fade" | "pop" | "slide" | "random";
type WordByWord = "instagram" | "custom";

type AspectRatio = "16:9" | "9:16";

const CAPTION_LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Hindi", "Japanese", "Bengali"];
const CINEMATIC_STYLES = ["Dramatic", "Minimal", "Impact", "soft"];
const CLASSIC_STYLES = ["Highlight", "HORMOZI 1", "Ali", "Noah", "DEVIN", "Elegant", "Reveal", "Shimmy", "cRay", "Cursor", "MR BEAST 1", "DAVID", "MR BEAST 2", "Iman", "Dhruv", "Flash", "Cyberpunk"];

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
  const [karaokeStyle, setKaraokeStyle] = useState(false);
  const [wordByWordCount, setWordByWordCount] = useState<WordByWord>("custom");
  const [wordByWordCustomLimit, setWordByWordCustomLimit] = useState(5);
  const [highlightWords, setHighlightWords] = useState<HighlightWords>("off");
  const [selectedCinematicStyle, setSelectedCinematicStyle] = useState<string | null>(null);
  const [selectedClassicStyle, setSelectedClassicStyle] = useState<string | null>("Highlight");
  const [position, setPosition] = useState<SubtitlePosition>("bottom-center");
  const [posX, setPosX] = useState(110);
  const [posY, setPosY] = useState(1400);
  const [width, setWidth] = useState(860);
  const [height, setHeight] = useState(168);
  const [rotation, setRotation] = useState(0);
  const xyPadRef = useRef<HTMLDivElement>(null);
  const handleXYPad = useCallback(
    (clientX: number, clientY: number) => {
      const el = xyPadRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const fracX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const fracY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      setPosX(Math.round(fracX * 1920));
      setPosY(Math.round(fracY * 2160));
    },
    []
  );
  const [fontSize, setFontSize] = useState(44);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [animationType, setAnimationType] = useState<AnimationType>("none");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [fontFamily, setFontFamily] = useState("Montserrat");
  const [fontWeight, setFontWeight] = useState("Bold");
  const [textCase, setTextCase] = useState<"Default" | "Uppercase" | "Lowercase" | "Title case">("Default");
  const [subtitleColor, setSubtitleColor] = useState("#ffffff");
  const [strokeEnabled, setStrokeEnabled] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowBlur, setShadowBlur] = useState(4);
  const [shadowOpacity, setShadowOpacity] = useState(0.8);
  const [shadowOffsetY, setShadowOffsetY] = useState(2);
  // Caption-only: generate & flexible options
  const [captionInputMode, setCaptionInputMode] = useState<"device" | "ai">("ai");
  const [captionGenerating, setCaptionGenerating] = useState(false);
  const [captionSource, setCaptionSource] = useState<CaptionSource>("custom");
  const [captionLanguage, setCaptionLanguage] = useState("English");
  const [captionCustomPrompt, setCaptionCustomPrompt] = useState("");
  const [captionVideoFramesCount, setCaptionVideoFramesCount] = useState(1);
  const [captionUploadedLines, setCaptionUploadedLines] = useState<string[]>([]);
  const [captionUploadFileName, setCaptionUploadFileName] = useState<string | null>(null);
  const [captionWordCount, setCaptionWordCount] = useState(8);
  const captionFileInputRef = useRef<HTMLInputElement>(null);

  const isSubtitleOrCaption = subtitleMode === "subtitle" || subtitleMode === "caption";

  // Preview font scale: design fontSize is for ~1080p; preview frame is small
  const previewFontSize = Math.max(10, Math.min(24, Math.round((fontSize / 1080) * 280)));
  // Flex is flex-col: justify = vertical, items = horizontal
  const positionClasses: Record<SubtitlePosition, string> = {
    "top-left": "justify-start items-start pt-4 pl-4",
    "top-center": "justify-start items-center pt-4",
    "top-right": "justify-start items-end pt-4 pr-4",
    "center-left": "justify-center items-start pl-4",
    center: "justify-center items-center",
    "center-right": "justify-center items-end pr-4",
    "bottom-left": "justify-end items-start pb-4 pl-4",
    "bottom-center": "justify-end items-center pb-4",
    "bottom-right": "justify-end items-end pb-4 pr-4",
    custom: "justify-center items-center",
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      {/* Title bar */}
      <div className="shrink-0 min-h-11 py-3 px-4 flex items-center gap-3 border-b border-border bg-card">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Step 6</span>
            <ChevronRight size={12} className="text-muted-foreground/50 shrink-0" aria-hidden />
            <h1 className="text-sm font-semibold text-foreground">Subtitles & captions</h1>
          </div>
          <p className="text-[11px] text-muted-foreground hidden sm:block">Subtitle = synced to voiceover (SRT). Caption = static on-screen line.</p>
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
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Display type</span>
                </div>
                <div className="p-3 space-y-1.5">
                  <div
                    role="radiogroup"
                    aria-label="Text display type"
                    className="flex rounded-lg border border-border bg-background/50 p-0.5"
                  >
                    {(["off", "subtitle", "caption"] as const).map((value) => (
                      <label
                        key={value}
                        className={cn(
                          "flex-1 flex flex-col items-center justify-center rounded-md px-2 py-2 cursor-pointer text-center transition-colors",
                          subtitleMode === value
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground hover:bg-white/5"
                        )}
                      >
                        <input
                          type="radio"
                          name="subtitle-mode"
                          value={value}
                          checked={subtitleMode === value}
                          onChange={() => setSubtitleMode(value)}
                          className="sr-only"
                        />
                        <span className="text-[12px] font-medium">
                          {value === "off" ? "Off" : value === "subtitle" ? "Subtitle" : "Caption"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              {/* Caption: From Device | AI Caption switch, then mode-specific options */}
              {subtitleMode === "caption" && (
                <section className="rounded-md border border-border bg-card overflow-hidden">
                  <div className="shrink-0 px-3 py-2 border-b border-border bg-card/80">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Caption (static line)</span>
                  </div>
                  <div className="p-3 space-y-4">
                    {/* Two options at first: From Device | AI Caption */}
                    <div
                      role="radiogroup"
                      aria-label="Caption input mode"
                      className="flex rounded-lg border border-border bg-background/50 p-0.5"
                    >
                      <label
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 cursor-pointer text-[12px] font-medium transition-colors",
                          captionInputMode === "device"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground hover:bg-white/5"
                        )}
                      >
                        <input
                          type="radio"
                          name="caption-input-mode"
                          value="device"
                          checked={captionInputMode === "device"}
                          onChange={() => setCaptionInputMode("device")}
                          className="sr-only"
                        />
                        <Upload size={14} className="shrink-0" />
                        From Device
                      </label>
                      <label
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 cursor-pointer text-[12px] font-medium transition-colors",
                          captionInputMode === "ai"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground hover:bg-white/5"
                        )}
                      >
                        <input
                          type="radio"
                          name="caption-input-mode"
                          value="ai"
                          checked={captionInputMode === "ai"}
                          onChange={() => setCaptionInputMode("ai")}
                          className="sr-only"
                        />
                        <Sparkles size={14} className="shrink-0" />
                        AI Caption
                      </label>
                    </div>

                    {captionInputMode === "device" ? (
                      /* From Device: upload file only (no language) */
                      <div className="space-y-3 pt-1 border-t border-border">
                        <div className="space-y-2">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider block">Upload caption file</Label>
                          <input
                            ref={captionFileInputRef}
                            type="file"
                            accept=".txt,.srt,.vtt,text/plain"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setCaptionUploadFileName(file.name);
                              const reader = new FileReader();
                              reader.onload = () => {
                                const text = reader.result as string;
                                const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
                                setCaptionUploadedLines(lines);
                              };
                              reader.readAsText(file);
                              e.target.value = "";
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full gap-1.5 h-7 text-[11px] px-2.5"
                            onClick={() => captionFileInputRef.current?.click()}
                          >
                            <Upload size={12} className="shrink-0" />
                            Choose file (one caption per line)
                          </Button>
                          {(captionUploadedLines.length > 0 || captionUploadFileName) && (
                            <div className="text-[11px] text-muted-foreground rounded-md bg-muted/50 px-2.5 py-2 space-y-0.5">
                              <p className="font-medium text-foreground">
                                {captionUploadedLines.length} caption{captionUploadedLines.length !== 1 ? "s" : ""}
                              </p>
                              {captionUploadFileName && (
                                <p className="truncate" title={captionUploadFileName}>
                                  {captionUploadFileName}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* AI Caption: caption source + custom prompt + language, then generate button last */
                      <>
                        <div className="space-y-3 pt-1 border-t border-border">
                          <div>
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">Caption source</Label>
                            <div className="flex flex-wrap gap-1.5">
                              {(
                                [
                                  { value: "topic_headline" as const, label: "From topic headline" },
                                  { value: "script" as const, label: "From script" },
                                  { value: "video_frames" as const, label: "Extract from video frames" },
                                  { value: "custom" as const, label: "Custom" },
                                ] as const
                              ).map(({ value, label }) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setCaptionSource(value)}
                                  className={cn(
                                    "px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-colors",
                                    captionSource === value
                                      ? "bg-primary/10 text-primary border-primary/40"
                                      : "border-border text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                  )}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                          {captionSource === "video_frames" && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">How many frames (1–5)</Label>
                                <span className="text-[11px] tabular-nums text-muted-foreground">{captionVideoFramesCount}</span>
                              </div>
                              <input
                                type="range"
                                min={1}
                                max={5}
                                step={1}
                                value={captionVideoFramesCount}
                                onChange={(e) => setCaptionVideoFramesCount(Number(e.target.value))}
                                className="flex-1 h-2.5 w-full rounded-full appearance-none bg-input accent-primary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-0"
                                aria-valuemin={1}
                                aria-valuemax={5}
                                aria-valuenow={captionVideoFramesCount}
                                aria-label="How many frames"
                              />
                            </div>
                          )}
                          <div>
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
                              Custom prompt{captionSource === "custom" ? " *" : " (optional)"}
                            </Label>
                            <Input
                              type="text"
                              value={captionCustomPrompt}
                              onChange={(e) => setCaptionCustomPrompt(e.target.value)}
                              placeholder={captionSource === "custom" ? "Enter your custom caption prompt" : "e.g. tone, style, or extra instructions"}
                              className={cn(
                                "h-8 text-[12px] bg-background/50 placeholder:text-muted-foreground",
                                captionSource === "custom" && !captionCustomPrompt.trim() && "border-destructive/50 focus-visible:ring-destructive/50"
                              )}
                              aria-required={captionSource === "custom"}
                            />
                            {captionSource === "custom" && !captionCustomPrompt.trim() && (
                              <p className="text-[10px] text-destructive mt-1">Required when using Custom source.</p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">How many words (0–80)</Label>
                              <span className="text-[11px] tabular-nums text-muted-foreground">{captionWordCount}</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={80}
                              step={1}
                              value={captionWordCount}
                              onChange={(e) => setCaptionWordCount(Number(e.target.value))}
                              className="flex-1 h-2.5 w-full rounded-full appearance-none bg-input accent-primary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-0"
                              aria-valuemin={0}
                              aria-valuemax={80}
                              aria-valuenow={captionWordCount}
                              aria-label="Caption word count"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">Language</Label>
                            <Select value={captionLanguage} onValueChange={setCaptionLanguage}>
                              <SelectTrigger className="h-8 text-[12px] bg-background/50">
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                {CAPTION_LANGUAGES.map((lang) => (
                                  <SelectItem key={lang} value={lang} className="text-[12px]">
                                    {lang}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button
                          type="button"
                          className="w-full gap-2 mt-4"
                          disabled={captionGenerating || (captionSource === "custom" && !captionCustomPrompt.trim())}
                          onClick={() => {
                            setCaptionGenerating(true);
                            setTimeout(() => setCaptionGenerating(false), 2500);
                          }}
                        >
                          {captionGenerating ? (
                            <>
                              <Loader2 size={16} className="animate-spin shrink-0" />
                              Generating captions…
                            </>
                          ) : (
                            <>
                              <Sparkles size={16} className="shrink-0" />
                              Generate caption for all videos
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </section>
              )}

              {isSubtitleOrCaption && (
                <>
                  {/* How subtitles look — only when Subtitle (follows voiceover) is on */}
                  {subtitleMode === "subtitle" && (
                    <section className="rounded-md border border-border bg-card overflow-hidden">
                      <div className="shrink-0 px-3 py-2 border-b border-border bg-card/80">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">How subtitles look</span>
                      </div>
                      <div className="p-3 space-y-3">
                        <div className="space-y-2">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider block">Words at a time</Label>
                          <div className="flex flex-wrap gap-1.5">
                            {(["instagram", "custom"] as const).map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setWordByWordCount(opt)}
                                className={cn(
                                  "px-2.5 py-1 rounded text-[11px] border transition-colors",
                                  wordByWordCount === opt ? "bg-primary/10 text-primary border-primary/40" : "border-border text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                )}
                              >
                                {opt === "instagram" ? "Instagram Style" : "Custom"}
                              </button>
                            ))}
                          </div>
                          {wordByWordCount === "custom" && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Word limit (1–50)</Label>
                                <span className="text-[11px] tabular-nums text-muted-foreground">{wordByWordCustomLimit}</span>
                              </div>
                              <input
                                type="range"
                                min={1}
                                max={50}
                                step={1}
                                value={wordByWordCustomLimit}
                                onChange={(e) => setWordByWordCustomLimit(Number(e.target.value))}
                                className="flex-1 h-2.5 w-full rounded-full appearance-none bg-input accent-primary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-0"
                                aria-valuemin={1}
                                aria-valuemax={50}
                                aria-valuenow={wordByWordCustomLimit}
                                aria-label="Word limit"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-foreground">Karaoke Style</span>
                          <Switch checked={karaokeStyle} onCheckedChange={setKaraokeStyle} className="scale-75 origin-right" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-foreground">Highlight Words</span>
                          <Switch
                            checked={highlightWords === "current-word"}
                            onCheckedChange={(checked) => setHighlightWords(checked ? "current-word" : "off")}
                            className="scale-75 origin-right"
                          />
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Position Setting */}
                  <section className="rounded-md border border-border bg-card overflow-hidden">
                    <div className="shrink-0 px-3 py-2 border-b border-border bg-card/80">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Position Setting</span>
                    </div>
                    <div className="p-3 space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(
                          [
                            { value: "top-left" as const, label: "Top left" },
                            { value: "top-center" as const, label: "Top center" },
                            { value: "top-right" as const, label: "Top right" },
                            { value: "center-left" as const, label: "Center left" },
                            { value: "center" as const, label: "Center" },
                            { value: "center-right" as const, label: "Center right" },
                            { value: "bottom-left" as const, label: "Bottom left" },
                            { value: "bottom-center" as const, label: "Bottom center" },
                            { value: "bottom-right" as const, label: "Bottom right" },
                            { value: "custom" as const, label: "Custom" },
                          ] as const
                        ).map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setPosition(value)}
                            className={cn(
                              "px-2.5 py-1 rounded text-[11px] font-medium border transition-colors",
                              position === value ? "bg-primary/10 text-primary border-primary/40" : "border-border text-muted-foreground hover:bg-white/5 hover:text-foreground"
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {position === "custom" && (
                        <div className="pt-3 border-t border-border space-y-3">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Custom position</span>
                          {/* Single line: X and Y together on one 2D pad (horizontal = X, vertical = Y) */}
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground block">Position (X, Y)</Label>
                            <div
                              ref={xyPadRef}
                              role="slider"
                              aria-valuenow={posX}
                              aria-valuetext={`X ${posX}, Y ${posY}`}
                              tabIndex={0}
                              className="relative w-full h-20 rounded-lg border border-border bg-input/30 cursor-crosshair touch-none"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleXYPad(e.clientX, e.clientY);
                                const onMove = (e2: MouseEvent) => handleXYPad(e2.clientX, e2.clientY);
                                const onUp = () => {
                                  window.removeEventListener("mousemove", onMove);
                                  window.removeEventListener("mouseup", onUp);
                                };
                                window.addEventListener("mousemove", onMove);
                                window.addEventListener("mouseup", onUp);
                              }}
                              onTouchStart={(e) => {
                                const t = e.touches[0];
                                if (t) handleXYPad(t.clientX, t.clientY);
                              }}
                              onTouchMove={(e) => {
                                e.preventDefault();
                                const t = e.touches[0];
                                if (t) handleXYPad(t.clientX, t.clientY);
                              }}
                              onKeyDown={(e) => {
                                const step = e.shiftKey ? 100 : 20;
                                if (e.key === "ArrowLeft") setPosX((x) => Math.max(0, x - step));
                                else if (e.key === "ArrowRight") setPosX((x) => Math.min(1920, x + step));
                                else if (e.key === "ArrowUp") setPosY((y) => Math.max(0, y - step));
                                else if (e.key === "ArrowDown") setPosY((y) => Math.min(2160, y + step));
                              }}
                            >
                              <div
                                className="absolute w-2.5 h-2.5 rounded-full bg-primary border-2 border-primary-foreground pointer-events-none"
                                style={{
                                  left: `${(posX / 1920) * 100}%`,
                                  top: `${(posY / 2160) * 100}%`,
                                  transform: "translate(-50%, -50%)",
                                }}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground">X {posX} · Y {posY}</p>
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
                                aria-label="Width"
                              />
                              <span className="text-xs text-muted-foreground tabular-nums w-8">1920</span>
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
                      )}
                    </div>
                  </section>

                  {/* Animation – same tag layout as Position Setting */}
                  <section className="rounded-md border border-border bg-card overflow-hidden">
                    <div className="shrink-0 px-3 py-2 border-b border-border bg-card/80">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Animation</span>
                    </div>
                    <div className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(["none", "fade", "pop", "slide", "random"] as const).map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setAnimationType(value)}
                            className={cn(
                              "px-2.5 py-1 rounded text-[11px] font-medium border transition-colors",
                              animationType === value ? "bg-primary/10 text-primary border-primary/40" : "border-border text-muted-foreground hover:bg-white/5 hover:text-foreground"
                            )}
                          >
                            {value.charAt(0).toUpperCase() + value.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Typography — first column; hidden when Custom is selected (then use right column Custom style panel) */}
                  {selectedClassicStyle !== "Custom" && (
                    <section className="rounded-md border border-border bg-card overflow-hidden">
                      <div className="shrink-0 px-3 py-2 border-b border-border bg-card/80">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Typography</span>
                      </div>
                      <div className="p-3 space-y-3">
                        <div>
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">Color</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={subtitleColor}
                              onChange={(e) => setSubtitleColor(e.target.value)}
                              className="h-9 w-14 rounded border border-border bg-background/50 cursor-pointer"
                              aria-label="Text color"
                            />
                            <Input
                              type="text"
                              value={subtitleColor}
                              onChange={(e) => setSubtitleColor(e.target.value)}
                              className="h-8 flex-1 text-[12px] font-mono"
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>
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
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-[10px] text-muted-foreground block mb-1.5">Font Size (8–180)</Label>
                            <span className="text-[11px] tabular-nums text-muted-foreground">{fontSize}</span>
                          </div>
                          <input
                            type="range"
                            min={8}
                            max={180}
                            step={1}
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            className="flex-1 h-2.5 w-full rounded-full appearance-none bg-input accent-primary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-0"
                            aria-valuemin={8}
                            aria-valuemax={180}
                            aria-valuenow={fontSize}
                            aria-label="Font size"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[10px] text-muted-foreground block mb-1.5">Line Height</Label>
                            <Input type="number" min={0.5} max={5} step={0.1} value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value) || 1)} className="h-8 text-xs" />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground block mb-1.5">Letter Spacing</Label>
                            <Input type="number" value={letterSpacing} onChange={(e) => setLetterSpacing(Number(e.target.value) || 0)} className="h-8 text-xs" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-[10px] font-medium text-muted-foreground block mb-1.5">Text Case</Label>
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
                </>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* Subtitle Styles: Cinematic + Classic merged, full second column */}
              {isSubtitleOrCaption && (
                <section className="rounded-md border border-border bg-card overflow-hidden flex flex-col min-h-0">
                  <div className="shrink-0 px-3 py-2 border-b border-border bg-card/80 flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Subtitle Styles</span>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-4">
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClassicStyle("Custom");
                          setSelectedCinematicStyle(null);
                        }}
                        className={cn(
                          "w-full rounded-lg border-2 py-2 text-center text-[13px] font-medium transition-all",
                          selectedClassicStyle === "Custom"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background/30 text-foreground hover:border-primary/50 hover:bg-white/5"
                        )}
                      >
                        Custom
                      </button>
                    </div>
                    {selectedClassicStyle === "Custom" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClassicStyle(null);
                          setSelectedCinematicStyle(null);
                        }}
                        className="w-full rounded-lg border border-dashed border-border py-2 text-center text-[12px] text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-white/5 transition-colors"
                      >
                        Choose preset style
                      </button>
                    )}
                    {selectedClassicStyle !== "Custom" && (
                      <>
                        <div>
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Cinematic</span>
                          <div className="grid grid-cols-2 gap-2">
                            {CINEMATIC_STYLES.map((name) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => {
                                  setSelectedCinematicStyle(selectedCinematicStyle === name ? null : name);
                                  if (selectedCinematicStyle !== name) setSelectedClassicStyle(null);
                                }}
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
                        <div>
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Classic</span>
                          <div className="grid grid-cols-2 gap-2">
                            {CLASSIC_STYLES.map((name) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => {
                                  setSelectedClassicStyle(name);
                                  setSelectedCinematicStyle(null);
                                }}
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
                      </>
                    )}
                  </div>
                </section>
              )}

              {/* Custom style panel — only when Custom is selected (typography for Custom lives here) */}
              {isSubtitleOrCaption && selectedClassicStyle === "Custom" && (
                <section className="rounded-md border border-border bg-card overflow-hidden">
                  <div className="shrink-0 px-3 py-2 border-b border-border bg-card/80">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Custom style</span>
                  </div>
                  <div className="p-3 space-y-3">
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={subtitleColor}
                          onChange={(e) => setSubtitleColor(e.target.value)}
                          className="h-9 w-14 rounded border border-border bg-background/50 cursor-pointer"
                          aria-label="Text color"
                        />
                        <Input
                          type="text"
                          value={subtitleColor}
                          onChange={(e) => setSubtitleColor(e.target.value)}
                          className="h-8 flex-1 text-[12px] font-mono"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
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
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] text-muted-foreground block mb-1.5">Font Size (8–180)</Label>
                        <span className="text-[11px] tabular-nums text-muted-foreground">{fontSize}</span>
                      </div>
                      <input
                        type="range"
                        min={8}
                        max={180}
                        step={1}
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="flex-1 h-2.5 w-full rounded-full appearance-none bg-input accent-primary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-0"
                        aria-valuemin={8}
                        aria-valuemax={180}
                        aria-valuenow={fontSize}
                        aria-label="Font size"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] text-muted-foreground block mb-1.5">Line Height</Label>
                        <Input type="number" min={0.5} max={5} step={0.1} value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value) || 1)} className="h-8 text-xs" />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground block mb-1.5">Letter Spacing</Label>
                        <Input type="number" value={letterSpacing} onChange={(e) => setLetterSpacing(Number(e.target.value) || 0)} className="h-8 text-xs" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] font-medium text-muted-foreground block mb-1.5">Text Case</Label>
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
                    Choose Subtitle (synced to voiceover) or Caption (static line) to see a live preview.
                  </div>
                ) : (
                  <div className="w-full h-full relative flex flex-col bg-neutral-950">
                    {position === "custom" ? (
                      <div
                        className="absolute px-3 py-1.5 text-center"
                        style={{
                          left: `${(posX / 1920) * 100}%`,
                          top: `${(posY / 2160) * 100}%`,
                          width: `${(width / 1920) * 100}%`,
                          minHeight: `${(height / 2160) * 100}%`,
                          fontFamily,
                          fontWeight: FONT_WEIGHT_MAP[fontWeight] ?? 700,
                          fontSize: `${previewFontSize}px`,
                          lineHeight: lineHeight,
                          letterSpacing: `${letterSpacing}px`,
                          textTransform: TEXT_CASE_MAP[textCase] ?? "none",
                          transform: `rotate(${rotation}deg)`,
                          color: subtitleColor,
                          ...(strokeEnabled && { WebkitTextStroke: `${strokeWidth}px ${strokeColor}` }),
                          ...(shadowEnabled && { textShadow: `0 ${shadowOffsetY}px ${shadowBlur}px rgba(0,0,0,${shadowOpacity})` }),
                        }}
                      >
                        <span className={shadowEnabled ? undefined : "drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"}>
                          {PREVIEW_SAMPLE}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "w-full h-full flex flex-col",
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
                            color: subtitleColor,
                            ...(strokeEnabled && { WebkitTextStroke: `${strokeWidth}px ${strokeColor}` }),
                            ...(shadowEnabled && { textShadow: `0 ${shadowOffsetY}px ${shadowBlur}px rgba(0,0,0,${shadowOpacity})` }),
                          }}
                        >
                          <span className={shadowEnabled ? undefined : "drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"}>
                            {PREVIEW_SAMPLE}
                          </span>
                        </div>
                      </div>
                    )}
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
          {subtitleMode === "off" ? "Text off" : `${subtitleMode === "subtitle" ? "Subtitle (voiceover)" : "Caption (static)"} · ${selectedClassicStyle ?? "No style"}`}
        </span>
        <Button size="sm" className="h-7 text-xs px-4" asChild>
          <Link to="/playground/audio">Continue to Audio</Link>
        </Button>
      </div>
    </div>
  );
}
