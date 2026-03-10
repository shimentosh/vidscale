import {
  Lightbulb,
  FileText,
  Mic,
  Film,
  Layout,
  Type,
  Music,
  Palette,
  Download,
  type LucideIcon,
} from "lucide-react";

export type PlaygroundModule = {
  step: number;
  path: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

/**
 * Single source of truth for playground steps / workflow modules.
 * Used by PlaygroundLayout (steps nav) and WorkflowPage (module library).
 */
export const PLAYGROUND_MODULES: PlaygroundModule[] = [
  { step: 1, path: "topic", label: "Topic", description: "Define topics or headlines for your video. Import or generate with AI.", icon: Lightbulb },
  { step: 2, path: "script-writing", label: "Script Writing", description: "Write or generate the script from your topic.", icon: FileText },
  { step: 3, path: "voice-overs", label: "Voice Overs", description: "Generate voiceover from script with AI voices.", icon: Mic },
  { step: 4, path: "media-library", label: "Media Library", description: "Load stock footage and images for your video.", icon: Film },
  { step: 5, path: "overlays", label: "Overlays", description: "Add overlays and visual elements.", icon: Layout },
  { step: 6, path: "subtitle", label: "Subtitle", description: "Add subtitles and captions to the video.", icon: Type },
  { step: 7, path: "audio", label: "Audio", description: "Add or mix background music and audio.", icon: Music },
  { step: 8, path: "brand-kit", label: "Brand Kit", description: "Apply brand kit (logo, colors, CTA) to the export.", icon: Palette },
  { step: 9, path: "export", label: "Export", description: "Export the final video file.", icon: Download },
];

/** For PlaygroundLayout: step, path, label only */
export function getPlaygroundSteps() {
  return PLAYGROUND_MODULES.map(({ step, path, label }) => ({ step, path, label }));
}
