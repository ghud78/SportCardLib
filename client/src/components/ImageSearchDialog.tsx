import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ImageSearchDialogProps {
  open: boolean;
  onClose: () => void;
  imageUrls: string[];
  searchQuery: string;
  onSelectFront: (url: string) => void;
  onSelectBack: (url: string) => void;
}

export function ImageSearchDialog({
  open,
  onClose,
  imageUrls,
  searchQuery,
  onSelectFront,
  onSelectBack,
}: ImageSearchDialogProps) {
  const [selectedForFront, setSelectedForFront] = useState<string | null>(null);
  const [selectedForBack, setSelectedForBack] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (url: string) => {
    setLoadingImages((prev) => {
      const next = new Set(prev);
      next.delete(url);
      return next;
    });
  };

  const handleImageError = (url: string) => {
    setLoadingImages((prev) => {
      const next = new Set(prev);
      next.delete(url);
      return next;
    });
  };

  const handleSelectFront = (url: string) => {
    setSelectedForFront(url);
    onSelectFront(url);
  };

  const handleSelectBack = (url: string) => {
    setSelectedForBack(url);
    onSelectBack(url);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Card Images</DialogTitle>
          <DialogDescription>
            Search results for: <span className="font-semibold">{searchQuery}</span>
            <br />
            Click an image to set it as front or back. Found {imageUrls.length} result{imageUrls.length !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        {imageUrls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No images found. Try uploading manually instead.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {imageUrls.map((url, index) => (
              <div
                key={index}
                className="relative group border rounded-lg overflow-hidden bg-muted"
              >
                {loadingImages.has(url) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                <img
                  src={url}
                  alt={`Result ${index + 1}`}
                  className="w-full h-48 object-contain"
                  onLoad={() => handleImageLoad(url)}
                  onError={() => handleImageError(url)}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant={selectedForFront === url ? "default" : "secondary"}
                    onClick={() => handleSelectFront(url)}
                  >
                    {selectedForFront === url ? "✓ Front" : "Set as Front"}
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedForBack === url ? "default" : "secondary"}
                    onClick={() => handleSelectBack(url)}
                  >
                    {selectedForBack === url ? "✓ Back" : "Set as Back"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
