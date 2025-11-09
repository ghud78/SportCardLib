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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Trash2, Edit, FolderOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Collections() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [newCategoryId, setNewCategoryId] = useState<number | null>(null);
  const [newCollectionTypeId, setNewCollectionTypeId] = useState<number | null>(null);
  const [editingCollection, setEditingCollection] = useState<{
    id: number;
    name: string;
    description: string | null;
    categoryId: number | null;
    collectionTypeId: number | null;
  } | null>(null);

  const utils = trpc.useUtils();
  const { data: collections, isLoading } = trpc.collections.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: categories } = trpc.categories.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: collectionTypes } = trpc.collectionTypes.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.collections.create.useMutation({
    onSuccess: () => {
      utils.collections.list.invalidate();
      setCreateDialogOpen(false);
      setNewCollectionName("");
      setNewCollectionDescription("");
      setNewCategoryId(null);
      setNewCollectionTypeId(null);
      toast.success("Collection created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create collection");
    },
  });

  const updateMutation = trpc.collections.update.useMutation({
    onSuccess: () => {
      utils.collections.list.invalidate();
      setEditDialogOpen(false);
      setEditingCollection(null);
      toast.success("Collection updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update collection");
    },
  });

  const deleteMutation = trpc.collections.delete.useMutation({
    onSuccess: () => {
      utils.collections.list.invalidate();
      toast.success("Collection deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete collection");
    },
  });

  const handleCreate = () => {
    if (!newCollectionName.trim()) {
      toast.error("Collection name is required");
      return;
    }
    createMutation.mutate({
      name: newCollectionName,
      description: newCollectionDescription || undefined,
      categoryId: newCategoryId || undefined,
      collectionTypeId: newCollectionTypeId || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingCollection) return;
    if (!editingCollection.name.trim()) {
      toast.error("Collection name is required");
      return;
    }
    updateMutation.mutate({
      id: editingCollection.id,
      name: editingCollection.name,
      description: editingCollection.description || undefined,
      categoryId: editingCollection.categoryId || undefined,
      collectionTypeId: editingCollection.collectionTypeId || undefined,
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This will also delete all cards in this collection.`)) {
      deleteMutation.mutate({ id });
    }
  };

  const openEditDialog = (collection: { id: number; name: string; description: string | null; categoryId?: number | null; collectionTypeId?: number | null }) => {
    setEditingCollection({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      categoryId: collection.categoryId ?? null,
      collectionTypeId: collection.collectionTypeId ?? null,
    });
    setEditDialogOpen(true);
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
            <CardDescription>Please sign in to manage your collections</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = getLoginUrl()} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">My Collections</h1>
            <p className="text-muted-foreground mt-2">Manage your sport card collections</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
                <DialogDescription>
                  Add a new collection to organize your sport cards
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Collection Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., John Stockton"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add notes about this collection..."
                    value={newCollectionDescription}
                    onChange={(e) => setNewCollectionDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Select value={newCategoryId?.toString() || ""} onValueChange={(val) => setNewCategoryId(val ? Number(val) : null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collectionType">Collection Type (Optional)</Label>
                  <Select value={newCollectionTypeId?.toString() || ""} onValueChange={(val) => setNewCollectionTypeId(val ? Number(val) : null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select collection type" />
                    </SelectTrigger>
                    <SelectContent>
                      {collectionTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Collection
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : collections && collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Card key={collection.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-primary" />
                        {collection.name}
                      </CardTitle>
                      {collection.description && (
                        <CardDescription className="mt-2">
                          {collection.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => setLocation(`/collection/${collection.id}`)}
                    >
                      View Cards
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(collection)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(collection.id, collection.name)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Collections Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first collection to start organizing your sport cards
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Collection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Collection</DialogTitle>
              <DialogDescription>
                Update your collection details
              </DialogDescription>
            </DialogHeader>
            {editingCollection && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Collection Name</Label>
                  <Input
                    id="edit-name"
                    value={editingCollection.name}
                    onChange={(e) =>
                      setEditingCollection({ ...editingCollection, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description (Optional)</Label>
                  <Textarea
                    id="edit-description"
                    value={editingCollection.description || ""}
                    onChange={(e) =>
                      setEditingCollection({
                        ...editingCollection,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category (Optional)</Label>
                  <Select
                    value={editingCollection.categoryId?.toString() || ""}
                    onValueChange={(val) =>
                      setEditingCollection({
                        ...editingCollection,
                        categoryId: val ? Number(val) : null,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-collectionType">Collection Type (Optional)</Label>
                  <Select
                    value={editingCollection.collectionTypeId?.toString() || ""}
                    onValueChange={(val) =>
                      setEditingCollection({
                        ...editingCollection,
                        collectionTypeId: val ? Number(val) : null,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select collection type" />
                    </SelectTrigger>
                    <SelectContent>
                      {collectionTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setEditingCollection(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
