import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";
import { getLoginUrl } from "@/const";

export default function AddCard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/collection/:id/add-card");
  const collectionId = params?.id ? parseInt(params.id) : null;

  const [playerName, setPlayerName] = useState("");
  const [brandId, setBrandId] = useState<number | null>(null);
  const [seriesId, setSeriesId] = useState<number | null>(null);
  const [specialtyId, setSpecialtyId] = useState<number | null>(null);
  const [season, setSeason] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [isAutograph, setIsAutograph] = useState(false);
  const [isNumbered, setIsNumbered] = useState(false);
  const [numberedCurrent, setNumberedCurrent] = useState("");
  const [numberedOf, setNumberedOf] = useState("");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();

  const { data: collection } = trpc.collections.list.useQuery(undefined, {
    enabled: isAuthenticated,
    select: (collections) => collections.find((c) => c.id === collectionId),
  });

  const { data: brands } = trpc.brands.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: series } = trpc.series.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: specialties } = trpc.specialties.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createCardMutation = trpc.cards.create.useMutation({
    onSuccess: () => {
      utils.cards.listByCollection.invalidate({ collectionId: collectionId! });
      toast.success("Card added successfully");
      
      // Reset form but keep brand and series for quick entry
      setPlayerName("");
      setSeason("");
      setCardNumber("");
      setSpecialtyId(null);
      setIsAutograph(false);
      setIsNumbered(false);
      setNumberedCurrent("");
      setNumberedOf("");
      setNotes("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add card");
    },
  });

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

    if (!season.trim()) {
      toast.error("Season is required");
      return;
    }

    if (!cardNumber.trim()) {
      toast.error("Card number is required");
      return;
    }

    if (isNumbered) {
      if (!numberedCurrent.trim() || !numberedOf.trim()) {
        toast.error("Both numbered values are required when card is numbered");
        return;
      }
    }

    createCardMutation.mutate({
      collectionId,
      playerName: playerName.trim(),
      brandId: brandId || undefined,
      seriesId: seriesId || undefined,
      specialtyId: specialtyId || undefined,
      season: season.trim(),
      cardNumber: cardNumber.trim(),
      isAutograph,
      isNumbered,
      numberedCurrent: isNumbered && numberedCurrent ? parseInt(numberedCurrent) : undefined,
      numberedOf: isNumbered && numberedOf ? parseInt(numberedOf) : undefined,
      notes: notes.trim() || undefined,
    });
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

  if (!collectionId || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Collection Not Found</CardTitle>
            <CardDescription>The collection you're trying to add to doesn't exist</CardDescription>
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
              <CardTitle className="text-2xl">Add Card</CardTitle>
              <CardDescription>
                Adding card to: <strong>{collection.name}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="playerName">Player Name *</Label>
                  <Input
                    id="playerName"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g., John Stockton"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand (Optional)</Label>
                  <Select value={brandId?.toString()} onValueChange={(v) => setBrandId(v ? parseInt(v) : null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands?.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="series">Series (Optional)</Label>
                  <Select value={seriesId?.toString()} onValueChange={(v) => setSeriesId(v ? parseInt(v) : null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select series (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {series?.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty (Optional)</Label>
                  <Select value={specialtyId?.toString()} onValueChange={(v) => setSpecialtyId(v ? parseInt(v) : null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties?.map((specialty) => (
                        <SelectItem key={specialty.id} value={specialty.id.toString()}>
                          {specialty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="season">Season *</Label>
                  <Input
                    id="season"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    placeholder="e.g., 1998-99 or 2014"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="e.g., 214 or ST-XYZ"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isAutograph"
                      checked={isAutograph}
                      onCheckedChange={(checked) => setIsAutograph(checked as boolean)}
                    />
                    <Label htmlFor="isAutograph" className="cursor-pointer">
                      Autograph
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isNumbered"
                        checked={isNumbered}
                        onCheckedChange={(checked) => setIsNumbered(checked as boolean)}
                      />
                      <Label htmlFor="isNumbered" className="cursor-pointer">
                        Numbered
                      </Label>
                    </div>
                    {isNumbered && (
                      <div className="grid grid-cols-2 gap-4 ml-6">
                        <div className="space-y-2">
                          <Label htmlFor="numberedCurrent">Current #</Label>
                          <Input
                            id="numberedCurrent"
                            type="number"
                            value={numberedCurrent}
                            onChange={(e) => setNumberedCurrent(e.target.value)}
                            placeholder="25"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="numberedOf">Of #</Label>
                          <Input
                            id="numberedOf"
                            type="number"
                            value={numberedOf}
                            onChange={(e) => setNumberedOf(e.target.value)}
                            placeholder="99"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

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
                        <Check className="mr-2 h-4 w-4" />
                        Add Card & Continue
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation(`/collection/${collectionId}`)}
                  >
                    Done
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
