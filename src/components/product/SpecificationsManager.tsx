import { useState } from "react";
import { Plus, X, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export interface SpecRow {
  id?: number;
  group?: string;
  name: string;
  value: string;
  unit?: string;
  is_highlight?: boolean;
  sort_order?: number;
}

export function SpecificationsManager({
  specs,
  onChange,
}: {
  specs: SpecRow[];
  onChange: (s: SpecRow[]) => void;
}) {
  const { toast } = useToast();
  const [draft, setDraft] = useState<SpecRow>({
    name: "",
    value: "",
    group: "",
    unit: "",
    is_highlight: false,
    sort_order: 0,
  });

  const add = () => {
    if (!draft.name.trim() || !draft.value.trim()) return;
    // ✅ prevent duplicates by (group,name)
    const key = `${(draft.group || "").trim().toLowerCase()}|${draft.name.trim().toLowerCase()}`;
    const exists = specs.some(s => `${(s.group || "").trim().toLowerCase()}|${s.name.trim().toLowerCase()}` === key);
    if (exists) {
      toast({ title: "Duplicate specification", description: "Same Group + Name already exists.", variant: "destructive" });
      return;
    }
    onChange([...specs, { ...draft, id: Date.now() }]);
    setDraft({ name: "", value: "", group: "", unit: "", is_highlight: false, sort_order: 0 });
    toast({ title: "Specification added" });
  };

  const remove = (idx: number) => {
    const next = specs.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  const update = (idx: number, patch: Partial<SpecRow>) => {
    const next = specs.slice();
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          Specifications
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add row */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <div className="md:col-span-2 min-w-0">
            <Label className="text-xs text-muted-foreground">Group</Label>
            <Input className="w-full" value={draft.group ?? ""} onChange={(e) => setDraft((d) => ({ ...d, group: e.target.value }))} />
          </div>
          <div className="min-w-0">
            <Label className="text-xs text-muted-foreground">Name *</Label>
            <Input className="w-full" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          </div>
          <div className="md:col-span-2 min-w-0">
            <Label className="text-xs text-muted-foreground">Value *</Label>
            <Input className="w-full" value={draft.value} onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))} />
          </div>
          <div className="min-w-0">
            <Label className="text-xs text-muted-foreground">Unit</Label>
            <Input className="w-full" value={draft.unit ?? ""} onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))} />
          </div>

        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Checkbox checked={!!draft.is_highlight} onCheckedChange={(v) => setDraft((d) => ({ ...d, is_highlight: !!v }))} />
            <Label className="text-xs">Highlight</Label>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Sort</Label>
            <Input
              className="w-24"
              type="number"
              value={draft.sort_order ?? 0}
              onChange={(e) => setDraft((d) => ({ ...d, sort_order: Number(e.target.value || 0) }))}
              placeholder="0"
            />
          </div>
          <div className="sm:ml-auto">
            <Button onClick={add} disabled={!draft.name || !draft.value}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>

        {/* rows */}
        {specs.length > 0 ? (
          <div className="space-y-2">
            {specs.map((s, i) => (
              <div key={s.id ?? `${s.name}-${i}`} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                <Input className="md:col-span-2 w-full" value={s.group ?? ""} onChange={(e) => update(i, { group: e.target.value })} />
                <Input className="w-full" value={s.name} onChange={(e) => update(i, { name: e.target.value })} />
                <Input className="md:col-span-2 w-full" value={s.value} onChange={(e) => update(i, { value: e.target.value })} />
                <Input className="w-full" value={s.unit ?? ""} onChange={(e) => update(i, { unit: e.target.value })} />

                <div className="md:col-span-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={!!s.is_highlight} onCheckedChange={(v) => update(i, { is_highlight: !!v })} />
                      <Label className="text-xs">Highlight</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Sort</Label>
                      <Input
                        className="w-24"
                        type="number"
                        value={s.sort_order ?? 0}
                        onChange={(e) => update(i, { sort_order: Number(e.target.value || 0) })}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive ml-auto"
                      onClick={() => remove(i)}
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No specs yet. Add name/value pairs above.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default SpecificationsManager;
