import { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Connection,
  type Node,
  type Edge,
  Handle,
  Position,
  Background,
  Controls,
  MiniMap,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  FileText,
  GripVertical,
  Plus,
  LayoutGrid,
  List,
  ArrowLeft,
  Save,
  X,
  Sparkles,
  MoreVertical,
  Workflow as WorkflowIcon,
  Monitor,
  Smartphone,
  Square,
  Crop,
  ImageIcon,
  FolderOutput,
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PLAYGROUND_MODULES } from "@/lib/playgroundModules";
import { NodeSettingsPanel } from "@/components/workflow/NodeSettingsPanel";
import {
  getWorkflows,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  DEMO_WORKFLOW_ID,
  type Workflow,
  type AspectRatioOption,
  type StoredNode,
} from "@/lib/workflows";

type ModuleData = {
  label: string;
  description: string;
  moduleType: string;
  settings?: Record<string, unknown>;
};

const ASPECT_RATIO_OPTIONS: {
  value: AspectRatioOption;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  aspectClass: string;
}[] = [
  { value: "9:16", label: "Portrait", sublabel: "9:16", icon: <Smartphone size={20} className="text-muted-foreground shrink-0" />, aspectClass: "aspect-[9/16]" },
  { value: "1:1", label: "Square", sublabel: "1:1", icon: <Square size={20} className="text-muted-foreground shrink-0" />, aspectClass: "aspect-square" },
  { value: "16:9", label: "Landscape", sublabel: "16:9", icon: <Monitor size={20} className="text-muted-foreground shrink-0" />, aspectClass: "aspect-video" },
  { value: "4:3", label: "4:3", sublabel: "4:3", icon: <Crop size={20} className="text-muted-foreground shrink-0" />, aspectClass: "aspect-[4/3]" },
];

const WORKFLOW_TEMPLATES: { id: string; title: string; category: string; aspect: "tall" | "wide" | "square" }[] = [
  { id: "blank", title: "Blank", category: "Starter", aspect: "wide" },
  { id: "topic-to-video", title: "Topic to Video", category: "Workflows", aspect: "wide" },
  { id: "script-to-video", title: "Script to Video", category: "Workflows", aspect: "wide" },
  { id: "voiceover-to-video", title: "Voiceover to Video", category: "Workflows", aspect: "wide" },
];

function templateAspectLabel(aspect: "tall" | "wide" | "square"): string {
  return aspect === "tall" ? "3:4" : aspect === "wide" ? "4:3" : "1:1";
}

function formatTimeAgo(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const sec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function ModuleNode({ id, data, selected }: NodeProps<Node<ModuleData>>) {
  const Icon = PLAYGROUND_MODULES.find((m) => m.path === data.moduleType)?.icon ?? FileText;
  const { setNodes } = useReactFlow<Node<ModuleData>, Edge>();

  const handleSettingsChange = useCallback(
    (newSettings: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, settings: newSettings } } : n
        )
      );
    },
    [id, setNodes]
  );

  return (
    <div
      className={cn(
        "workflow-node min-w-[176px] max-w-[232px] rounded-md border bg-card text-[10px] antialiased shadow-sm",
        "transition-[border-color,box-shadow] duration-150",
        selected ? "border-primary ring-2 ring-primary/20 shadow-md" : "border-border hover:border-primary/40 hover:shadow"
      )}
    >
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !border-2 !bg-background !border-primary rounded-full" />
      <div className="px-2.5 py-1.5 flex items-center gap-2 border-b border-border/60">
        <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Icon size={12} className="text-primary" />
        </div>
        <p className="text-[10px] font-semibold text-foreground truncate flex-1 leading-tight">{data.label}</p>
      </div>
      <div className="px-2.5 py-1 border-b border-border/50">
        <p className="text-[9px] text-muted-foreground leading-snug line-clamp-2">{data.description}</p>
      </div>
      <div className="min-h-0 px-2.5 py-1.5">
        <NodeSettingsPanel
          moduleType={data.moduleType}
          label={data.label}
          settings={data.settings ?? {}}
          onChange={handleSettingsChange}
          compact
        />
      </div>
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !border-2 !bg-background !border-primary rounded-full" />
    </div>
  );
}

const nodeTypes = { module: ModuleNode };

