import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function CollectionDetail() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/collection/:id");
  const collectionId = params?.id ? parseInt(params.id) : null;

  const utils = trpc.useUtils();

  const { data: collection } = trpc.collections.list.useQuery(undefined, {
    enabled: isAuthenticated,
    select: (collections) => collections.find((c) => c.id === collectionId),
  });

  const { data: cards, isLoading: cardsLoading } = trpc.cards.listByCollection.useQuery(
    { collectionId: collectionId! },
    { enabled: isAuthenticated && collectionId !== null }
  );

  const { data: brands } = trpc.brands.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: series } = trpc.series.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: specialties } = trpc.specialties.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const getBrandName = (brandId: number | null) => {
    if (!brandId) return "-";
    return brands?.find(b => b.id === brandId)?.name || "-";
  };

  const getSeriesName = (seriesId: number | null) => {
    if (!seriesId) return "-";
    return series?.find(s => s.id === seriesId)?.name || "-";
  };

  const getSpecialtyName = (specialtyId: number | null) => {
    if (!specialtyId) return "-";
    return specialties?.find(s => s.id === specialtyId)?.name || "-";
  };

  const deleteCardMutation = trpc.cards.delete.useMutation({
    onSuccess: () => {
      utils.cards.listByCollection.invalidate({ collectionId: collectionId! });
      toast.success("Card deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete card");
    },
  });

  const handleDeleteCard = (cardId: number, playerName: string) => {
    if (confirm(`Are you sure you want to delete the card for ${playerName}?`)) {
      deleteCardMutation.mutate({ id: cardId });
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
            <CardDescription>Please sign in to view collections</CardDescription>
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
          <Button variant="ghost" onClick={() => setLocation("/collections")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Collections
          </Button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <FolderOpen className="h-10 w-10 text-primary" />
              {collection?.name || "Collection"}
            </h1>
            {collection?.description && (
              <p className="text-muted-foreground mt-2">{collection.description}</p>
            )}
          </div>
          <Button size="lg" onClick={() => setLocation(`/collection/${collectionId}/add-card`)}>
            <Plus className="mr-2 h-5 w-5" />
            Add Card
          </Button>
        </div>

        {cardsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : cards && cards.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Cards in Collection</CardTitle>
              <CardDescription>
                {cards.length} {cards.length === 1 ? "card" : "cards"} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Series</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Season</TableHead>
                      <TableHead>Card #</TableHead>
                      <TableHead>Flags</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-medium">{card.playerName}</TableCell>
                        <TableCell>{getBrandName(card.brandId)}</TableCell>
                        <TableCell>{getSeriesName(card.seriesId)}</TableCell>
                        <TableCell>{getSpecialtyName(card.specialtyId)}</TableCell>
                        <TableCell>{card.season}</TableCell>
                        <TableCell>
                          {card.cardNumber}
                          {card.isNumbered === 1 && card.numberedCurrent && card.numberedOf && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({card.numberedCurrent}/{card.numberedOf})
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {card.isAutograph === 1 && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">AUTO</span>
                            )}
                            {card.isNumbered === 1 && (
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">#'d</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {card.notes || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setLocation(`/collection/${collectionId}/card/${card.id}/edit`)
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCard(card.id, card.playerName)}
                              disabled={deleteCardMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🃏</div>
              <h3 className="text-xl font-semibold mb-2">No Cards Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start adding cards to this collection
              </p>
              <Button onClick={() => setLocation(`/collection/${collectionId}/add-card`)}>
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Card
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
