const STORAGE_KEY = "vidscale-workflows";

export const DEMO_WORKFLOW_ID = "demo-workflow-vidscale";

export type AspectRatioOption = "16:9" | "9:16" | "1:1" | "4:3";

/** Serializable node for storage (matches React Flow node shape) */
export type StoredNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
};

/** Serializable edge for storage */
export type StoredEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
};

export type Workflow = {
  id: string;
  name: string;
  aspectRatio: AspectRatioOption;
  templateId?: string;
  nodes: StoredNode[];
  edges: StoredEdge[];
  createdAt: string;
  updatedAt: string;
};

function getDemoWorkflow(): Workflow {
  const now = new Date().toISOString();
  const nodes: StoredNode[] = [
    { id: "node-topic-demo", type: "module", position: { x: 80, y: 80 }, data: { label: "Topic", description: "Define topics or headlines for your video.", moduleType: "topic", settings: {} } },
    { id: "node-voice-demo", type: "module", position: { x: 360, y: 80 }, data: { label: "Voice Overs", description: "Generate voiceover from script with AI voices.", moduleType: "voice-overs", settings: { voiceId: "rachel", speed: 1 } } },
    { id: "node-export-demo", type: "module", position: { x: 640, y: 80 }, data: { label: "Export", description: "Export your final video.", moduleType: "export", settings: {} } },
  ];
  const edges: StoredEdge[] = [
    { id: "e-topic-voice", source: "node-topic-demo", target: "node-voice-demo" },
    { id: "e-voice-export", source: "node-voice-demo", target: "node-export-demo" },
  ];
  return { id: DEMO_WORKFLOW_ID, name: "Demo Workflow", aspectRatio: "16:9", templateId: "topic-to-video", nodes, edges, createdAt: now, updatedAt: now };
}

function loadWorkflows(): Workflow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Workflow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWorkflows(workflows: Workflow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
}

export function getWorkflows(): Workflow[] {
  let list = loadWorkflows();
  const hasDemo = list.some((w) => w.id === DEMO_WORKFLOW_ID);
  if (!hasDemo) {
    list = [getDemoWorkflow(), ...list];
    saveWorkflows(list);
  }
  return list.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getWorkflowById(id: string): Workflow | null {
  return getWorkflows().find((w) => w.id === id) ?? null;
}

export function createWorkflow(input: {
  name: string;
  aspectRatio: AspectRatioOption;
  templateId?: string;
}): Workflow {
  const list = loadWorkflows();
  const now = new Date().toISOString();
  const workflow: Workflow = {
    id: crypto.randomUUID(),
    name: input.name.trim() || "Untitled Workflow",
    aspectRatio: input.aspectRatio,
    templateId: input.templateId,
    nodes: [],
    edges: [],
    createdAt: now,
    updatedAt: now,
  };
  list.push(workflow);
  saveWorkflows(list);
  return workflow;
}

export function updateWorkflow(
  id: string,
  input: {
    name?: string;
    aspectRatio?: AspectRatioOption;
    templateId?: string;
    nodes?: StoredNode[];
    edges?: StoredEdge[];
  }
): Workflow | null {
  const list = loadWorkflows();
  const index = list.findIndex((w) => w.id === id);
  if (index === -1) return null;
  const now = new Date().toISOString();
  list[index] = {
    ...list[index],
    ...(input.name !== undefined && { name: input.name.trim() || "Untitled Workflow" }),
    ...(input.aspectRatio !== undefined && { aspectRatio: input.aspectRatio }),
    ...(input.templateId !== undefined && { templateId: input.templateId }),
    ...(input.nodes !== undefined && { nodes: input.nodes }),
    ...(input.edges !== undefined && { edges: input.edges }),
    updatedAt: now,
  };
  saveWorkflows(list);
  return list[index];
}

export function deleteWorkflow(id: string): boolean {
  const list = loadWorkflows();
  const filtered = list.filter((w) => w.id !== id);
  if (filtered.length === list.length) return false;
  saveWorkflows(filtered);
  return true;
}
