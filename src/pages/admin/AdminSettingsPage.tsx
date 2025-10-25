import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const LS_KEY = "admin_ui_prefs";

type Prefs = {
  language: string;           // "en" | "hi" | ...
  pollNotifications: boolean; // toggle polling
  compactTables: boolean;     // dense table rows
};

const DEFAULTS: Prefs = {
  language: "en",
  pollNotifications: true,
  compactTables: false,
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const save = () => {
    localStorage.setItem(LS_KEY, JSON.stringify(prefs));
    toast({ title: "Settings saved" });
    // Optionally trigger global events or context update here.
  };

  return (
    <div className="p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={prefs.language} onValueChange={(v) => setPrefs((p) => ({ ...p, language: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="kn">Kannada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <Label>Live notifications</Label>
                <div className="text-xs text-gray-500">Poll server periodically for new items</div>
              </div>
              <Switch
                checked={prefs.pollNotifications}
                onCheckedChange={(v) => setPrefs((p) => ({ ...p, pollNotifications: v }))}
              />
            </div>

            <div className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <Label>Compact tables</Label>
                <div className="text-xs text-gray-500">Reduce row padding in admin data tables</div>
              </div>
              <Switch
                checked={prefs.compactTables}
                onCheckedChange={(v) => setPrefs((p) => ({ ...p, compactTables: v }))}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={save}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
