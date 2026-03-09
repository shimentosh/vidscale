import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronDown, Plus, LayoutTemplate, Sparkles, ImageIcon, Moon, Sun, Bell, CheckCircle, FileVideo, HardDrive, Zap, CheckCheck, CircleCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  type: "success" | "info" | "warning" | "default";
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  { id: "1", type: "success", title: "Export complete", message: "Your video \"Summer Recap\" is ready to download.", timeAgo: "2 min ago", read: false, icon: CheckCircle },
  { id: "2", type: "info", title: "New template available", message: "Try the new Product Launch template for your next video.", timeAgo: "1 hour ago", read: false, icon: FileVideo },
  { id: "3", type: "warning", title: "Storage at 86%", message: "You've used 155 of 180 GB. Upgrade for more space.", timeAgo: "3 hours ago", read: true, icon: HardDrive },
  { id: "4", type: "default", title: "Welcome to VidScale", message: "Create your first project to get started.", timeAgo: "1 day ago", read: true, icon: Zap },
];

const NEW_PROJECT_OPTIONS = [
  { to: "/templates", label: "From template", description: "Pick a template and customize", icon: LayoutTemplate },
  { to: "/ai-editor", label: "With AI Editor", description: "Edit and create with AI tools", icon: Sparkles },
  { to: "/ai-design", label: "With AI image", description: "Generate images from prompts", icon: ImageIcon },
] as const;

const THEME_STORAGE_KEY = "vidscale-theme";

function getInitialTheme(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light") return false;
  if (stored === "dark") return true;
  return true; // default dark
}

