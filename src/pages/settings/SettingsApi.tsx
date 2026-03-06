import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SettingsApi() {
  const [openaiKey, setOpenaiKey] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app: persist to backend or secure storage; never commit keys.
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="py-10 px-8 max-w-2xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          API Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure API keys for external services.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <Card className="bg-[#131922] border-border">
          <CardHeader>
            <CardTitle className="text-white">OpenAI</CardTitle>
            <CardDescription>
              Your OpenAI API key for AI features. Keys are stored locally and
              never sent to our servers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-key" className="text-foreground">
                API Key
              </Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="bg-background/50"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Create or manage keys at{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  platform.openai.com
                </a>
              </p>
            </div>
            <Button type="submit" size="sm">
              {saved ? "Saved" : "Save OpenAI API Key"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
