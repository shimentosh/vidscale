import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export function SettingsGeneral() {
  return (
    <div className="py-10 px-8 max-w-2xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          General
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Basic application and display options.
        </p>
      </div>

      <div className="space-y-8">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Preferences</CardTitle>
            <CardDescription>
              Theme and notification settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme" className="text-foreground">
                  Dark mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Use dark theme for the interface.
                </p>
              </div>
              <Switch id="theme" defaultChecked />
            </div>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="text-foreground">
                  Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive updates and reminders.
                </p>
              </div>
              <Switch id="notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Account</CardTitle>
            <CardDescription>
              Your profile and account details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Email</Label>
              <p className="text-sm text-muted-foreground">
                hello@shimantoneer.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
