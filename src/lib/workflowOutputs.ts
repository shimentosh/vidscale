const STORAGE_KEY = "vidscale-workflow-outputs";

export type OutputType = "video" | "image" | "audio" | "file";

export type WorkflowOutput = {
  id: string;
  workflowId: string;
  workflowName: string;
  type: OutputType;
  name: string;
  /** URL or path (blob URL, file path, or placeholder) */
  url?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  sizeBytes?: number;
  createdAt: string;
  /** Optional run/batch id for grouping bulk outputs */
  runId?: string;
  /** Script text for this output (e.g. narration) */
  script?: string;
  /** Voice-over / narration audio URL for playback */
  voiceOverUrl?: string;
  /** Display aspect ratio e.g. "16:9", "9:16", "1:1" */
  aspectRatio?: string;
  /** Output status for display on cards */
  status?: "done" | "processing" | "queue";
};

function loadOutputs(): WorkflowOutput[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WorkflowOutput[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveOutputs(outputs: WorkflowOutput[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(outputs));
}

/** Demo outputs: mix of bulk runs (same runId) and single outputs */
export function getDemoOutputs(): WorkflowOutput[] {
  const now = new Date().toISOString();
  const demoId = "demo-workflow-vidscale";
  const topicId = "topic-to-video-workflow";
  const scriptIntro = "Welcome to this video. In the next few minutes we'll cover the key points you need to know. Let's get started with a quick overview of the topic.";
  const scriptTopic = "Topic to video: turn your ideas into engaging content. This batch export includes multiple segments. Use the script and voice over together for consistency.";
  const scriptSingle = "Single export in 1080p. This is the full narration script for the video. You can read along while the voice over plays, or use it for subtitles and editing.";
  const scriptBatch = "Batch video from Topic to Video workflow. Each segment has its own script and optional voice over. Export and locate files in the workflow output folder.";
  const sampleVoice = "https://download.samplelib.com/mp3/sample-6s.mp3";
  return [
    { id: "out-demo-1", workflowId: demoId, workflowName: "Demo Workflow", type: "video", name: "Intro_16x9_export.mp4", durationSeconds: 42, sizeBytes: 12_400_000, createdAt: now, runId: "run-1", script: scriptIntro, voiceOverUrl: sampleVoice, aspectRatio: "16:9", status: "done" },
    { id: "out-demo-2", workflowId: demoId, workflowName: "Demo Workflow", type: "video", name: "Topic_to_Video_batch_01.mp4", durationSeconds: 28, sizeBytes: 8_200_000, createdAt: now, runId: "run-1", script: scriptTopic, voiceOverUrl: sampleVoice, aspectRatio: "16:9", status: "processing" },
    { id: "out-demo-3", workflowId: demoId, workflowName: "Demo Workflow", type: "image", name: "thumbnail_frame_001.png", sizeBytes: 340_000, createdAt: now, runId: "run-1", script: "Thumbnail frame for the intro video.", aspectRatio: "16:9", status: "queue" },
    { id: "out-demo-4", workflowId: demoId, workflowName: "Demo Workflow", type: "video", name: "Single_export_1080p.mp4", durationSeconds: 65, sizeBytes: 18_500_000, createdAt: now, script: scriptSingle, voiceOverUrl: sampleVoice, aspectRatio: "16:9" },
    { id: "out-demo-5", workflowId: demoId, workflowName: "Demo Workflow", type: "image", name: "cover_art.png", sizeBytes: 120_000, createdAt: now, script: "Cover art for the project.", aspectRatio: "1:1" },
    { id: "out-demo-6", workflowId: topicId, workflowName: "Topic to Video", type: "video", name: "batch_01_video.mp4", durationSeconds: 35, sizeBytes: 9_100_000, createdAt: now, runId: "run-bulk-1", script: scriptBatch, voiceOverUrl: sampleVoice, aspectRatio: "9:16" },
    { id: "out-demo-7", workflowId: topicId, workflowName: "Topic to Video", type: "video", name: "batch_02_video.mp4", durationSeconds: 38, sizeBytes: 10_200_000, createdAt: now, runId: "run-bulk-1", script: scriptBatch, voiceOverUrl: sampleVoice, aspectRatio: "9:16" },
    { id: "out-demo-8", workflowId: topicId, workflowName: "Topic to Video", type: "image", name: "batch_01_thumb.png", sizeBytes: 88_000, createdAt: now, runId: "run-bulk-1", script: "Thumbnail for batch 01.", aspectRatio: "9:16" },
  ];
}

/** Merge script/voiceOverUrl/aspectRatio from demo into stored outputs so icons and aspect ratio show for demo data */
function mergeDemoScriptAndVoiceOver(list: WorkflowOutput[]): WorkflowOutput[] {
  const demo = getDemoOutputs();
  const byId = new Map(demo.map((d) => [d.id, { script: d.script, voiceOverUrl: d.voiceOverUrl, aspectRatio: d.aspectRatio, status: d.status }]));
  let changed = false;
  const out = list.map((item) => {
    const demoFields = byId.get(item.id);
    if (!demoFields) return item;
    const hasScript = item.script != null && String(item.script).trim().length > 0;
    const hasVoice = item.voiceOverUrl != null && String(item.voiceOverUrl).trim().length > 0;
    const hasAspect = item.aspectRatio != null && String(item.aspectRatio).trim().length > 0;
    const hasStatus = item.status != null;
    if (hasScript && hasVoice && hasAspect && hasStatus) return item;
    changed = true;
    return {
      ...item,
      script: hasScript ? item.script : demoFields.script,
      voiceOverUrl: hasVoice ? item.voiceOverUrl : demoFields.voiceOverUrl,
      aspectRatio: hasAspect ? item.aspectRatio : demoFields.aspectRatio,
      status: hasStatus ? item.status : demoFields.status,
    };
  });
  if (changed) saveOutputs(out);
  return out;
}

export function getOutputs(): WorkflowOutput[] {
  let list = loadOutputs();
  if (list.length === 0) {
    list = getDemoOutputs();
    saveOutputs(list);
  } else {
    list = mergeDemoScriptAndVoiceOver(list);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOutputById(id: string): WorkflowOutput | null {
  return getOutputs().find((o) => o.id === id) ?? null;
}

export function addOutput(output: Omit<WorkflowOutput, "id" | "createdAt">): WorkflowOutput {
  const list = loadOutputs();
  const now = new Date().toISOString();
  const item: WorkflowOutput = { ...output, id: crypto.randomUUID(), createdAt: now };
  list.unshift(item);
  saveOutputs(list);
  return item;
}

export function deleteOutput(id: string): boolean {
  const list = loadOutputs().filter((o) => o.id !== id);
  if (list.length === loadOutputs().length) return false;
  saveOutputs(list);
  return true;
}

/** Delete multiple outputs by id (one save) */
export function deleteOutputs(ids: string[]): number {
  const set = new Set(ids);
  const list = loadOutputs().filter((o) => !set.has(o.id));
  const removed = loadOutputs().length - list.length;
  if (removed > 0) saveOutputs(list);
  return removed;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

/** Group outputs by workflow, then by run (runId = bulk, no runId = single) */
export type WorkflowRun = {
  runId: string | null;
  label: string;
  items: WorkflowOutput[];
};

export type WorkflowOutputGroup = {
  workflowId: string;
  workflowName: string;
  runs: WorkflowRun[];
};

export function getOutputsGroupedByWorkflow(): WorkflowOutputGroup[] {
  const list = getOutputs();
  const byWorkflow = new Map<string, WorkflowOutput[]>();
  for (const out of list) {
    const arr = byWorkflow.get(out.workflowId) ?? [];
    arr.push(out);
    byWorkflow.set(out.workflowId, arr);
  }
  const result: WorkflowOutputGroup[] = [];
  byWorkflow.forEach((items, workflowId) => {
    const workflowName = items[0]?.workflowName ?? "Unknown";
    const byRun = new Map<string, WorkflowOutput[]>();
    for (const out of items) {
      const key = out.runId ?? "single-" + out.id;
      const runItems = byRun.get(key) ?? [];
      runItems.push(out);
      byRun.set(key, runItems);
    }
    const runs: WorkflowRun[] = [];
    byRun.forEach((runItems, runId) => {
      const isBulk = runId.startsWith("single-") ? false : runItems.length > 1;
      const label = isBulk
        ? `Bulk generation · ${runItems.length} items`
        : runItems.length === 1
          ? "Single output"
          : `${runItems.length} items`;
      runs.push({ runId: runId.startsWith("single-") ? null : runId, label, items: runItems });
    });
    runs.sort((a, b) => (b.items[0]?.createdAt ?? "").localeCompare(a.items[0]?.createdAt ?? ""));
    result.push({ workflowId, workflowName, runs });
  });
  result.sort((a, b) => {
    const aTime = a.runs[0]?.items[0]?.createdAt ?? "";
    const bTime = b.runs[0]?.items[0]?.createdAt ?? "";
    return bTime.localeCompare(aTime);
  });
  return result;
}

/** Run key for URL: runId or "single-{outputId}" for single outputs */
export function getRunKey(run: WorkflowRun): string {
  return run.runId ?? (run.items[0] ? `single-${run.items[0].id}` : "");
}

/** Find workflow group and run by workflowId and runKey (for view page) */
export function getRunByWorkflowAndKey(
  workflowId: string,
  runKey: string
): { workflowName: string; run: WorkflowRun } | null {
  const groups = getOutputsGroupedByWorkflow();
  const group = groups.find((g) => g.workflowId === workflowId);
  if (!group) return null;
  const run = group.runs.find((r) => getRunKey(r) === runKey);
  if (!run) return null;
  return { workflowName: group.workflowName, run };
}

/** Mother output folder: all workflow exports go under this, then one folder per workflow */
const OUTPUT_BASE_PATH_KEY = "vidscale-output-base-path";
const DEFAULT_OUTPUT_BASE_PATH = "VidScale Outputs";

export function getOutputBasePath(): string {
  try {
    const v = localStorage.getItem(OUTPUT_BASE_PATH_KEY);
    return (v && v.trim()) || DEFAULT_OUTPUT_BASE_PATH;
  } catch {
    return DEFAULT_OUTPUT_BASE_PATH;
  }
}

export function setOutputBasePath(path: string): void {
  localStorage.setItem(OUTPUT_BASE_PATH_KEY, path.trim() || DEFAULT_OUTPUT_BASE_PATH);
}

function sanitizeFolderName(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, "_").trim() || "Outputs";
}

/** Full path to this workflow's output folder: basePath / workflowName */
export function getWorkflowOutputFolderPath(workflowName: string): string {
  const base = getOutputBasePath();
  const segment = sanitizeFolderName(workflowName);
  return base.endsWith("/") || base.endsWith("\\") ? `${base}${segment}` : `${base}/${segment}`;
}

/** Activity counts: processing, queue, rendering (for stats and Activity card) */
const ACTIVITY_STORAGE_KEY = "vidscale-output-activity";

export type OutputActivity = {
  processing: number;
  queue: number;
  rendering: number;
};

const DEFAULT_ACTIVITY: OutputActivity = { processing: 1, queue: 2, rendering: 0 };

function loadActivity(): OutputActivity {
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (!raw) return DEFAULT_ACTIVITY;
    const parsed = JSON.parse(raw) as OutputActivity;
    return {
      processing: Math.max(0, Number(parsed.processing) || 0),
      queue: Math.max(0, Number(parsed.queue) || 0),
      rendering: Math.max(0, Number(parsed.rendering) || 0),
    };
  } catch {
    return DEFAULT_ACTIVITY;
  }
}

export function getActivityCounts(): OutputActivity {
  return loadActivity();
}

export function setActivityCounts(counts: Partial<OutputActivity>): void {
  const prev = loadActivity();
  const next: OutputActivity = {
    processing: Math.max(0, counts.processing ?? prev.processing),
    queue: Math.max(0, counts.queue ?? prev.queue),
    rendering: Math.max(0, counts.rendering ?? prev.rendering),
  };
  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(next));
}

/** Stats derived from groups and activity: successful runs count, in-progress count */
export function getOutputStats(groups: WorkflowOutputGroup[]): { successfulRuns: number; inProgress: number } {
  const successfulRuns = groups.reduce((sum, g) => sum + g.runs.length, 0);
  const activity = getActivityCounts();
  const inProgress = activity.processing + activity.queue + activity.rendering;
  return { successfulRuns, inProgress };
}
