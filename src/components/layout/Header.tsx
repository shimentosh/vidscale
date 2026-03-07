import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, Settings, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
    const location = useLocation();
    const isSettings = location.pathname.startsWith("/settings");
    const isPlayground = location.pathname.startsWith("/playground");

    const backLink = (
        <Link
            to="/"
            className="flex items-center gap-2 py-2 pr-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
            <ChevronLeft size={18} className="shrink-0" />
            <span className="text-sm font-semibold tracking-tight text-foreground truncate">
                {isSettings ? "Back" : isPlayground ? "Playground" : "Brand Kit"}
            </span>
        </Link>
    );

    return (
        <header className="h-[69px] shrink-0 flex items-center justify-between border-b border-border px-6 bg-[#0D1117]">
            <div className="flex items-center gap-3 min-w-0">
                {backLink}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 ${location.pathname === "/x-tools" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    asChild
                >
                    <Link to="/x-tools">
                        <Wrench size={18} />
                        X Tools
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 ${isSettings ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    asChild
                >
                    <Link to="/settings">
                        <Settings size={18} />
                        Settings
                    </Link>
                </Button>
            </div>
        </header>
    );
}
