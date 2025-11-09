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

interface SearchDebugInfo {
  detailedQuery: string;
  fallbackQuery?: string;
  ebayQuery?: string;
  apiEndpoint: string;
  detailedResults: number;
  fallbackResults?: number;
  ebayResults?: number;
  rawResponse?: any;
  error?: string;
}

interface ImageSearchDialogProps {
  open: boolean;
  onClose: () => void;
  imageUrls: string[];
  debugInfo: SearchDebugInfo | null;
  onSelectFront: (url: string) => void;
  onSelectBack: (url: string) => void;
}

export function ImageSearchDialog({
  open,
  onClose,
  imageUrls,
  debugInfo,
  onSelectFront,
  onSelectBack,
}: ImageSearchDialogProps) {
  const [selectedForFront, setSelectedForFront] = useState<string | null>(null);
  const [selectedForBack, setSelectedForBack] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [showDebug, setShowDebug] = useState(false);

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
            Found {imageUrls.length} result{imageUrls.length !== 1 ? 's' : ''}.
            {debugInfo && (
              <Button
                variant="link"
                size="sm"
                className="ml-2 h-auto p-0"
                onClick={() => setShowDebug(!showDebug)}
              >
                {showDebug ? "Hide" : "Show"} Debug Info
              </Button>
            )}
          </DialogDescription>
        </DialogHeader>

        {showDebug && debugInfo && (
          <div className="mb-4 p-4 bg-muted rounded-lg text-sm font-mono space-y-2">
            <div>
              <strong>API Endpoint:</strong> {debugInfo.apiEndpoint}
            </div>
            <div>
              <strong>Detailed Query:</strong> "{debugInfo.detailedQuery}"
            </div>
            <div>
              <strong>Detailed Results:</strong> {debugInfo.detailedResults}
            </div>
            {debugInfo.fallbackQuery && (
              <>
                <div>
                  <strong>Fallback Query:</strong> "{debugInfo.fallbackQuery}"
                </div>
                <div>
                  <strong>Fallback Results:</strong> {debugInfo.fallbackResults}
                </div>
              </>
            )}
            {debugInfo.ebayQuery && (
              <>
                <div>
                  <strong>Simple eBay Query:</strong> "{debugInfo.ebayQuery}"
                </div>
                <div>
                  <strong>eBay Results:</strong> {debugInfo.ebayResults}
                </div>
              </>
            )}
            {debugInfo.error && (
              <div className="text-destructive">
                <strong>Error:</strong> {debugInfo.error}
              </div>
            )}
            {debugInfo.rawResponse && (
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold">Raw API Response</summary>
                <pre className="mt-2 p-2 bg-background rounded overflow-x-auto text-xs">
                  {JSON.stringify(debugInfo.rawResponse, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {imageUrls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">No images found.</p>
            {debugInfo && (
              <>
                <p className="text-sm">
                  Searched: "{debugInfo.detailedQuery}"
                  {debugInfo.fallbackQuery && ` and "${debugInfo.fallbackQuery}"`}
                  {debugInfo.ebayQuery && ` and "${debugInfo.ebayQuery}"`}
                </p>
                {debugInfo.error && (
                  <p className="text-sm text-destructive mt-1">
                    Error: {debugInfo.error}
                  </p>
                )}
              </>
            )}
            <p className="mt-2">Try uploading manually instead.</p>
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
