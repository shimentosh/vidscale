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
  status?: "done" | "processing" | "queue" | "failed";
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

/** Demo outputs: 4 items total — 1 processing, 3 complete. Mix of single (no runId) and bulk (same runId). */
export function getDemoOutputs(): WorkflowOutput[] {
  const now = new Date().toISOString();
  const demoId = "demo-workflow-vidscale";
  const script = "Demo script for this output. You can preview script and voice over from the card.";
  const sampleVoice = "https://download.samplelib.com/mp3/sample-6s.mp3";

  return [
    // Single outputs (each appears as its own run/card on Output page)
    { id: "out-demo-1", workflowId: demoId, workflowName: "Demo Workflow", type: "video", name: "Story_15s_clip.mp4", durationSeconds: 15, sizeBytes: 3_000_000, createdAt: now, script, voiceOverUrl: sampleVoice, aspectRatio: "9:16", status: "done" },
    { id: "out-demo-2", workflowId: demoId, workflowName: "Demo Workflow", type: "video", name: "Single_export_1080p.mp4", durationSeconds: 65, sizeBytes: 18_500_000, createdAt: now, script, voiceOverUrl: sampleVoice, aspectRatio: "16:9", status: "done" },
    // Bulk run (2 items = one run/card on Output page: 1 done, 1 processing)
    { id: "out-demo-3", workflowId: demoId, workflowName: "Demo Workflow", type: "video", name: "Intro_16x9_export.mp4", durationSeconds: 42, sizeBytes: 12_400_000, createdAt: now, runId: "run-demo-bulk", script, voiceOverUrl: sampleVoice, aspectRatio: "16:9", status: "done" },
    { id: "out-demo-4", workflowId: demoId, workflowName: "Demo Workflow", type: "video", name: "Batch_processing.mp4", durationSeconds: 30, sizeBytes: 8_000_000, createdAt: now, runId: "run-demo-bulk", script, voiceOverUrl: sampleVoice, aspectRatio: "16:9", status: "processing" },
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

const DEMO_ID_PREFIX = "out-demo";

function isDemoOutputId(id: string): boolean {
  return id.startsWith(DEMO_ID_PREFIX);
}

export function getOutputs(): WorkflowOutput[] {
  let list = loadOutputs();
  const demo = getDemoOutputs();

  if (list.length === 0) {
    list = [...demo];
    saveOutputs(list);
  } else {
    const allStoredAreDemo = list.every((o) => isDemoOutputId(o.id));
    if (allStoredAreDemo) {
      list = [...demo];
      saveOutputs(list);
    } else {
      const withoutDemo = list.filter((o) => !isDemoOutputId(o.id));
      const existingIds = new Set(withoutDemo.map((o) => o.id));
      list = [...withoutDemo];
      for (const d of demo) {
        if (!existingIds.has(d.id)) {
          list.push(d);
          existingIds.add(d.id);
        }
      }
      saveOutputs(list);
      list = mergeDemoScriptAndVoiceOver(list);
    }
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

/** Primary output type for the run (for filtering: video, image, etc.) */
export function getRunOutputType(run: WorkflowRun): OutputType {
  const types = run.items.map((i) => i.type);
  if (types.some((t) => t === "video")) return "video";
  if (types.some((t) => t === "image")) return "image";
  if (types.some((t) => t === "audio")) return "audio";
  return run.items[0]?.type ?? "file";
}

/** Run status: failed if any item failed, else processing if any in progress, else done */
export function getRunStatus(run: WorkflowRun): "done" | "processing" | "failed" {
  if (run.items.some((i) => i.status === "failed")) return "failed";
  const inProgress = run.items.some(
    (i) => i.status === "processing" || i.status === "queue"
  );
  return inProgress ? "processing" : "done";
}

/** Progress for processing runs: done count and total (for "04/33 processing" label) */
export function getRunProgress(run: WorkflowRun): { done: number; total: number } {
  const total = run.items.length;
  const done = run.items.filter(
    (i) => !i.status || i.status === "done"
  ).length;
  return { done, total };
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
export function getOutputStats(groups: WorkflowOutputGroup[]): { successfulRuns: number; inProgress: number; failedRuns: number } {
  let successfulRuns = 0;
  let failedRuns = 0;
  for (const g of groups) {
    for (const run of g.runs) {
      const hasFailed = run.items.some((i) => i.status === "failed");
      if (hasFailed) failedRuns += 1;
      else successfulRuns += 1;
    }
  }
  const activity = getActivityCounts();
  const inProgress = activity.processing + activity.queue + activity.rendering;
  return { successfulRuns, inProgress, failedRuns };
}
