import { useState } from "react";
import { X, FileText, Mic, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WorkflowOutput } from "@/lib/workflowOutputs";

type ScriptVoiceModalProps = { output: WorkflowOutput; onClose: () => void };

export function ScriptVoiceModal({ output, onClose }: ScriptVoiceModalProps) {
  const [copied, setCopied] = useState(false);
  const hasScript = output.script && output.script.trim().length > 0;
  const hasVoiceOver = !!output.voiceOverUrl;

  const copyScript = () => {
    if (!output.script) return;
    navigator.clipboard.writeText(output.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70" aria-hidden onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <p className="text-sm font-semibold text-foreground truncate pr-2">{output.name}</p>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground shrink-0" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {hasScript && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><FileText size={12} /> Script</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={copyScript}>{copied ? <Check size={12} /> : <Copy size={12} />}{copied ? "Copied" : "Copy"}</Button>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap bg-muted/20 rounded-lg p-3 max-h-[200px] overflow-y-auto">{output.script}</p>
            </div>
          )}
          {hasVoiceOver && (
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-2"><Mic size={12} /> Voice over</span>
              <audio controls preload="metadata" className="w-full h-10 accent-primary" src={output.voiceOverUrl}>Your browser does not support the audio element.</audio>
            </div>
          )}
          {!hasScript && !hasVoiceOver && <p className="text-sm text-muted-foreground">No script or voice over for this output.</p>}
        </div>
      </div>
    </>
  );
}
