// src/pages/admin/PromoBannersPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";

import type { PromoBanner, PromoPlacement, PromoVariant } from "@/types/promoBanner";
import { fetchPromoBanners, deletePromoBanner } from "@/api/promoBanners";
import PromoBannerForm from "@/pages/admin/PromoBannerForm";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_BASE } from "@/api/client";

// Convert possible relative media paths to absolute, and pick the best field.
function resolveImageUrl(b: PromoBanner): string | null {
  const candidates: Array<string | undefined | null> = [
    (b as any).image_url,   // explicit URL field
    (b as any).image,       // backend may return absolute/relative
  ];
  const first = candidates.find(Boolean);
  if (!first) return null;

  const url = String(first);
  if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) return url;

  // API_BASE often ends with /api — strip to origin for media prefixing
  const ORIGIN = API_BASE.replace(/\/api\/?$/i, "");
  return url.startsWith("/") ? `${ORIGIN}${url}` : `${ORIGIN}/${url}`;
}

export default function PromoBannersPage() {
  const [data, setData] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(false);

  // Search / filters
  const [q, setQ] = useState("");
  const [placement, setPlacement] = useState<PromoPlacement | undefined>(undefined);
  const [variant, setVariant] = useState<PromoVariant | undefined>(undefined);
  const [active, setActive] = useState<true | false | undefined>(undefined);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PromoBanner | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchPromoBanners();
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleSaved(saved: PromoBanner) {
    setData((prev) => {
      const i = prev.findIndex((p) => p.id === saved.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this banner?")) return;
    await deletePromoBanner(id);
    setData((prev) => prev.filter((x) => x.id !== id));
  }

  const filtered = useMemo(() => {
    return data
      .filter((b) => {
        if (q && !`${b.title} ${b.subtitle} ${b.badge} ${b.coupon_code}`.toLowerCase().includes(q.toLowerCase())) {
          return false;
        }
        if (placement && b.placement !== placement) return false;
        if (variant && b.variant !== variant) return false;
        if (active !== undefined && Boolean(b.is_active) !== active) return false;
        return true;
      })
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.id - b.id);
  }, [data, q, placement, variant, active]);

  return (
    <div className="p-4 sm:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Promo Banners</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> New Banner
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
            <Input
              placeholder="Search title / subtitle / coupon…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            {/* Placement filter (no empty value) */}
            <Select
              value={placement ?? undefined}
              onValueChange={(v) => setPlacement(v === "all" ? undefined : (v as PromoPlacement))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Placement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectContent>
            </Select>

            {/* Variant filter (no empty value) */}
            <Select
              value={variant ?? undefined}
              onValueChange={(v) => setVariant(v === "all" ? undefined : (v as PromoVariant))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Variant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="coupon">Coupon</SelectItem>
                <SelectItem value="clearance">Clearance</SelectItem>
              </SelectContent>
            </Select>

            {/* Active filter (no empty value) */}
            <Select
              value={active === undefined ? undefined : active ? "1" : "0"}
              onValueChange={(v) => setActive(v === "all" ? undefined : v === "1")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Active" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="1">Active</SelectItem>
                <SelectItem value="0">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden md:block" />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sort</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Title / Subtitle</TableHead>
                  <TableHead>Placement</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => {
                  const img = resolveImageUrl(b);
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="whitespace-nowrap">{b.sort ?? 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {img ? (
                            <img src={img} alt={b.title} className="h-10 w-16 object-cover rounded" />
                          ) : (
                            <div className="h-10 w-16 bg-muted rounded" />
                          )}
                          <div className="text-xs text-muted-foreground max-w-[220px] truncate">{b.cta_url}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{b.title}</div>
                        <div className="text-xs text-muted-foreground">{b.subtitle}</div>
                      </TableCell>
                      <TableCell className="capitalize">{b.placement}</TableCell>
                      <TableCell className="capitalize">{b.variant}</TableCell>
                      <TableCell>
                        {b.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => { setEditing(b); setFormOpen(true); }}
                            aria-label={`Edit ${b.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(b.id)}
                            aria-label={`Delete ${b.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {!filtered.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {loading ? "Loading…" : "No banners found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PromoBannerForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        banner={editing}
        onSaved={handleSaved}
      />
    </div>
  );
}
