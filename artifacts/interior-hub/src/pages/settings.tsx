import { Bell, Globe, Shield, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage platform preferences and admin account.</p>
      </div>

      {/* Admin Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-muted-foreground" />
            Admin Account
          </CardTitle>
          <CardDescription>Your personal admin profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-name">Full Name</Label>
              <Input id="admin-name" placeholder="Platform Admin" defaultValue="Platform Admin" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Email Address</Label>
              <Input id="admin-email" type="email" placeholder="admin@interiorhub.ye" defaultValue="admin@interiorhub.ye" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-pass">New Password</Label>
            <Input id="admin-pass" type="password" placeholder="Leave blank to keep current password" />
          </div>
          <Button size="sm" onClick={() => { /* TODO: wire to API */ }}>Save Account</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Notifications
          </CardTitle>
          <CardDescription>Choose which events trigger admin alerts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            label="New engineer signup"
            description="Notify when a new engineer registers and needs review."
            defaultChecked
          />
          <Separator />
          <ToggleRow
            label="New contact request"
            description="Notify when a client submits a contact request."
          />
          <Separator />
          <ToggleRow
            label="Trial expiry warnings"
            description="Notify 3 days before an engineer's trial period ends."
            defaultChecked
          />
        </CardContent>
      </Card>

      {/* Platform */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Platform
          </CardTitle>
          <CardDescription>General platform configuration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="platform-name">Platform Name</Label>
            <Input id="platform-name" defaultValue="InteriorHub" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="trial-days">Default Trial Period (days)</Label>
            <Input id="trial-days" type="number" defaultValue={30} className="w-32" />
          </div>
          <Button size="sm" onClick={() => { /* TODO: wire to API */ }}>Save Platform Settings</Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Security
          </CardTitle>
          <CardDescription>Session and access control settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            label="Require email verification for new engineers"
            description="Engineers must verify their email before appearing in admin review."
            defaultChecked
          />
          <Separator />
          <ToggleRow
            label="Auto-disable expired trial accounts"
            description="Automatically disable engineers when their trial expires."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleRow({
  label, description, defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} className="shrink-0 mt-0.5" />
    </div>
  );
}
