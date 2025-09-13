import { useState, useCallback } from "react";
import { Upload, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ProductImage {
  id?: number;
  image: string;
  is_primary: boolean;
}

interface ImageUploadProps {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
  productId?: number;
}

export function ImageUpload({ images, onImagesChange, onUpload, productId }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  }, []);

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please select image files only",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      if (onUpload) {
        await onUpload(imageFiles);
      } else {
        // Create preview URLs for new images
        const newImages = imageFiles.map(file => ({
          image: URL.createObjectURL(file),
          is_primary: images.length === 0
        }));
        onImagesChange([...images, ...newImages]);
      }
      
      toast({
        title: "Images uploaded",
        description: `${imageFiles.length} image(s) uploaded successfully`
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload images",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const setPrimary = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index
    }));
    onImagesChange(updatedImages);
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    // If we removed the primary image and there are still images, make the first one primary
    if (images[index].is_primary && updatedImages.length > 0) {
      updatedImages[0].is_primary = true;
    }
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop images here, or click to browse
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          id="image-upload"
        />
        <Button 
          variant="outline" 
          size="sm" 
          asChild
          disabled={uploading}
        >
          <label htmlFor="image-upload" className="cursor-pointer">
            {uploading ? "Uploading..." : "Add Images"}
          </label>
        </Button>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div key={img.id || index} className="relative group">
              <div className="aspect-square overflow-hidden rounded border">
                <img 
                  src={img.image} 
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
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
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                )}
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="h-6 w-6 p-0"
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