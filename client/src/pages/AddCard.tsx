import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Plus, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";
import { getLoginUrl } from "@/const";

export default function AddCard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/collection/:id/add-card");
  const collectionId = params?.id ? parseInt(params.id) : null;

  // Form state
  const [playerName, setPlayerName] = useState("");
  const [brand, setBrand] = useState("");
  const [series, setSeries] = useState("");
  const [season, setSeason] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Remember last selections for quick entry
  const [lastBrand, setLastBrand] = useState("");
  const [lastSeries, setLastSeries] = useState("");

  const utils = trpc.useUtils();

  const { data: collection } = trpc.collections.list.useQuery(undefined, {
    enabled: isAuthenticated,
    select: (collections) => collections.find((c) => c.id === collectionId),
  });

  const { data: existingBrands } = trpc.cards.getUniqueBrands.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: existingSeries } = trpc.cards.getUniqueSeries.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createCardMutation = trpc.cards.create.useMutation({
    onSuccess: () => {
      // Remember selections for next entry
      setLastBrand(brand);
      setLastSeries(series);

      // Reset form but keep brand and series
      setPlayerName("");
      setSeason("");
      setCardNumber("");
      setNotes("");

      utils.cards.listByCollection.invalidate({ collectionId: collectionId! });
      toast.success("Card added successfully! Add another card or go back.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add card");
    },
  });

  // Auto-fill last selections when component mounts
  useEffect(() => {
    if (lastBrand) setBrand(lastBrand);
    if (lastSeries) setSeries(lastSeries);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!collectionId) {
      toast.error("Invalid collection");
      return;
    }

    if (!playerName.trim()) {
      toast.error("Player name is required");
      return;
    }

    if (!brand.trim()) {
      toast.error("Brand is required");
      return;
    }

    if (!series.trim()) {
      toast.error("Series is required");
      return;
    }

    if (!season.trim()) {
      toast.error("Season is required");
      return;
    }

    if (!cardNumber.trim()) {
      toast.error("Card number is required");
      return;
    }

    createCardMutation.mutate({
      collectionId,
      playerName: playerName.trim(),
      brand: brand.trim(),
      series: series.trim(),
      season: season.trim(),
      cardNumber: cardNumber.trim(),
      notes: notes.trim() || undefined,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to add cards</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = getLoginUrl())} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!collectionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Invalid Collection</CardTitle>
            <CardDescription>The collection ID is invalid</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/collections")} className="w-full">
              Back to Collections
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setLocation(`/collection/${collectionId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Collection
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Add Card to Collection</CardTitle>
              <CardDescription>
                Adding card to: <strong>{collection?.name}</strong>
                <br />
                <span className="text-xs text-muted-foreground mt-1 block">
                  Press Enter to save and add another card quickly
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Player Name */}
                <div className="space-y-2">
                  <Label htmlFor="playerName" className="text-base font-semibold">
                    1. Player Name
                  </Label>
                  <Input
                    id="playerName"
                    placeholder="e.g., John Stockton"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    autoFocus
                  />
                </div>

                {/* Step 2: Brand */}
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-base font-semibold">
                    2. Brand
                  </Label>
                  <div className="flex gap-2">
                    <Select value={brand} onValueChange={setBrand}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select or type brand..." />
                      </SelectTrigger>
                      <SelectContent>
                        {existingBrands && existingBrands.length > 0 ? (
                          existingBrands.map((b) => (
                            <SelectItem key={b} value={b}>
                              {b}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="__none__" disabled>
                            No brands yet
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Or type new brand (e.g., Panini, Topps)"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>

                {/* Step 3: Series */}
                <div className="space-y-2">
                  <Label htmlFor="series" className="text-base font-semibold">
                    3. Series
                  </Label>
                  <div className="flex gap-2">
                    <Select value={series} onValueChange={setSeries}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select or type series..." />
                      </SelectTrigger>
                      <SelectContent>
                        {existingSeries && existingSeries.length > 0 ? (
                          existingSeries.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="__none__" disabled>
                            No series yet
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Or type new series (e.g., Hoops, Prizm, Revolution)"
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>

                {/* Step 4: Season */}
                <div className="space-y-2">
                  <Label htmlFor="season" className="text-base font-semibold">
                    4. Season
                  </Label>
                  <Input
                    id="season"
                    placeholder="e.g., 1998-99 or 2014-15"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter year range (1998-99) or single year (2014)
                  </p>
                </div>

                {/* Step 5: Card Number */}
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-base font-semibold">
                    5. Card Number
                  </Label>
                  <Input
                    id="cardNumber"
                    placeholder="e.g., 214 or ST-XYZ"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter card number or special identifier
                  </p>
                </div>

                {/* Optional: Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-base font-semibold">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes about this card..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createCardMutation.isPending}
                  >
                    {createCardMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Card
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation(`/collection/${collectionId}`)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Done
                  </Button>
                </div>

                {lastBrand && lastSeries && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    💡 Brand and Series are remembered from your last entry for quick adding
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
