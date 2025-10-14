import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function ProductQuickView({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: any | null;
}) {
  if (!product) return null;

  const image =
    product.primary_image_url ||
    product.primary_image?.image ||
    (Array.isArray(product.images) && (product.images.find((im: any) => im.is_primary)?.image || product.images[0]?.image));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate">{product.name}</span>
            <span className="text-xs text-muted-foreground">#{product.id}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="aspect-video rounded border overflow-hidden bg-muted">
            {image ? <img src={image} alt={product.name} className="w-full h-full object-cover" /> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.featured && <Badge>Featured</Badge>}
            {product.new_arrival && <Badge variant="secondary">New</Badge>}
            {product.is_organic && <Badge variant="outline">Organic</Badge>}
            {product.is_perishable && <Badge variant="outline">Perishable</Badge>}
          </div>
          <div className="text-sm text-muted-foreground line-clamp-4" dangerouslySetInnerHTML={{ __html: product.description || "" }} />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Category:</span> {product.category?.name || "-"}</div>
            <div><span className="text-muted-foreground">Stock:</span> {product.quantity ?? 0}</div>
            <div><span className="text-muted-foreground">Price:</span> ₹{Number(product.price_inr ?? 0).toFixed(2)}</div>
            <div><span className="text-muted-foreground">Discount:</span> {Number(product.discount_percent ?? 0)}%</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
