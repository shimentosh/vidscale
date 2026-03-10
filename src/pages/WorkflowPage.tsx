import { useCallback, useState } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
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
import { FileText, Settings2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAYGROUND_MODULES } from "@/lib/playgroundModules";
import { NodeSettingsPanel } from "@/components/workflow/NodeSettingsPanel";

type ModuleData = {
  label: string;
  description: string;
  moduleType: string;
  settings?: Record<string, unknown>;
};

function ModuleNode({ data, selected }: NodeProps<Node<ModuleData>>) {
  const Icon = PLAYGROUND_MODULES.find((m) => m.path === data.moduleType)?.icon ?? FileText;
  return (
    <div
      className={cn(
        "min-w-[180px] rounded-xl border bg-card shadow-md transition-all duration-200",
        selected ? "border-primary ring-2 ring-primary/20 shadow-lg" : "border-border hover:border-primary/50 hover:shadow-lg"
      )}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !border-2 !bg-background !border-primary" />
      <div className="px-3 pt-2.5 pb-1 flex items-center gap-2 border-b border-border/60">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon size={14} className="text-primary" />
        </div>
        <p className="text-xs font-semibold text-foreground truncate flex-1">{data.label}</p>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">{data.description}</p>
      </div>
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !border-2 !bg-background !border-primary" />
    </div>
  );
}

const nodeTypes = { module: ModuleNode };

const initialNodes: Node<ModuleData>[] = [];
const initialEdges: Edge[] = [];

export function WorkflowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<ModuleData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = selectedNodeId ? (nodes.find((n) => n.id === selectedNodeId) ?? null) : null;

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
      const { moduleType, name, description } = JSON.parse(payload) as {
        moduleType: string;
        name: string;
        description: string;
      };
      setNodes((nds) => {
        const count = nds.length;
        const position = { x: 80 + (count % 3) * 220, y: 60 + Math.floor(count / 3) * 120 };
        const id = `node-${moduleType}-${Date.now()}`;
        const newNode: Node<ModuleData> = {
          id,
          type: "module",
          position,
          data: { label: name, description, moduleType, settings: {} },
        };
        return nds.concat(newNode);
      });
    },
    [setNodes]
  );

  const onSelectionChange = useCallback(({ nodes: selected }: { nodes: Node[] }) => {
    setSelectedNodeId(selected.length === 1 ? selected[0].id : null);
  }, []);

  return (
    <div className="flex h-full w-full bg-background">
      {/* Left Sidebar – Module Library */}
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

      {/* Center – React Flow Canvas */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="shrink-0 px-4 py-2 border-b border-border bg-background/60 flex items-center justify-between">
          <h1 className="text-sm font-semibold text-foreground">Workflow</h1>
          <span className="text-[11px] text-muted-foreground">{nodes.length} node{nodes.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex-1 min-h-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            onSelectionChange={onSelectionChange}
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

      {/* Right Sidebar – Node Settings */}
      <aside className="w-72 shrink-0 flex flex-col border-l border-border bg-card/50">
        <div className="shrink-0 px-4 py-3 border-b border-border flex items-center gap-2">
          <Settings2 size={16} className="text-muted-foreground" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Node Settings</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Module</label>
                <p className="text-sm font-semibold text-foreground">{selectedNode.data.label}</p>
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Description</label>
                <p className="text-xs text-muted-foreground">{selectedNode.data.description}</p>
              </div>
              <div className="pt-3 border-t border-border">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Settings</label>
                <NodeSettingsPanel
                  moduleType={selectedNode.data.moduleType}
                  label={selectedNode.data.label}
                  settings={selectedNode.data.settings ?? {}}
                  onChange={(newSettings) => {
                    setNodes((nds) =>
                      nds.map((n) =>
                        n.id === selectedNode.id ? { ...n, data: { ...n.data, settings: newSettings } } : n
                      )
                    );
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center px-2">
              <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                <Settings2 size={22} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No node selected</p>
              <p className="text-[11px] text-muted-foreground mt-1">Select a node on the canvas to view and edit its settings.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
