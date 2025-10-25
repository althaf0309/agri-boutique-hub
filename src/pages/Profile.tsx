// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const { user, isAuthenticated, refreshMe } = useAuth();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [pwd, setPwd] = useState({ current: "", newPwd: "", confirm: "" });

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // If you have a real updateProfile API, call it:
      // await api.patch("/auth/me/", { first_name: form.first_name, last_name: form.last_name });
      toast.success("Profile updated");
      await refreshMe?.();
    } catch (err: any) {
      toast.error(err?.message || "Could not update profile");
    }
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.newPwd !== pwd.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      // Call your change-password endpoint here
      toast.success("Password changed");
      setPwd({ current: "", newPwd: "", confirm: "" });
    } catch (err: any) {
      toast.error(err?.message || "Could not change password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Sign in required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Please sign in to view your profile.
              </p>
              <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Profile details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSaveProfile} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First name</Label>
                    <Input
                      id="first_name"
                      value={form.first_name}
                      onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last name</Label>
                    <Input
                      id="last_name"
                      value={form.last_name}
                      onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={form.email} disabled />
                  <p className="text-xs text-muted-foreground">
                    Email can’t be changed from here.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">Save changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Right: Security */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current password</Label>
                  <Input
                    id="current"
                    type="password"
                    value={pwd.current}
                    onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="newPwd">New password</Label>
                  <Input
                    id="newPwd"
                    type="password"
                    value={pwd.newPwd}
                    onChange={(e) => setPwd((p) => ({ ...p, newPwd: e.target.value }))}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm new password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={pwd.confirm}
                    onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="outline">
                    Change password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
