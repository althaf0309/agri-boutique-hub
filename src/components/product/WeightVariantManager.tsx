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

interface WeightVariant {
  id: string;
  weight: string; // numeric in string
  unit: "G" | "KG" | "ML" | "L";
  price: string; // numeric in string
  stock: number;
  sku: string;
  isActive: boolean;
}

interface WeightVariantManagerProps {
  variants: WeightVariant[];
  onVariantsChange: (variants: WeightVariant[]) => void;
  productName: string;
}

const WEIGHT_UNITS = [
  { value: "G", label: "Grams (G)" },
  { value: "KG", label: "Kilograms (KG)" },
  { value: "ML", label: "Milliliters (ML)" },
  { value: "L", label: "Liters (L)" },
];

const COMMON_WEIGHTS = {
  G: ["50", "100", "250", "500", "750"],
  KG: ["1", "2", "5", "10", "25"],
  ML: ["250", "500", "750"],
  L: ["1", "2", "5"],
};

export function WeightVariantManager({
  variants,
  onVariantsChange,
  productName,
}: WeightVariantManagerProps) {
  const [newWeight, setNewWeight] = useState("");
  const [newUnit, setNewUnit] = useState<"G" | "KG" | "ML" | "L">("KG");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const { toast } = useToast();

  const baseSlug = useMemo(
    () => productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    [productName]
  );

  const generateSKU = (weight: string, unit: string) => {
    return `${baseSlug}-${weight}${unit.toLowerCase()}`;
  };

  // Regenerate SKUs if productName (slug) changes
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
      toast({
        title: "Missing information",
        description: "Please fill in weight, price, and stock",
        variant: "destructive",
      });
      return;
    }

    // basic numeric validation
    const wNum = parseFloat(newWeight);
    const pNum = parseFloat(newPrice);
    const sNum = parseInt(newStock, 10);

    if (!isFinite(wNum) || wNum <= 0 || !isFinite(pNum) || pNum < 0 || !Number.isFinite(sNum) || sNum < 0) {
      toast({
        title: "Invalid values",
        description: "Weight must be > 0, price ≥ 0, stock ≥ 0.",
        variant: "destructive",
      });
      return;
    }

    // Check if variant already exists
    const exists = variants.find((v) => v.weight === newWeight && v.unit === newUnit);
    if (exists) {
      toast({
        title: "Variant exists",
        description: `${newWeight}${newUnit} variant already exists`,
        variant: "destructive",
      });
      return;
    }

    const newVariant: WeightVariant = {
      id: `${Date.now()}`,
      weight: newWeight,
      unit: newUnit,
      price: newPrice,
      stock: sNum,
      sku: generateSKU(newWeight, newUnit),
      isActive: true,
    };

    onVariantsChange([...variants, newVariant]);

    // Reset form
    setNewWeight("");
    setNewPrice("");
    setNewStock("");

    toast({
      title: "Variant added",
      description: `${newWeight}${newUnit} variant created successfully`,
    });
  };

  const updateVariant = (id: string, field: keyof WeightVariant, value: any) => {
    const updated = variants.map((v) => {
      if (v.id !== id) return v;
      const next = { ...v, [field]: value };
      if (field === "weight" || field === "unit") {
        next.sku = generateSKU(next.weight, next.unit);
      }
      if (field === "stock") {
        const num = Number(value);
        next.stock = Number.isFinite(num) && num >= 0 ? num : 0;
      }
      return next;
    });
    onVariantsChange(updated);
  };

  const removeVariant = (id: string) => {
    onVariantsChange(variants.filter((v) => v.id !== id));
    toast({ title: "Variant removed", description: "Weight variant has been removed" });
  };

  const addQuickWeight = (weight: string, unit: "G" | "KG" | "ML" | "L") => {
    setNewWeight(weight);
    setNewUnit(unit);
  };

  const calculatePricePerKg = (price: string, weight: string, unit: string) => {
    const priceNum = parseFloat(price);
    const weightNum = parseFloat(weight);
    if (!isFinite(priceNum) || !isFinite(weightNum) || weightNum <= 0) return "—";

    let weightInKg = weightNum;
    if (unit === "G") weightInKg = weightNum / 1000;
    else if (unit === "ML") weightInKg = weightNum / 1000; // density-agnostic approx
    else if (unit === "L") weightInKg = weightNum; // approx
    // KG stays as is

    const pricePerKg = priceNum / weightInKg;
    return `₹${pricePerKg.toFixed(2)}/kg`;
  };

  const totalStock = variants.reduce((t, v) => t + (Number.isFinite(v.stock) ? v.stock : 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Weight className="h-5 w-5" />
          Weight Variants & Pricing
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add different weight options with individual pricing and stock levels
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Weight Options */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Quick Add Common Weights</Label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {WEIGHT_UNITS.map((unit) => (
              <div key={unit.value} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{unit.label}</Label>
                <div className="flex flex-wrap gap-1">
                  {COMMON_WEIGHTS[unit.value as keyof typeof COMMON_WEIGHTS].map((w) => (
                    <Button
                      key={`${w}-${unit.value}`}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => addQuickWeight(w, unit.value as any)}
                    >
                      {w}
                      {unit.value}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Add New Variant Form */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Add Weight Variant</Label>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Weight</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="1.0"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Unit</Label>
              <Select value={newUnit} onValueChange={(v: any) => setNewUnit(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEIGHT_UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Price (₹)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="199.00"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Stock</Label>
              <Input
                type="number"
                placeholder="50"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addVariant} className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Existing Variants */}
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
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 items-center">
                      <div>
                        <Label className="text-xs text-muted-foreground">Weight</Label>
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            step="0.01"
                            value={variant.weight}
                            onChange={(e) => updateVariant(variant.id, "weight", e.target.value)}
                            className="h-8"
                          />
                          <Select
                            value={variant.unit}
                            onValueChange={(v) => updateVariant(variant.id, "unit", v)}
                          >
                            <SelectTrigger className="h-8 w-16">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {WEIGHT_UNITS.map((u) => (
                                <SelectItem key={u.value} value={u.value}>
                                  {u.value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Price (₹)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => updateVariant(variant.id, "price", e.target.value)}
                          className="h-8"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Stock</Label>
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) =>
                            updateVariant(variant.id, "stock", parseInt(e.target.value, 10) || 0)
                          }
                          className="h-8"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Price/KG</Label>
                        <div className="text-sm font-medium text-green-600">
                          {calculatePricePerKg(variant.price, variant.weight, variant.unit)}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">SKU</Label>
                        <Input
                          value={variant.sku}
                          onChange={(e) => updateVariant(variant.id, "sku", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={variant.isActive ? "default" : "secondary"}>
                          {variant.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(variant.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Remove"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        <strong>
                          {variant.weight}
                          {variant.unit}
                        </strong>{" "}
                        - ₹{variant.price}
                      </span>
                      <span>•</span>
                      <span>Stock: {variant.stock} units</span>
                      <span>•</span>
                      <span>{calculatePricePerKg(variant.price, variant.weight, variant.unit)}</span>
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
