import { useState } from "react";
import { Plus, X, Weight, DollarSign, Package2 } from "lucide-react";
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
  weight: string;
  unit: "G" | "KG" | "ML" | "L";
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
  productName 
}: WeightVariantManagerProps) {
  const [newWeight, setNewWeight] = useState("");
  const [newUnit, setNewUnit] = useState<"G" | "KG" | "ML" | "L">("KG");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const { toast } = useToast();

  const generateSKU = (weight: string, unit: string) => {
    const baseSlug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `${baseSlug}-${weight}${unit.toLowerCase()}`;
  };

  const addVariant = () => {
    if (!newWeight || !newPrice || !newStock) {
      toast({
        title: "Missing information",
        description: "Please fill in weight, price, and stock",
        variant: "destructive"
      });
      return;
    }

    // Check if variant already exists
    const existingVariant = variants.find(v => 
      v.weight === newWeight && v.unit === newUnit
    );

    if (existingVariant) {
      toast({
        title: "Variant exists",
        description: `${newWeight}${newUnit} variant already exists`,
        variant: "destructive"
      });
      return;
    }

    const newVariant: WeightVariant = {
      id: Date.now().toString(),
      weight: newWeight,
      unit: newUnit,
      price: newPrice,
      stock: parseInt(newStock),
      sku: generateSKU(newWeight, newUnit),
      isActive: true
    };

    onVariantsChange([...variants, newVariant]);
    
    // Reset form
    setNewWeight("");
    setNewPrice("");
    setNewStock("");

    toast({
      title: "Variant added",
      description: `${newWeight}${newUnit} variant created successfully`
    });
  };

  const updateVariant = (id: string, field: keyof WeightVariant, value: any) => {
    const updatedVariants = variants.map(variant => {
      if (variant.id === id) {
        const updated = { ...variant, [field]: value };
        // Regenerate SKU if weight or unit changes
        if (field === 'weight' || field === 'unit') {
          updated.sku = generateSKU(updated.weight, updated.unit);
        }
        return updated;
      }
      return variant;
    });
    onVariantsChange(updatedVariants);
  };

  const removeVariant = (id: string) => {
    const updatedVariants = variants.filter(variant => variant.id !== id);
    onVariantsChange(updatedVariants);
    
    toast({
      title: "Variant removed",
      description: "Weight variant has been removed"
    });
  };

  const addQuickWeight = (weight: string, unit: "G" | "KG" | "ML" | "L") => {
    setNewWeight(weight);
    setNewUnit(unit);
  };

  const calculatePricePerKg = (price: string, weight: string, unit: string) => {
    const priceNum = parseFloat(price);
    const weightNum = parseFloat(weight);
    
    if (!priceNum || !weightNum) return "—";
    
    let weightInKg = weightNum;
    if (unit === "G") weightInKg = weightNum / 1000;
    else if (unit === "ML") weightInKg = weightNum / 1000; // Approximate for liquids
    else if (unit === "L") weightInKg = weightNum; // Approximate for liquids
    
    const pricePerKg = priceNum / weightInKg;
    return `₹${pricePerKg.toFixed(2)}/kg`;
  };

  const getTotalStock = () => {
    return variants.reduce((total, variant) => total + variant.stock, 0);
  };

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
            {WEIGHT_UNITS.map(unit => (
              <div key={unit.value} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{unit.label}</Label>
                <div className="flex flex-wrap gap-1">
                  {COMMON_WEIGHTS[unit.value as keyof typeof COMMON_WEIGHTS].map(weight => (
                    <Button
                      key={`${weight}-${unit.value}`}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => addQuickWeight(weight, unit.value as any)}
                    >
                      {weight}{unit.value}
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
              <Select value={newUnit} onValueChange={(value: any) => setNewUnit(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEIGHT_UNITS.map(unit => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.value}
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
        {variants.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Weight Variants ({variants.length})</Label>
                <Badge variant="outline" className="gap-1">
                  <Package2 className="h-3 w-3" />
                  Total Stock: {getTotalStock()}
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
                            onChange={(e) => updateVariant(variant.id, 'weight', e.target.value)}
                            className="h-8"
                          />
                          <Select 
                            value={variant.unit} 
                            onValueChange={(value) => updateVariant(variant.id, 'unit', value)}
                          >
                            <SelectTrigger className="h-8 w-16">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {WEIGHT_UNITS.map(unit => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.value}
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
                          onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                          className="h-8"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Stock</Label>
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
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
                          onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
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
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Variant Summary */}
                    <div className="mt-3 pt-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        <strong>{variant.weight}{variant.unit}</strong> - ₹{variant.price}
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
        )}

        {variants.length === 0 && (
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
