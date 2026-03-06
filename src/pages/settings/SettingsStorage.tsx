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

const defaultR2 = {
  name: "",
  accountId: "",
  accessKeyId: "",
  secretAccessKey: "",
  bucketName: "",
  publicUrl: "",
};

export function SettingsStorage() {
  const [r2, setR2] = useState(defaultR2);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app: validate and persist to backend or secure storage.
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (field: keyof typeof defaultR2) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setR2((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="py-10 px-8 max-w-2xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Storage
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect cloud storage for media and assets. Add Cloudflare R2 to store
          and serve files.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <Card className="bg-[#131922] border-border">
          <CardHeader>
            <CardTitle className="text-white">Cloudflare R2</CardTitle>
            <CardDescription>
              R2 is S3-compatible object storage. Add your bucket credentials
              below. You can create a bucket and API token in the Cloudflare
              dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="r2-name" className="text-foreground">
                Connection name
              </Label>
              <Input
                id="r2-name"
                placeholder="e.g. My R2 Bucket"
                value={r2.name}
                onChange={update("name")}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r2-account" className="text-foreground">
                Account ID
              </Label>
              <Input
                id="r2-account"
                placeholder="Your Cloudflare account ID"
                value={r2.accountId}
                onChange={update("accountId")}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r2-access" className="text-foreground">
                Access Key ID
              </Label>
              <Input
                id="r2-access"
                placeholder="R2 API token access key"
                value={r2.accessKeyId}
                onChange={update("accessKeyId")}
                className="bg-background/50"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r2-secret" className="text-foreground">
                Secret Access Key
              </Label>
              <Input
                id="r2-secret"
                type="password"
                placeholder="R2 API token secret"
                value={r2.secretAccessKey}
                onChange={update("secretAccessKey")}
                className="bg-background/50"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r2-bucket" className="text-foreground">
                Bucket name
              </Label>
              <Input
                id="r2-bucket"
                placeholder="your-bucket-name"
                value={r2.bucketName}
                onChange={update("bucketName")}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r2-public" className="text-foreground">
                Public URL (optional)
              </Label>
              <Input
                id="r2-public"
                placeholder="https://pub-xxx.r2.dev or custom domain"
                value={r2.publicUrl}
                onChange={update("publicUrl")}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                Used to build public URLs for stored files if you enable public
                access.
              </p>
            </div>
            <Button type="submit" size="sm">
              {saved ? "Saved" : "Add Cloudflare R2"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
