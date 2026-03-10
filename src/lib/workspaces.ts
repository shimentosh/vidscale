const STORAGE_KEY = "vidscale-workspaces";
const CURRENT_ID_KEY = "vidscale-current-workspace-id";

export type Workspace = {
  id: string;
  name: string;
  /** Optional logo URL (data URL or blob URL) for use in brand kit "use workspace logo" */
  logoUrl?: string;
  createdAt: string;
};

function loadWorkspaces(): Workspace[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Workspace[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWorkspaces(workspaces: Workspace[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
}

export function getWorkspaces(): Workspace[] {
  let list = loadWorkspaces();
  if (list.length === 0) {
    list = seedDefaultWorkspace();
    saveWorkspaces(list);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getWorkspaceById(id: string): Workspace | null {
  return getWorkspaces().find((w) => w.id === id) ?? null;
}

export function getCurrentWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(CURRENT_ID_KEY);
  const list = getWorkspaces();
  if (id && list.some((w) => w.id === id)) return id;
  if (list.length > 0) {
    setCurrentWorkspaceId(list[0].id);
    return list[0].id;
  }
  return null;
}

export function setCurrentWorkspaceId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_ID_KEY, id);
}

export function createWorkspace(input: { name: string; logoUrl?: string }): Workspace {
  const list = loadWorkspaces();
  const workspace: Workspace = {
    id: crypto.randomUUID(),
    name: input.name.trim() || "Untitled Workspace",
    logoUrl: input.logoUrl,
    createdAt: new Date().toISOString(),
  };
  list.push(workspace);
  saveWorkspaces(list);
  setCurrentWorkspaceId(workspace.id);
  return workspace;
}

export function updateWorkspace(
  id: string,
  input: { name?: string; logoUrl?: string }
): Workspace | null {
  const list = loadWorkspaces();
  const index = list.findIndex((w) => w.id === id);
  if (index === -1) return null;
  list[index] = {
    ...list[index],
    ...(input.name !== undefined && { name: input.name.trim() || "Untitled Workspace" }),
    ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
  };
  saveWorkspaces(list);
  return list[index];
}

export function deleteWorkspace(id: string): boolean {
  const list = loadWorkspaces();
  const filtered = list.filter((w) => w.id !== id);
  if (filtered.length === list.length) return false;
  saveWorkspaces(filtered);
  const current = getCurrentWorkspaceId();
  if (current === id && filtered.length > 0) setCurrentWorkspaceId(filtered[0].id);
  return true;
}

function seedDefaultWorkspace(): Workspace[] {
  const defaultWorkspace: Workspace = {
    id: "default-workspace",
    name: "Personal",
    createdAt: new Date().toISOString(),
  };
  return [defaultWorkspace];
}
