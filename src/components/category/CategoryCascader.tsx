import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CategoryNode } from "@/api/hooks/categories";

type Props = {
  tree: CategoryNode[];
  value?: number | null;                 // selected leaf id
  onChange: (categoryId: number | null) => void;
  label?: string;
};

function flatten(nodes: CategoryNode[]): Record<number, { node: CategoryNode; parentId: number | null }> {
  const out: Record<number, { node: CategoryNode; parentId: number | null }> = {};
  const walk = (n: CategoryNode, parentId: number | null) => {
    out[n.id] = { node: n, parentId };
    n.children?.forEach((c) => walk(c, n.id));
  };
  nodes.forEach((n) => walk(n, null));
  return out;
}

export default function CategoryCascader({ tree, value, onChange, label = "Category *" }: Props) {
  const index = useMemo(() => flatten(tree), [tree]);

  // derive parent/sub from the leaf id
  const path = useMemo(() => {
    if (!value || !index[value]) return { p1: "", p2: "", p3: "" };
    const lvl3 = index[value];
    const p2Id = lvl3.parentId;
    const p1Id = p2Id ? index[p2Id]?.parentId ?? null : null;

    return {
      p1: p1Id ? String(p1Id) : (p2Id ? String(p2Id) : String(value)),
      p2: p2Id ? String(p2Id) : "",
      p3: String(value),
    };
  }, [value, index]);

  // options for each level
  const level1 = tree;
  const level2 = useMemo(() => {
    const id = Number(path.p1 || 0);
    const n = level1.find((x) => x.id === id);
    return n?.children ?? [];
  }, [level1, path.p1]);

  const level3 = useMemo(() => {
    const id = Number(path.p2 || 0);
    const n = level2.find((x) => x.id === id);
    return n?.children ?? [];
  }, [level2, path.p2]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Parent */}
        <Select
          value={path.p1}
          onValueChange={(v) => {
            const id = Number(v);
            const node = level1.find((n) => n.id === id);
            // if it has no children, treat as leaf
            if (!node?.children?.length) onChange(id);
            else onChange(null);
          }}
        >
          <SelectTrigger><SelectValue placeholder="Parent" /></SelectTrigger>
          <SelectContent>
            {level1.map((n) => <SelectItem key={n.id} value={String(n.id)}>{n.name}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Sub */}
        <Select
          value={path.p2}
          onValueChange={(v) => {
            const id = Number(v);
            const node = level2.find((n) => n.id === id);
            if (!node?.children?.length) onChange(id);
            else onChange(null);
          }}
        >
          <SelectTrigger><SelectValue placeholder="Sub category" /></SelectTrigger>
          <SelectContent>
            {level2.map((n) => <SelectItem key={n.id} value={String(n.id)}>{n.name}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Sub-Sub */}
        <Select
          value={path.p3}
          onValueChange={(v) => onChange(Number(v))}
        >
          <SelectTrigger><SelectValue placeholder="Sub-sub" /></SelectTrigger>
          <SelectContent>
            {level3.map((n) => <SelectItem key={n.id} value={String(n.id)}>{n.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
