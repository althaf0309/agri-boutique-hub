import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl } from "@/components/ui/form";

type Category = { id: number; name: string };

export function CategorySelect({
  value,
  onChange,
  categories,
  placeholder = "Select category (optional)",
  includeNone = true,
  filterGroceryOnly = false,
}: {
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  categories: Category[] | any[];
  placeholder?: string;
  includeNone?: boolean;
  filterGroceryOnly?: boolean;
}) {
  const safeValue = value == null ? "none" : String(value);

  const list = Array.isArray(categories) ? categories : [];
  const filtered = filterGroceryOnly
    ? list.filter((c: any) => {
        const n = (c?.name || "").toLowerCase();
        return (
          n.includes("food") ||
          n.includes("grocery") ||
          n.includes("agriculture") ||
          n.includes("vegetable") ||
          n.includes("fruit") ||
          n.includes("spice") ||
          n.includes("grain") ||
          n.includes("dairy") ||
          n.includes("beverage")
        );
      })
    : list;

  return (
    <Select
      value={safeValue}
      onValueChange={(v) => onChange(v === "none" ? null : Number(v))}
    >
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {includeNone && (
          <SelectItem value="none">{filterGroceryOnly ? "Select a category" : "No category"}</SelectItem>
        )}
        {filtered.map((cat: any) => (
          <SelectItem key={cat.id} value={String(cat.id)}>
            {cat.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
