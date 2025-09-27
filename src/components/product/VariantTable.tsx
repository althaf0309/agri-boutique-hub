import { useState } from "react";
import { Edit, Trash2, Image as ImageIcon, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Variant {
  id?: number;
  sku: string;
  attributes: Record<string, string>;
  quantity: number;
  price_override?: string | null;
  discount_override?: number | null;
  is_active: boolean;
  weight_value?: string | null;
  weight_unit?: "G" | "KG" | "ML" | "L" | null;
  color_id?: number | null;
  mrp?: string | null;
  barcode?: string;
  min_order_qty: number;
  step_qty: number;
}

interface VariantTableProps {
  control: any; // unused here but kept for API parity
  variants: Variant[];
  onVariantChange: (index: number, field: string, value: any) => void;
  onRemoveVariant: (index: number) => void;
  onBulkEdit: (field: string, value: any) => void;
}

export function VariantTable({
  control,
  variants,
  onVariantChange,
  onRemoveVariant,
  onBulkEdit,
}: VariantTableProps) {
  const [selectedVariants, setSelectedVariants] = useState<number[]>([]);
  const [bulkEditField, setBulkEditField] = useState("");
  const [bulkEditValue, setBulkEditValue] = useState("");
  const { toast } = useToast();

  const selectAllVariants = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedVariants(variants.map((_, index) => index));
    } else {
      setSelectedVariants([]);
    }
  };

  const toggleVariantSelection = (index: number) => {
    setSelectedVariants((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const applyBulkEdit = () => {
    if (!bulkEditField || selectedVariants.length === 0) return;

    selectedVariants.forEach((index) => {
      if (bulkEditField === "is_active") {
        const boolVal = bulkEditValue === "true" || bulkEditValue === "1";
        onVariantChange(index, "is_active", boolVal);
      } else if (bulkEditField === "quantity") {
        onVariantChange(index, "quantity", Number(bulkEditValue) || 0);
      } else if (bulkEditField === "discount_override") {
        onVariantChange(
          index,
          "discount_override",
          bulkEditValue === "" ? null : Number(bulkEditValue)
        );
      } else if (bulkEditField === "price_override") {
        onVariantChange(
          index,
          "price_override",
          bulkEditValue === "" ? null : bulkEditValue
        );
      }
    });

    onBulkEdit(bulkEditField, bulkEditValue);
    setSelectedVariants([]);
    setBulkEditField("");
    setBulkEditValue("");
    toast({ title: "Bulk edit applied" });
  };

  const duplicateVariant = (index: number) => {
    // This table doesn't own the variants array; inform parent to add one instead.
    // For now, just notify.
    toast({
      title: "Duplicate variant",
      description: "Implement duplication in parent: add a new variant based on this row.",
    });
  };

  const allChecked = selectedVariants.length === variants.length && variants.length > 0;

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedVariants.length > 0 && (
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">
              {selectedVariants.length} variants selected
            </span>

            <Select value={bulkEditField} onValueChange={setBulkEditField}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Edit field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quantity">Quantity</SelectItem>
                <SelectItem value="price_override">Price</SelectItem>
                <SelectItem value="discount_override">Discount</SelectItem>
                <SelectItem value="is_active">Status</SelectItem>
              </SelectContent>
            </Select>

            {bulkEditField === "is_active" ? (
              <Select value={bulkEditValue} onValueChange={setBulkEditValue}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder={bulkEditField === "price_override" ? "Auto" : "Value"}
                value={bulkEditValue}
                onChange={(e) => setBulkEditValue(e.target.value)}
                className="w-28"
              />
            )}

            <Button size="sm" onClick={applyBulkEdit}>
              Apply
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedVariants([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Variants Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox checked={allChecked} onCheckedChange={selectAllVariants} />
              </TableHead>
              <TableHead className="w-32">SKU</TableHead>
              <TableHead>Attributes</TableHead>
              <TableHead className="w-20">Qty</TableHead>
              <TableHead className="w-24">Price Override</TableHead>
              <TableHead className="w-20">Discount %</TableHead>
              <TableHead className="w-20">Weight</TableHead>
              <TableHead className="w-20">Unit</TableHead>
              <TableHead className="w-20">Active</TableHead>
              <TableHead className="w-20">Images</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant, index) => (
              <TableRow key={variant.id ?? index}>
                <TableCell>
                  <Checkbox
                    checked={selectedVariants.includes(index)}
                    onCheckedChange={() => toggleVariantSelection(index)}
                  />
                </TableCell>

                <TableCell>
                  <Input
                    value={variant.sku}
                    onChange={(e) => onVariantChange(index, "sku", e.target.value)}
                    className="h-8"
                  />
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(variant.attributes || {}).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key}: {value}
                      </Badge>
                    ))}
                    {Object.keys(variant.attributes || {}).length === 0 && (
                      <span className="text-xs text-muted-foreground">No attributes</span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <Input
                    type="number"
                    value={variant.quantity}
                    onChange={(e) => onVariantChange(index, "quantity", Number(e.target.value) || 0)}
                    className="h-8"
                    min="0"
                  />
                </TableCell>

                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={variant.price_override ?? ""}
                    onChange={(e) =>
                      onVariantChange(index, "price_override", e.target.value === "" ? null : e.target.value)
                    }
                    className="h-8"
                    placeholder="Auto"
                  />
                </TableCell>

                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={variant.discount_override ?? ""}
                    onChange={(e) =>
                      onVariantChange(
                        index,
                        "discount_override",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                    className="h-8"
                    placeholder="Auto"
                  />
                </TableCell>

                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={variant.weight_value ?? ""}
                    onChange={(e) =>
                      onVariantChange(index, "weight_value", e.target.value === "" ? null : e.target.value)
                    }
                    className="h-8"
                  />
                </TableCell>

                <TableCell>
                  <Select
                    value={variant.weight_unit ?? "none"}
                    onValueChange={(value) =>
                      onVariantChange(index, "weight_unit", value === "none" ? null : (value as Variant["weight_unit"]))
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="G">G</SelectItem>
                      <SelectItem value="KG">KG</SelectItem>
                      <SelectItem value="ML">ML</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>

                <TableCell>
                  <Switch
                    checked={variant.is_active}
                    onCheckedChange={(checked) => onVariantChange(index, "is_active", !!checked)}
                  />
                </TableCell>

                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Manage variant images">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Variant Images — {variant.sku}</DialogTitle>
                      </DialogHeader>
                      <div className="text-center py-8 text-muted-foreground">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                        <p>Variant image management coming soon</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>

                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => duplicateVariant(index)}
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onRemoveVariant(index)}
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {variants.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No variants yet. Add options first, then generate variants or add manually.</p>
        </div>
      )}
    </div>
  );
}
