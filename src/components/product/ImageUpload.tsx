import { useState, useCallback, useEffect, useRef } from "react";
import { Upload, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ProductImage {
  id?: number;
  image: string;              // can be URL or object URL
  is_primary: boolean;
  // Optional flag to know if this is a local preview (so we can revoke)
  __preview?: boolean;
}

interface ImageUploadProps {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
  productId?: number;
  maxSizeMB?: number;         // default 10MB
  accept?: string;            // default "image/*"
}

export function ImageUpload({
  images,
  onImagesChange,
  onUpload,
  productId,
  maxSizeMB = 10,
  accept = "image/*",
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Track created object URLs so we can revoke them on unmount
  const createdUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      // cleanup on unmount
      createdUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      createdUrlsRef.current = [];
    };
  }, []);

  const validateFiles = (files: File[]) => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const tooLarge = imageFiles.filter((f) => f.size > maxBytes);

    if (imageFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please select image files only.",
        variant: "destructive",
      });
      return { ok: false, filtered: [] as File[] };
    }
    if (tooLarge.length) {
      toast({
        title: "File too large",
        description: `Each image must be ≤ ${maxSizeMB} MB.`,
        variant: "destructive",
      });
      return { ok: false, filtered: [] as File[] };
    }
    return { ok: true, filtered: imageFiles };
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      (e.dataTransfer as DataTransfer).dropEffect = "copy";
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length) {
      handleFiles(Array.from(e.target.files));
      // reset so same file re-select triggers onChange
      e.currentTarget.value = "";
    }
  }, []);

  const handleFiles = async (files: File[]) => {
    const { ok, filtered } = validateFiles(files);
    if (!ok) return;

    setUploading(true);
    try {
      if (onUpload) {
        await onUpload(filtered);
      } else {
        // Create preview URLs for new images
        const newImages = filtered.map((file, idx) => {
          const url = URL.createObjectURL(file);
          createdUrlsRef.current.push(url);
          return {
            image: url,
            is_primary: images.length === 0 && idx === 0,
            __preview: true,
          } as ProductImage;
        });

        // Ensure only one primary overall
        const combined = [...images, ...newImages];
        const hasPrimary = combined.some((im) => im.is_primary);
        if (!hasPrimary && combined.length) combined[0].is_primary = true;

        onImagesChange(combined);
      }

      toast({
        title: "Images uploaded",
        description: `${filtered.length} image(s) uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload images.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const setPrimary = (index: number) => {
    const updated = images.map((img, i) => ({ ...img, is_primary: i === index }));
    onImagesChange(updated);
  };

  const removeImage = (index: number) => {
    const toRemove = images[index];
    // Revoke object URL if it's a local preview we created
    if (toRemove?.__preview && toRemove.image.startsWith("blob:")) {
      URL.revokeObjectURL(toRemove.image);
      createdUrlsRef.current = createdUrlsRef.current.filter((u) => u !== toRemove.image);
    }

    const updated = images.filter((_, i) => i !== index);
    // If we removed the primary image and there are still images, make the first one primary
    if (toRemove?.is_primary && updated.length > 0) {
      updated[0] = { ...updated[0], is_primary: true };
      // also reset others to non-primary just to be safe
      for (let i = 1; i < updated.length; i++) updated[i].is_primary = false;
    }
    onImagesChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("image-upload")?.click()}
        role="button"
        aria-label="Upload images"
      >
        <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop images here, or click to browse
        </p>
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleChange}
          className="hidden"
          id="image-upload"
        />
        <Button variant="outline" size="sm" disabled={uploading} asChild>
          <label htmlFor="image-upload" className="cursor-pointer">
            {uploading ? "Uploading..." : "Add Images"}
          </label>
        </Button>
        <div className="mt-2 text-xs text-muted-foreground">Max size: {maxSizeMB}MB per image</div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div key={img.id ?? `${img.image}-${index}`} className="relative group">
              <div className="aspect-square overflow-hidden rounded border">
                <img
                  src={img.image}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                {img.is_primary && (
                  <Badge variant="default" className="text-xs">
                    Primary
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                {!img.is_primary && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPrimary(index)}
                    className="h-6 w-6 p-0"
                    title="Set as primary"
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="h-6 w-6 p-0"
                  title="Remove image"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Primary Image Button */}
              {!img.is_primary && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute bottom-2 left-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setPrimary(index)}
                >
                  Set as Primary
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
