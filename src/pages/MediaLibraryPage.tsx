import { useState, useRef, useMemo } from "react";
import { FolderSearch, Upload, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LibraryItem = { id: string; name: string; type: "folder" | "file" };

const AVAILABLE_FOLDERS = [
  "My Videos",
  "Stock Clips",
  "dev-environment",
  "FB Posting",
  "iphone 11 pro 2",
  "Iphone 13 Pro to 15 Pro Max",
  "Picture",
];

const initialLibraryItems: LibraryItem[] = AVAILABLE_FOLDERS.map((name) => ({
  id: `folder-${name}`,
  name,
  type: "folder",
}));

export function MediaLibraryPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(initialLibraryItems);
  const [librarySearch, setLibrarySearch] = useState("");

  const filteredLibrary = useMemo(() => {
    if (!librarySearch.trim()) return libraryItems;
    const q = librarySearch.trim().toLowerCase();
    return libraryItems.filter((item) => item.name.toLowerCase().includes(q));
  }, [libraryItems, librarySearch]);

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      setLibraryItems((prev) => [
        ...prev,
        ...Array.from(files).map((f, i) => ({
          id: `file-${Date.now()}-${i}`,
          name: f.name,
          type: "file" as const,
        })),
      ]);
    }
    e.target.value = "";
  };

  const removeItem = (id: string) => setLibraryItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 py-6 px-8 border-b border-border">
        <h1 className="text-2xl font-bold text-white tracking-tight">Media Library</h1>
        <p className="text-sm text-muted-foreground mt-2">Manage your media: folders, uploads, and footage in one place.</p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl">
          <section className="rounded-xl border border-border bg-[#131922] p-6">
            <div className="flex items-center gap-2 mb-2">
              <FolderSearch size={20} className="text-muted-foreground shrink-0" />
              <Label className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
                Your library
              </Label>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Folders are listed below — select and search from there. Add more with Upload video.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                multiple
                className="sr-only"
                onChange={handleFileChange}
                aria-label="Upload video files"
              />
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleUploadClick}>
                <Upload size={16} />
                Upload video
              </Button>
            </div>

            <div className="mb-2">
              <Label className="text-xs text-muted-foreground block mb-1.5">Search your library</Label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search folders and footage…"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="pl-9 h-9 rounded-lg bg-background/50 border-border"
                  aria-label="Search your media library"
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-background/30 min-h-[200px] max-h-[400px] overflow-y-auto">
              <div className="p-2">
                {filteredLibrary.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    {libraryItems.length === 0
                      ? "No media yet. Upload video to add to your library."
                      : "No items match your search."}
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {filteredLibrary.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-white/5 group"
                      >
                        <span className="min-w-0 truncate">{item.name}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Remove ${item.name}`}
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
