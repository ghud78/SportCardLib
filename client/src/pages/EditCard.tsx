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
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";
import { getLoginUrl } from "@/const";

export default function EditCard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/collection/:collectionId/card/:cardId/edit");
  const collectionId = params?.collectionId ? parseInt(params.collectionId) : null;
  const cardId = params?.cardId ? parseInt(params.cardId) : null;

  const [playerName, setPlayerName] = useState("");
  const [brand, setBrand] = useState("");
  const [series, setSeries] = useState("");
  const [season, setSeason] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();

  const { data: card, isLoading: cardLoading } = trpc.cards.listByCollection.useQuery(
    { collectionId: collectionId! },
    {
      enabled: isAuthenticated && collectionId !== null,
      select: (cards) => cards.find((c) => c.id === cardId),
    }
  );

  const { data: collection } = trpc.collections.list.useQuery(undefined, {
    enabled: isAuthenticated,
    select: (collections) => collections.find((c) => c.id === collectionId),
  });

  useEffect(() => {
    if (card) {
      setPlayerName(card.playerName);
      setBrand(card.brand);
      setSeries(card.series);
      setSeason(card.season);
      setCardNumber(card.cardNumber);
      setNotes(card.notes || "");
    }
  }, [card]);

  const updateCardMutation = trpc.cards.update.useMutation({
    onSuccess: () => {
      utils.cards.listByCollection.invalidate({ collectionId: collectionId! });
      toast.success("Card updated successfully");
      setLocation(`/collection/${collectionId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update card");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardId) {
      toast.error("Invalid card");
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

    updateCardMutation.mutate({
      id: cardId,
      playerName: playerName.trim(),
      brand: brand.trim(),
      series: series.trim(),
      season: season.trim(),
      cardNumber: cardNumber.trim(),
      notes: notes.trim() || undefined,
    });
  };

  if (authLoading || cardLoading) {
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
            <CardDescription>Please sign in to edit cards</CardDescription>
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

  if (!collectionId || !cardId || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Card Not Found</CardTitle>
            <CardDescription>The card you're trying to edit doesn't exist</CardDescription>
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
              <CardTitle className="text-2xl">Edit Card</CardTitle>
              <CardDescription>
                Editing card in: <strong>{collection?.name}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="playerName">Player Name</Label>
                  <Input
                    id="playerName"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="series">Series</Label>
                  <Input
                    id="series"
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="season">Season</Label>
                  <Input
                    id="season"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
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
                    disabled={updateCardMutation.isPending}
                  >
                    {updateCardMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation(`/collection/${collectionId}`)}
                  >
                    Cancel
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
