// src/pages/admin/PromoBannerForm.tsx
import { useEffect, useState } from "react";
import type { PromoBanner, PromoPlacement, PromoVariant } from "@/types/promoBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { createPromoBanner, updatePromoBanner } from "@/api/promoBanners";

type Props = {
  open: boolean;
  onClose: () => void;
  banner?: PromoBanner | null; // if present -> edit
  onSaved?: (b: PromoBanner) => void;
};

export default function PromoBannerForm({ open, onClose, banner, onSaved }: Props) {
  // fields
  const [placement, setPlacement] = useState<PromoPlacement>("top");
  const [variant, setVariant] = useState<PromoVariant>("default");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("");
  const [buttonText, setButtonText] = useState("Shop Now");
  const [ctaUrl, setCtaUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [className, setClassName] = useState("");
  const [overlayClass, setOverlayClass] = useState("");
  const [isWide, setIsWide] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponText, setCouponText] = useState("");
  const [offerText, setOfferText] = useState("");
  const [mainOffer, setMainOffer] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState<string>("");
  const [endsAt, setEndsAt] = useState<string>("");
  const [sort, setSort] = useState<number>(0);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ids for a11y wiring
  const id = (name: string) => `promo_${name}`;

  useEffect(() => {
    if (banner) {
      setPlacement(banner.placement);
      setVariant(banner.variant);
      setTitle(banner.title || "");
      setSubtitle(banner.subtitle || "");
      setBadge(banner.badge || "");
      setButtonText(banner.button_text || "Shop Now");
      setCtaUrl(banner.cta_url || "");
      setImageUrl((banner as any).image_url || "");
      setClassName(banner.class_name || "");
      setOverlayClass(banner.overlay_class || "");
      setIsWide(!!banner.is_wide);
      setCouponCode(banner.coupon_code || "");
      setCouponText(banner.coupon_text || "");
      setOfferText(banner.offer_text || "");
      setMainOffer(banner.main_offer || "");
      setIsActive(!!banner.is_active);
      setStartsAt(banner.starts_at ? banner.starts_at.slice(0, 16) : ""); // for datetime-local
      setEndsAt(banner.ends_at ? banner.ends_at.slice(0, 16) : "");
      setSort(Number(banner.sort || 0));
      setImageFile(null);
    } else {
      // reset
      setPlacement("top"); setVariant("default"); setTitle(""); setSubtitle("");
      setBadge(""); setButtonText("Shop Now"); setCtaUrl(""); setImageUrl("");
      setClassName(""); setOverlayClass(""); setIsWide(false);
      setCouponCode(""); setCouponText(""); setOfferText(""); setMainOffer("");
      setIsActive(true); setStartsAt(""); setEndsAt(""); setSort(0); setImageFile(null);
    }
  }, [banner, open]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload = {
        placement, variant, title, subtitle, badge,
        button_text: buttonText,
        cta_url: ctaUrl,
        image_url: imageUrl || undefined, // allow remote URL when no file
        class_name: className,
        overlay_class: overlayClass,
        is_wide: isWide,
        coupon_code: couponCode,
        coupon_text: couponText,
        offer_text: offerText,
        main_offer: mainOffer,
        is_active: isActive,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        sort,
        image_file: imageFile ?? undefined, // multipart only when File present (api function handles this)
      };

      const saved = banner
        ? await updatePromoBanner(banner.id, payload)
        : await createPromoBanner(payload);

      onSaved?.(saved);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* wider + scrollable content for long forms */}
      <DialogContent className="max-w-4xl sm:max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{banner ? "Edit Promo Banner" : "Create Promo Banner"}</DialogTitle>
        </DialogHeader>

        {/* Grid: 12-col for crisp alignment */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-2">

          {/* Row: Placement / Variant */}
          <div className="md:col-span-6">
            <Label htmlFor={id("placement")}>Placement</Label>
            <Select value={placement} onValueChange={(v) => setPlacement(v as any)}>
              <SelectTrigger id={id("placement")} className="mt-1">
                <SelectValue placeholder="Select placement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-6">
            <Label htmlFor={id("variant")}>Variant</Label>
            <Select value={variant} onValueChange={(v) => setVariant(v as any)}>
              <SelectTrigger id={id("variant")} className="mt-1">
                <SelectValue placeholder="Select variant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="coupon">Coupon</SelectItem>
                <SelectItem value="clearance">Clearance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row: Title */}
          <div className="md:col-span-12">
            <Label htmlFor={id("title")}>Title</Label>
            <Input id={id("title")} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
          </div>

          {/* Row: Subtitle */}
          <div className="md:col-span-12">
            <Label htmlFor={id("subtitle")}>Subtitle</Label>
            <Input id={id("subtitle")} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="mt-1" />
          </div>

          {/* Row: Badge / Button Text */}
          <div className="md:col-span-6">
            <Label htmlFor={id("badge")}>Badge</Label>
            <Input id={id("badge")} value={badge} onChange={(e) => setBadge(e.target.value)} className="mt-1" />
          </div>
          <div className="md:col-span-6">
            <Label htmlFor={id("button_text")}>Button Text</Label>
            <Input id={id("button_text")} value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="mt-1" />
          </div>

          {/* Row: CTA URL */}
          <div className="md:col-span-12">
            <Label htmlFor={id("cta_url")}>CTA URL</Label>
            <Input
              id={id("cta_url")}
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="/shop?featured=1"
              className="mt-1"
            />
          </div>

          {/* Row: Image File / Image URL */}
          <div className="md:col-span-6">
            <Label htmlFor={id("image_file")}>Image File (upload)</Label>
            <Input
              id={id("image_file")}
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="mt-1"
            />
            {banner?.image && !imageFile && (
              <p className="text-xs text-muted-foreground mt-1 break-all">Current: {(banner as any).image}</p>
            )}
          </div>
          <div className="md:col-span-6">
            <Label htmlFor={id("image_url")}>Image URL (optional)</Label>
            <Input
              id={id("image_url")}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1"
            />
          </div>

          {/* Row: Class / Overlay Class */}
          <div className="md:col-span-6">
            <Label htmlFor={id("class_name")}>Class Name (Tailwind)</Label>
            <Input id={id("class_name")} value={className} onChange={(e) => setClassName(e.target.value)} className="mt-1" />
          </div>
          <div className="md:col-span-6">
            <Label htmlFor={id("overlay_class")}>Overlay Class</Label>
            <Input id={id("overlay_class")} value={overlayClass} onChange={(e) => setOverlayClass(e.target.value)} className="mt-1" />
          </div>

          {/* Row: Coupon Code / Coupon Text */}
          <div className="md:col-span-6">
            <Label htmlFor={id("coupon_code")}>Coupon Code</Label>
            <Input id={id("coupon_code")} value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="mt-1" />
          </div>
          <div className="md:col-span-6">
            <Label htmlFor={id("coupon_text")}>Coupon Text</Label>
            <Input id={id("coupon_text")} value={couponText} onChange={(e) => setCouponText(e.target.value)} className="mt-1" />
          </div>

          {/* Row: Offer Text / Main Offer */}
          <div className="md:col-span-12">
            <Label htmlFor={id("offer_text")}>Offer Text</Label>
            <Textarea id={id("offer_text")} value={offerText} onChange={(e) => setOfferText(e.target.value)} className="mt-1" />
          </div>
          <div className="md:col-span-12">
            <Label htmlFor={id("main_offer")}>Main Offer</Label>
            <Input id={id("main_offer")} value={mainOffer} onChange={(e) => setMainOffer(e.target.value)} className="mt-1" />
          </div>

          {/* Row: Switches */}
          <div className="md:col-span-6">
            <div className="flex items-center justify-between gap-4 rounded-md border border-border/50 p-3">
              <Label htmlFor={id("is_wide")} className="cursor-pointer">Wide banner</Label>
              <Switch id={id("is_wide")} checked={isWide} onCheckedChange={setIsWide} />
            </div>
          </div>
          <div className="md:col-span-6">
            <div className="flex items-center justify-between gap-4 rounded-md border border-border/50 p-3">
              <Label htmlFor={id("is_active")} className="cursor-pointer">Active</Label>
              <Switch id={id("is_active")} checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          {/* Row: Starts / Ends */}
          <div className="md:col-span-6">
            <Label htmlFor={id("starts_at")}>Starts At</Label>
            <Input
              id={id("starts_at")}
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="md:col-span-6">
            <Label htmlFor={id("ends_at")}>Ends At</Label>
            <Input
              id={id("ends_at")}
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Row: Sort */}
          <div className="md:col-span-6">
            <Label htmlFor={id("sort")}>Sort</Label>
            <Input
              id={id("sort")}
              type="number"
              value={sort}
              onChange={(e) => setSort(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          {/* filler for alignment */}
          <div className="md:col-span-6" />
        </div>

        <DialogFooter className="mt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {banner ? "Save Changes" : "Create Banner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
