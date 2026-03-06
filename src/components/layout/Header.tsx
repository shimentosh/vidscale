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
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
            <ChevronLeft size={20} />
            <h1 className="text-[15px] font-bold tracking-wide text-white">
                {isSettings ? "Back" : isPlayground ? "Playground" : "Create Collection"}
            </h1>
        </Link>
    );

    return (
        <header className="h-16 flex items-center justify-between border-b border-border px-6 bg-[#0A0D14] shrink-0">
            <div className="flex items-center gap-2">
                {backLink}
            </div>
            <div className="flex items-center gap-1">
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