function createNewModuleNode(
  existingCount: number,
  moduleType: string,
  name: string,
  description: string
): Node<ModuleData> {
  const settings: Record<string, unknown> = {};
  const data: ModuleData = { label: name, description, moduleType, settings };
  const position = { x: 80 + (existingCount % 3) * 220, y: 60 + Math.floor(existingCount / 3) * 120 };
  const id = "node-" + moduleType + "-" + String(Date.now());
  return { id: id, type: "module", position: position, data: data };
}

function storedToFlowNodes(nodes: StoredNode[]): Node<ModuleData>[] {
  return nodes.map((n) => ({
    ...n,
    data: n.data as ModuleData,
  })) as Node<ModuleData>[];
}

function flowToStoredNodes(nodes: Node<ModuleData>[]): StoredNode[] {
  return nodes.map(({ id, type, position, data }) => ({
    id,
    type: type ?? "module",
    position,
    data: data as Record<string, unknown>,
  }));
}

function WorkflowFlowView({
  workflow,
  onBack,
  onSaved,
}: {
  workflow: Workflow;
  onBack: () => void;
  onSaved: () => void;
}) {
  const initialNodes = storedToFlowNodes(workflow.nodes);
  const initialEdges = (workflow.edges ?? []) as Edge[];
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<ModuleData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const payload = e.dataTransfer.getData("application/vidflow-module");
      if (!payload) return;
      const parsed = JSON.parse(payload) as { moduleType: string; name: string; description: string };
      setNodes((nds) => {
        const newNode = createNewModuleNode(nds.length, parsed.moduleType, parsed.name, parsed.description);
        return nds.concat(newNode);
      });
    },
    [setNodes]
  );

  const handleSave = useCallback(() => {
    updateWorkflow(workflow.id, {
      nodes: flowToStoredNodes(nodes),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? null,
        targetHandle: e.targetHandle ?? null,
      })),
    });
    onSaved();
  }, [workflow, nodes, edges, onSaved]);

  return (
    <div className="flex h-full w-full bg-background">
      <aside className="w-64 shrink-0 flex flex-col border-r border-border bg-card/50">
        <div className="shrink-0 px-4 py-3 border-b border-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Module Library</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Drag a module onto the canvas</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {PLAYGROUND_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.path}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "application/vidflow-module",
                    JSON.stringify({
                      moduleType: mod.path,
                      name: mod.label,
                      description: mod.description,
                    })
                  );
                  e.dataTransfer.effectAllowed = "move";
                }}
                className="flex items-start gap-3 rounded-lg border border-border bg-background p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 hover:bg-card/80 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon size={18} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{mod.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{mod.description}</p>
                </div>
                <GripVertical size={14} className="shrink-0 text-muted-foreground/50 mt-0.5" />
              </div>
            );
          })}
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="shrink-0 px-4 py-2 border-b border-border bg-background/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="sm" className="shrink-0 h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground" onClick={onBack}>
              <ArrowLeft size={16} />
              Back
            </Button>
            <h1 className="text-sm font-semibold text-foreground truncate">{workflow.name}</h1>
            <span className="text-[11px] text-muted-foreground shrink-0">{nodes.length} node{nodes.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link to="/outputs">
                <FolderOutput size={14} />
                View outputs
              </Link>
            </Button>
            <Button size="sm" className="gap-1.5" onClick={handleSave}>
              <Save size={14} />
              Save
            </Button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            className="bg-muted/20"
            minZoom={0.2}
            maxZoom={2}
          >
            <Background gap={16} size={1} className="!bg-transparent" />
            <Controls className="!shadow-md !border-border !rounded-lg overflow-hidden" />
            <MiniMap className="!shadow-md !border border-border !rounded-lg !bg-card" />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export function WorkflowPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(() => getWorkflows());
  const [openWorkflowId, setOpenWorkflowId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>("16:9");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>("blank");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

  const refreshWorkflows = useCallback(() => setWorkflows(getWorkflows()), []);

  const openWorkflowMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (menuOpenId === id) {
      setMenuOpenId(null);
      setMenuPosition(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setMenuOpenId(id);
  };

  const closeMenu = () => {
    setMenuOpenId(null);
    setMenuPosition(null);
  };

  const handleCreateWorkflow = () => {
    const w = createWorkflow({
      name: workflowName.trim() || "Untitled Workflow",
      aspectRatio,
      templateId: selectedTemplateId ?? undefined,
    });
    setWorkflowName("");
    setAspectRatio("16:9");
    setSelectedTemplateId("blank");
    setModalOpen(false);
    setOpenWorkflowId(w.id);
    refreshWorkflows();
  };

  const handleDeleteWorkflow = (id: string) => {
    deleteWorkflow(id);
    if (openWorkflowId === id) setOpenWorkflowId(null);
    closeMenu();
    refreshWorkflows();
  };

  const openWorkflow = useCallback((id: string) => setOpenWorkflowId(id), []);
  const openModal = useCallback(() => {
    setWorkflowName("");
    setAspectRatio("16:9");
    setSelectedTemplateId("blank");
    setModalOpen(true);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [modalOpen]);

  const openWorkflowData = openWorkflowId ? workflows.find((w) => w.id === openWorkflowId) ?? null : null;

  if (openWorkflowData) {
    return (
      <ReactFlowProvider>
        <WorkflowFlowView
          key={openWorkflowData.id}
          workflow={openWorkflowData}
          onBack={() => setOpenWorkflowId(null)}
          onSaved={refreshWorkflows}
        />
      </ReactFlowProvider>
    );
  }

  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-background">
      <div className="shrink-0 flex items-center justify-between py-5 px-8 border-b border-border bg-background/40">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Workflows</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage video workflows. Open a workflow to design your flow with drag-and-drop.</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-8">
        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <WorkflowIcon size={20} className="text-muted-foreground" />
              My Workflows
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex rounded-md border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "grid" ? "bg-white/10 text-foreground" : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "list" ? "bg-white/10 text-foreground" : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                  aria-label="List view"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <button
                type="button"
                onClick={openModal}
                className="rounded-lg border-2 border-dashed border-border bg-transparent hover:border-muted-foreground/50 hover:bg-white/5 transition-colors flex flex-col items-center justify-center min-h-[180px] py-8 px-4"
              >
                <div className="rounded-full bg-card border border-border flex items-center justify-center w-12 h-12 shrink-0">
                  <Plus size={24} className="text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground mt-3">Create new workflow</span>
              </button>
              {workflows.map((w) => (
                <article
                  key={w.id}
                  className="rounded-lg border border-border bg-card overflow-hidden flex flex-col cursor-pointer hover:border-primary/40 hover:bg-card/90 transition-all"
                  onClick={() => openWorkflow(w.id)}
                >
                  <div className="relative flex items-center justify-center bg-muted/30 aspect-video shrink-0">
                    {w.id === DEMO_WORKFLOW_ID && (
                      <span className="absolute top-2 left-2 text-[10px] font-medium text-primary-foreground bg-primary px-1.5 py-0.5 rounded">
                        Demo
                      </span>
                    )}
                    <WorkflowIcon size={48} className="text-muted-foreground/60" />
                    <span className="absolute bottom-1.5 right-1.5 text-[10px] text-muted-foreground bg-black/60 px-1.5 py-0.5 rounded">
                      {w.nodes.length} node{w.nodes.length !== 1 ? "s" : ""}
                    </span>
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={(e) => openWorkflowMenu(e, w.id)}
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/10"
                        aria-label="Options"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5 min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate flex items-center gap-1.5">
                        {w.name}
                        {w.id === DEMO_WORKFLOW_ID && (
                          <span className="text-[9px] font-medium text-primary-foreground bg-primary px-1 py-0.5 rounded shrink-0">Demo</span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Updated {formatTimeAgo(w.updatedAt)}</p>
                      <p className="text-[10px] text-muted-foreground">{w.aspectRatio}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="grid grid-cols-[56px_1fr_100px_100px_40px] gap-3 px-3 py-2.5 border-b border-border bg-background/60 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span />
                <span>Name</span>
                <span>Nodes</span>
                <span>Updated</span>
                <span />
              </div>
              <button
                type="button"
                onClick={openModal}
                className="grid grid-cols-[56px_1fr_100px_100px_40px] gap-3 items-center w-full px-3 py-3 border-b border-border/60 hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-card border border-dashed border-border flex items-center justify-center shrink-0">
                  <Plus size={20} className="text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">Create new workflow</span>
                <span className="text-xs text-muted-foreground">—</span>
                <span className="text-xs text-muted-foreground">—</span>
                <span />
              </button>
              {workflows.map((w) => (
                <div
                  key={w.id}
                  className="grid grid-cols-[56px_1fr_100px_100px_40px] gap-3 items-center px-3 py-2.5 min-h-[56px] border-b border-border/60 last:border-b-0 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => openWorkflow(w.id)}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                    <WorkflowIcon size={22} className="text-muted-foreground/60" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate flex items-center gap-1.5">
                      {w.name}
                      {w.id === DEMO_WORKFLOW_ID && (
                        <span className="text-[9px] font-medium text-primary-foreground bg-primary px-1 py-0.5 rounded shrink-0">Demo</span>
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{w.aspectRatio}</p>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">{w.nodes.length} nodes</span>
                  <span className="text-xs text-muted-foreground">{formatTimeAgo(w.updatedAt)}</span>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); openWorkflowMenu(e, w.id); }}
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/5"
                      aria-label="Options"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {menuOpenId && menuPosition && createPortal(
        <>
          <div className="fixed inset-0 z-40" aria-hidden onClick={closeMenu} />
          <div
            className="fixed z-50 min-w-[140px] rounded-md border border-border bg-card py-1 shadow-lg"
            style={{ top: menuPosition.top, right: menuPosition.right }}
            role="menu"
          >
            <button type="button" className="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-white/5" onClick={() => { openWorkflow(menuOpenId); closeMenu(); }} role="menuitem">Open</button>
            <button type="button" className="w-full px-3 py-2 text-left text-xs text-destructive hover:bg-white/5" onClick={() => handleDeleteWorkflow(menuOpenId)} role="menuitem">Delete</button>
          </div>
        </>,
        document.body
      )}

      {modalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" aria-hidden onClick={() => setModalOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-workflow-title"
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card shadow-xl flex flex-col max-h-[85vh]"
          >
            <div className="flex items-start justify-between border-b border-border px-5 py-3.5 shrink-0">
              <div>
                <h2 id="new-workflow-title" className="text-base font-semibold text-foreground">New Workflow</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Choose a template and aspect ratio, then name your workflow.</p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 rounded-full h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setModalOpen(false)} aria-label="Close">
                <X size={16} />
              </Button>
            </div>
            <div className="overflow-y-auto px-5 py-4 space-y-5">
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Template</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {WORKFLOW_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={cn(
                        "flex flex-col rounded-lg border-2 overflow-hidden text-left transition-colors",
                        selectedTemplateId === tpl.id
                          ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                          : "border-border bg-background/30 hover:border-white/30 hover:bg-white/5"
                      )}
                    >
                      <div
                        className={cn(
                          "w-full bg-muted/50 flex items-center justify-center",
                          tpl.aspect === "tall" && "aspect-[3/4]",
                          tpl.aspect === "wide" && "aspect-video",
                          tpl.aspect === "square" && "aspect-square"
                        )}
                      >
                        <ImageIcon size={18} className="text-muted-foreground/50" />
                      </div>
                      <div className="px-1.5 py-1 flex items-center justify-between gap-2 min-h-[32px]">
                        <p className="text-[11px] font-medium text-foreground truncate">{tpl.title}</p>
                        <span className="text-[9px] font-medium text-muted-foreground shrink-0">{templateAspectLabel(tpl.aspect)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Workflow name</Label>
                <Input
                  type="text"
                  placeholder="My Video Workflow"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="bg-background/50 border-border h-9 text-sm"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Aspect ratio</Label>
                <div className="flex items-end gap-2">
                  {ASPECT_RATIO_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAspectRatio(opt.value)}
                      title={opt.label + " " + opt.sublabel}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 rounded-lg border-2 min-w-0 transition-colors text-center h-16",
                        opt.aspectClass,
                        aspectRatio === opt.value ? "border-primary bg-primary/15 text-primary ring-1 ring-primary/30" : "border-border bg-background/30 text-muted-foreground hover:border-border hover:bg-muted/50"
                      )}
                    >
                      {opt.icon}
                      <span className="text-[10px] opacity-80 leading-tight">{opt.sublabel}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3 shrink-0 bg-muted/20">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreateWorkflow} className="gap-1.5">
                <Sparkles size={14} />
                Create Workflow
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
