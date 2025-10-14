import { useEffect, useMemo, useState } from "react";
import { Plus, X, Weight, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export type Unit = "G" | "KG" | "ML" | "L";

export interface WeightVariant {
  id: string;
  weight: string;
  unit: Unit;
  price: string;
  stock: number;
  sku: string;
  isActive: boolean;
}

interface WeightVariantManagerProps {
  variants: WeightVariant[];
  onVariantsChange: (variants: WeightVariant[]) => void;
  productName: string;
}

const WEIGHT_UNITS: { value: Unit; label: string }[] = [
  { value: "G", label: "Grams (G)" },
  { value: "KG", label: "Kilograms (KG)" },
  { value: "ML", label: "Milliliters (ML)" },
  { value: "L", label: "Liters (L)" },
];

const COMMON_WEIGHTS: Record<Unit, string[]> = {
  G: ["50", "100", "250", "500", "750"],
  KG: ["1", "2", "5", "10", "25"],
  ML: ["250", "500", "750"],
  L: ["1", "2", "5"],
};

function formatINR(n: number) {
  try {
    return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
  } catch {
    return `₹${n.toFixed(2)}`;
  }
}

export function WeightVariantManager({
  variants,
  onVariantsChange,
  productName,
}: WeightVariantManagerProps) {
  const [newWeight, setNewWeight] = useState("");
  const [newUnit, setNewUnit] = useState<Unit>("KG");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const { toast } = useToast();

  const baseSlug = useMemo(
    () =>
      (productName || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    [productName]
  );

  const generateSKU = (weight: string, unit: Unit) => {
    const w = (String(weight) || "").trim();
    const u = String(unit || "").toLowerCase();
    return baseSlug ? `${baseSlug}-${w}${u}` : `${w}${u}`;
  };

  useEffect(() => {
    if (!variants.length) return;
    const updated = variants.map((v) => ({
      ...v,
      sku: generateSKU(v.weight, v.unit),
    }));
    onVariantsChange(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseSlug]);

  const addVariant = () => {
    if (!newWeight || !newPrice || !newStock) {
      toast({ title: "Missing information", description: "Please fill in weight, price, and stock.", variant: "destructive" });
      return;
    }
    const wNum = parseFloat(newWeight);
    const pNum = parseFloat(newPrice);
    const sNum = Number.parseInt(newStock, 10);
    if (!Number.isFinite(wNum) || wNum <= 0 || !Number.isFinite(pNum) || pNum < 0 || !Number.isFinite(sNum) || sNum < 0) {
      toast({ title: "Invalid values", description: "Weight must be > 0, price ≥ 0, stock ≥ 0.", variant: "destructive" });
      return;
    }
    const exists = variants.some(
      (v) => v.unit.toUpperCase() === newUnit.toUpperCase() && String(v.weight).trim() === String(newWeight).trim()
    );
    if (exists) {
      toast({ title: "Variant exists", description: `${newWeight}${newUnit} variant already exists.`, variant: "destructive" });
      return;
    }
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
    const newVariant: WeightVariant = {
      id,
      weight: newWeight,
      unit: newUnit,
      price: newPrice,
      stock: sNum,
      sku: generateSKU(newWeight, newUnit),
      isActive: true,
    };
    onVariantsChange([...variants, newVariant]);
    setNewWeight("");
    setNewPrice("");
    setNewStock("");
    toast({ title: "Variant added", description: `${newWeight}${newUnit} variant created successfully.` });
  };

  const updateVariant = (id: string, field: keyof WeightVariant, value: unknown) => {
    const updated = variants.map((v) => {
      if (v.id !== id) return v;
      const next: WeightVariant = { ...v } as WeightVariant;
      if (field === "stock") {
        const num = Number(value);
        next.stock = Number.isFinite(num) && num >= 0 ? num : 0;
      } else if (field === "unit") {
        next.unit = value as Unit;
        next.sku = generateSKU(next.weight, next.unit);
      } else if (field === "weight") {
        next.weight = String(value ?? "");
        next.sku = generateSKU(next.weight, next.unit);
      } else if (field === "price") {
        next.price = String(value ?? "");
      } else if (field === "sku") {
        next.sku = String(value ?? "");
      } else if (field === "isActive") {
        next.isActive = Boolean(value);
      }
      return next;
    });
    onVariantsChange(updated);
  };

  const removeVariant = (id: string) => {
    onVariantsChange(variants.filter((v) => v.id !== id));
    toast({ title: "Variant removed", description: "Weight variant has been removed." });
  };

  const addQuickWeight = (weight: string, unit: Unit) => {
    setNewWeight(weight);
    setNewUnit(unit);
  };

  const pricePerUnit = (price: string, weight: string, unit: Unit) => {
    const priceNum = parseFloat(price);
    const weightNum = parseFloat(weight);
    if (!Number.isFinite(priceNum) || !Number.isFinite(weightNum) || weightNum <= 0) return "—";
    if (unit === "G" || unit === "KG") {
      const kg = unit === "KG" ? weightNum : weightNum / 1000;
      const value = priceNum / kg;
      return `${formatINR(value)}/kg`;
    }
    if (unit === "ML" || unit === "L") {
      const l = unit === "L" ? weightNum : weightNum / 1000;
      const value = priceNum / l;
      return `${formatINR(value)}/L`;
    }
    return "—";
  };

  const totalStock = variants.reduce((t, v) => t + (Number.isFinite(v.stock as any) ? v.stock : 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Weight className="h-5 w-5" />
          Weight Variants & Pricing
        </CardTitle>
        <p className="text-sm text-muted-foreground">Add different weight options with individual pricing and stock levels.</p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium mb-2 block">Quick Add Common Weights</Label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {WEIGHT_UNITS.map((unit) => (
              <div key={unit.value} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{unit.label}</Label>
                <div className="flex flex-wrap gap-1">
                  {COMMON_WEIGHTS[unit.value].map((w) => (
                    <Button
                      key={`${w}-${unit.value}`}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => addQuickWeight(w, unit.value)}
                    >
                      {w}{unit.value}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label className="text-sm font-medium">Add Weight Variant</Label>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Weight</Label>
              <Input type="number" step="0.01" min="0" placeholder="1.0" value={newWeight ?? ""} onChange={(e) => setNewWeight(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Unit</Label>
              <Select value={newUnit} onValueChange={(v: Unit) => setNewUnit(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WEIGHT_UNITS.map((u) => <SelectItem key={u.value} value={u.value}>{u.value}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Price (₹)</Label>
              <Input type="number" step="0.01" min="0" placeholder="199.00" value={newPrice ?? ""} onChange={(e) => setNewPrice(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Stock</Label>
              <Input type="number" min="0" placeholder="50" value={newStock ?? ""} onChange={(e) => setNewStock(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={addVariant} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>

        {variants.length > 0 ? (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Weight Variants ({variants.length})</Label>
                <Badge variant="outline" className="gap-1">
                  <Package2 className="h-3 w-3" />
                  Total Stock: {totalStock}
                </Badge>
              </div>

              <div className="space-y-3">
                {variants.map((variant) => (
                  <Card key={variant.id} className="p-4">
                    <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 items-center">
                      <div>
                        <Label className="text-xs text-muted-foreground">Weight</Label>
                        <div className="flex gap-1">
                          <Input type="number" step="0.01" min="0" value={variant.weight ?? ""} onChange={(e) => updateVariant(variant.id, "weight", e.target.value)} className="h-8" />
                          <Select value={variant.unit} onValueChange={(v: Unit) => updateVariant(variant.id, "unit", v)}>
                            <SelectTrigger className="h-8 w-16"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {WEIGHT_UNITS.map((u) => <SelectItem key={u.value} value={u.value}>{u.value}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Price (₹)</Label>
                        <Input type="number" step="0.01" min="0" value={variant.price ?? ""} onChange={(e) => updateVariant(variant.id, "price", e.target.value)} className="h-8" />
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Stock</Label>
                        <Input type="number" min="0" value={Number.isFinite(variant.stock as any) ? variant.stock : 0} onChange={(e) => updateVariant(variant.id, "stock", parseInt(e.target.value, 10) || 0)} className="h-8" />
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Price / Unit</Label>
                        <div className="text-sm font-medium text-green-600">{pricePerUnit(variant.price, variant.weight, variant.unit)}</div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">SKU</Label>
                        <Input value={variant.sku ?? ""} onChange={(e) => updateVariant(variant.id, "sku", e.target.value)} className="h-8 text-xs" />
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={variant.isActive ? "default" : "secondary"}>{variant.isActive ? "Active" : "Inactive"}</Badge>
                        <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => updateVariant(variant.id, "isActive", !variant.isActive)}>
                          {variant.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>

                      <div className="flex items-center justify-end">
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(variant.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive" title="Remove">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t flex flex-wrap gap-3 items-center text-xs text-muted-foreground">
                      <span><strong>{variant.weight}{variant.unit}</strong> – {formatINR(parseFloat(variant.price || "0"))}</span>
                      <span>•</span>
                      <span>Stock: {variant.stock} units</span>
                      <span>•</span>
                      <span>{pricePerUnit(variant.price, variant.weight, variant.unit)}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Weight className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No weight variants added yet</p>
            <p className="text-xs">Add different weight options with individual pricing</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WeightVariantManager;
