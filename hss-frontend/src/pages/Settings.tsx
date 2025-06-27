import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleNotificationsToggle = () => setNotificationsEnabled(!notificationsEnabled);

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

        {/* Account Settings */}
        <Card className="border border-border/50 shadow-sm backdrop-blur-md bg-background/70 animate-slide-in-bottom">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email Address
              </label>
              <Input id="email" type="email" defaultValue="user@example.com" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Change Password
              </label>
              <Input id="password" type="password" placeholder="New password" />
            </div>

            <Button className="mt-2 bg-hss-purple-vivid hover:bg-hss-purple-medium">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="border border-border/50 shadow-sm backdrop-blur-md bg-background/70 animate-slide-in-bottom [animation-delay:100ms]">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Enable Notifications</span>
              <Switch checked={notificationsEnabled} onCheckedChange={handleNotificationsToggle} />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border border-border/50 shadow-sm backdrop-blur-md bg-background/70 animate-slide-in-bottom [animation-delay:200ms]">
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>Handle account security and deletion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => alert("Account deletion feature coming soon!")}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Settings;