function UsageRow({ label, used, total, unit }: { label: string; used: number; total: number; unit: string }) {
  const pctUsed = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const pctLeft = 100 - pctUsed;
  const displayUsed = unit === "MB" ? used : used.toLocaleString();
  const displayTotal = unit === "MB" ? total : total.toLocaleString();
  return (
    <div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-muted-foreground">{pctLeft}% left</span>
      </div>
      <p className="text-xs text-foreground mt-0.5">
        {displayUsed} / {displayTotal} {unit}
      </p>
      <div className="h-1 rounded-full bg-muted overflow-hidden mt-1">
        <div
          className="h-full rounded-full bg-primary/70 transition-all"
          style={{ width: `${pctUsed}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

export function Header() {
    const location = useLocation();
    const isPlayground = location.pathname.startsWith("/playground");
    const isBrandKits = location.pathname.startsWith("/brand-kits");
    const [newProjectOpen, setNewProjectOpen] = useState(false);
    const newProjectRef = useRef<HTMLDivElement>(null);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);
    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };
    const markAsRead = (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };
    const [isDark, setIsDark] = useState(getInitialTheme);

    const backTo = isPlayground ? "/playground" : isBrandKits ? "/brand-kits" : "/";
    const backLabel = isPlayground ? "Playground" : isBrandKits ? "Brand Kit" : "Home";

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
            localStorage.setItem(THEME_STORAGE_KEY, "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem(THEME_STORAGE_KEY, "light");
        }
    }, [isDark]);

    useEffect(() => {
        if (!newProjectOpen) return;
        const onOutside = (e: MouseEvent) => {
            if (newProjectRef.current && !newProjectRef.current.contains(e.target as Node)) setNewProjectOpen(false);
        };
        window.addEventListener("mousedown", onOutside);
        return () => window.removeEventListener("mousedown", onOutside);
    }, [newProjectOpen]);

    useEffect(() => {
        if (!notifOpen) return;
        const onOutside = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
        };
        window.addEventListener("mousedown", onOutside);
        return () => window.removeEventListener("mousedown", onOutside);
    }, [notifOpen]);

    useEffect(() => {
        if (!profileOpen) return;
        const onOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
        };
        window.addEventListener("mousedown", onOutside);
        return () => window.removeEventListener("mousedown", onOutside);
    }, [profileOpen]);

    const toggleTheme = () => setIsDark((prev) => !prev);

    const backLink = (
        <Link
            to={backTo}
            className="flex items-center gap-2 py-2 pr-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
            <ChevronLeft size={18} className="shrink-0" />
            <span className="text-sm font-semibold tracking-tight text-foreground truncate">
                {backLabel}
            </span>
        </Link>
    );

    return (
        <header className="h-[69px] shrink-0 flex items-center justify-between border-b border-border px-6 bg-background">
            <div className="flex items-center gap-3 min-w-0">
                {backLink}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-white/5"
                    onClick={toggleTheme}
                    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
                <div className="relative" ref={newProjectRef}>
                    <button
                        type="button"
                        onClick={() => setNewProjectOpen((o) => !o)}
                        aria-expanded={newProjectOpen}
                        aria-haspopup="true"
                        className={cn(
                            "rounded-xl bg-card/50 hover:bg-card hover:shadow-md transition-all duration-200 flex items-center gap-2 py-1.5 pl-2 pr-2.5 shadow-sm",
                            newProjectOpen && "bg-card shadow-md"
                        )}
                    >
                        <div className="rounded-lg bg-muted/80 flex items-center justify-center w-8 h-8 shrink-0">
                            <Plus size={16} className="text-muted-foreground" />
                        </div>
                        <div className="flex flex-col items-start text-left min-w-0">
                            <span className="text-xs font-semibold text-foreground leading-tight">New Project</span>
                            <span className="text-[10px] text-muted-foreground leading-tight">Template or AI</span>
                        </div>
                        <ChevronDown size={14} className={cn("shrink-0 text-muted-foreground transition-transform", newProjectOpen && "rotate-180")} />
                    </button>
                    {newProjectOpen && (
                        <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[240px] rounded-lg border border-border bg-card py-1 shadow-lg">
                            {NEW_PROJECT_OPTIONS.map((opt) => {
                                const Icon = opt.icon;
                                return (
                                    <Link
                                        key={opt.to}
                                        to={opt.to}
                                        onClick={() => setNewProjectOpen(false)}
                                        className="flex items-start gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                            <Icon size={18} className="text-foreground" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-foreground">{opt.label}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="w-px h-6 bg-border shrink-0" aria-hidden />
                <div className="relative" ref={notifRef}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("relative overflow-visible rounded-full h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-white/5", notifOpen && "text-foreground bg-white/5")}
                        aria-label="Notifications"
                        aria-expanded={notifOpen}
                        aria-haspopup="true"
                        onClick={() => setNotifOpen((o) => !o)}
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[11px] font-bold text-primary-foreground flex items-center justify-center leading-none" aria-hidden>
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </Button>
                    {notifOpen &&
                        createPortal(
                            <div
                                className="fixed z-[100] mt-1.5 w-[360px] max-h-[420px] flex flex-col rounded-xl border border-border bg-card shadow-xl"
                                style={{
                                    top: 72,
                                    right: 24,
                                }}
                            >
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                                    <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
                                    {unreadCount > 0 && (
                                        <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
                                    )}
                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={markAllAsRead}
                                            className="ml-auto p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                                            aria-label="Mark all as read"
                                        >
                                            <CheckCheck size={16} />
                                        </button>
                                    )}
                                </div>
                                <div className="overflow-y-auto flex-1 min-h-0 p-2">
                                    {notifications.length === 0 ? (
                                        <div className="py-8 text-center text-sm text-muted-foreground">
                                            No notifications yet.
                                        </div>
                                    ) : (
                                        <ul className="space-y-0.5">
                                            {notifications.map((n) => {
                                                const Icon = n.icon;
                                                return (
                                                    <li key={n.id}>
                                                        <div
                                                            className={cn(
                                                                "w-full flex gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group",
                                                                !n.read && "bg-primary/5",
                                                                "hover:bg-muted/80"
                                                            )}
                                                        >
                                                            <span
                                                                className={cn(
                                                                    "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
                                                                    n.type === "success" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                                                                    n.type === "info" && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                                                                    n.type === "warning" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                                                                    n.type === "default" && "bg-muted text-muted-foreground"
                                                                )}
                                                            >
                                                                <Icon size={18} />
                                                            </span>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-medium text-foreground">{n.title}</p>
                                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                                                                <p className="text-[11px] text-muted-foreground mt-1">{n.timeAgo}</p>
                                                            </div>
                                                            {!n.read && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                                                    className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                                                    aria-label={`Mark "${n.title}" as read`}
                                                                >
                                                                    <CircleCheck size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>,
                            document.body
                        )}
                </div>
                <div className="relative" ref={profileRef}>
                    <button
                        type="button"
                        onClick={() => setProfileOpen((o) => !o)}
                        className={cn(
                            "flex items-center justify-center w-9 h-9 rounded-full bg-muted text-sm font-semibold text-foreground hover:bg-white/10 transition-colors shrink-0",
                            profileOpen && "bg-white/10 ring-2 ring-primary/30"
                        )}
                        aria-label="Profile"
                        aria-expanded={profileOpen}
                        aria-haspopup="true"
                    >
                        SN
                    </button>
                    {profileOpen &&
                        createPortal(
                            <div
                                className="fixed z-[100] w-[320px] max-h-[85vh] flex flex-col rounded-xl border border-border bg-card shadow-xl overflow-hidden"
                                style={{ top: 72, right: 24 }}
                            >
                                {/* Profile */}
                                <div className="p-4 border-b border-border">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                                            SN
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-foreground truncate">Shimanto Neer</p>
                                            <p className="text-xs text-muted-foreground truncate mt-0.5">hello@shimantoneer.com</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Current plan */}
                                <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
                                    <div>
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Current plan</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm font-semibold text-foreground">Basic</span>
                                            <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground">Free</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
                                    >
                                        Upgrade
                                    </button>
                                </div>

                                {/* Usage */}
                                <div className="px-4 py-3 border-b border-border space-y-3">
                                    <UsageRow label="Voice gen" used={0} total={1000} unit="chars" />
                                    <UsageRow label="Transcription" used={0} total={30} unit="min" />
                                    <UsageRow label="Storage" used={0} total={500} unit="MB" />
                                </div>

                                {/* Sign out */}
                                <div className="p-2">
                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
                                    >
                                        <LogOut size={16} />
                                        Sign out securely
                                    </button>
                                </div>
                            </div>,
                            document.body
                        )}
                </div>
            </div>
        </header>
    );
}
