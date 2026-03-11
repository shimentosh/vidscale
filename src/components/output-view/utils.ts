import type { WorkflowOutput, OutputType } from "@/lib/workflowOutputs";
import { formatSize as fs, formatDuration as fd } from "@/lib/workflowOutputs";
import { FileVideo, ImageIcon, Music, FileIcon } from "lucide-react";

export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? "minute" : "minutes"} ago`;
  if (diffHr < 24) return `${diffHr} ${diffHr === 1 ? "hour" : "hours"} ago`;
  if (diffDay === 1) return "1 day ago";
  if (diffDay < 7) return `${diffDay} days ago`;
  return formatDate(iso);
}

export function outputIcon(type: OutputType) {
  switch (type) {
    case "video":
      return FileVideo;
    case "image":
      return ImageIcon;
    case "audio":
      return Music;
    default:
      return FileIcon;
  }
}

export function openOutput(out: WorkflowOutput) {
  if (out.url) window.open(out.url, "_blank");
}

export const formatSize = fs;
export const formatDuration = fd;

export function folderPathToFileUrl(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return "";
  const normalized = trimmed.replace(/\\/g, "/");
  if (/^[a-zA-Z]:\//.test(normalized)) {
    return "file:///" + encodeURI(normalized).replace(/#/g, "%23").replace(/%5C/g, "/");
  }
  if (normalized.startsWith("/")) {
    return "file://" + encodeURI(normalized).replace(/#/g, "%23");
  }
  return "";
}
