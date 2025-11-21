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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Edit, Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function AdminManagement() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Brand state
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<{ id: number; name: string } | null>(null);
  const [brandName, setBrandName] = useState("");

  // Series state
  const [seriesDialogOpen, setSeriesDialogOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<{ id: number; name: string; brandId: number | null } | null>(null);
  const [seriesName, setSeriesName] = useState("");
  const [seriesBrandId, setSeriesBrandId] = useState<number | null>(null);

  // Insert state
  const [insertsDialogOpen, setInsertDialogOpen] = useState(false);
  const [editingInsert, setEditingInsert] = useState<{ id: number; name: string; seriesId: number | null } | null>(null);
  const [insertsName, setInsertName] = useState("");
  const [insertsSeriesId, setInsertSeriesId] = useState<number | null>(null);

  // Specialty state
  const [specialtyDialogOpen, setSpecialtyDialogOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<{ id: number; name: string } | null>(null);
  const [parallelName, setSpecialtyName] = useState("");

  // Category state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: number; name: string } | null>(null);
  const [categoryName, setCategoryName] = useState("");

  // Collection Type state
  const [collectionTypeDialogOpen, setCollectionTypeDialogOpen] = useState(false);
  const [editingCollectionType, setEditingCollectionType] = useState<{ id: number; name: string } | null>(null);
  const [collectionTypeName, setCollectionTypeName] = useState("");

  // Team state
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<{ id: number; name: string } | null>(null);
  const [teamName, setTeamName] = useState("");

  // Autograph Type state
  const [autographTypeDialogOpen, setAutographTypeDialogOpen] = useState(false);
  const [editingAutographType, setEditingAutographType] = useState<{ id: number; name: string } | null>(null);
  const [autographTypeName, setAutographTypeName] = useState("");

  // Queries
  const { data: brands, isLoading: brandsLoading } = trpc.brands.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: series, isLoading: seriesLoading } = trpc.series.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: inserts, isLoading: insertsLoading } = trpc.inserts.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: parallels, isLoading: parallelsLoading } = trpc.parallels.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: categories, isLoading: categoriesLoading } = trpc.categories.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: collectionTypes, isLoading: collectionTypesLoading } = trpc.collectionTypes.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: teams, isLoading: teamsLoading } = trpc.teams.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: autographTypes, isLoading: autographTypesLoading } = trpc.autographTypes.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Brand mutations
  const createBrandMutation = trpc.brands.create.useMutation({
    onSuccess: () => {
      utils.brands.list.invalidate();
      toast.success("Brand created successfully");
      setBrandDialogOpen(false);
      setBrandName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create brand");
    },
  });

  const updateBrandMutation = trpc.brands.update.useMutation({
    onSuccess: () => {
      utils.brands.list.invalidate();
      toast.success("Brand updated successfully");
      setBrandDialogOpen(false);
      setEditingBrand(null);
      setBrandName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update brand");
    },
  });

  const deleteBrandMutation = trpc.brands.delete.useMutation({
    onSuccess: () => {
      utils.brands.list.invalidate();
      toast.success("Brand deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete brand");
    },
  });

  // Series mutations
  const createSeriesMutation = trpc.series.create.useMutation({
    onSuccess: () => {
      utils.series.list.invalidate();
      toast.success("Series created successfully");
      setSeriesDialogOpen(false);
      setSeriesName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create series");
    },
  });

  const updateSeriesMutation = trpc.series.update.useMutation({
    onSuccess: () => {
      utils.series.list.invalidate();
      toast.success("Series updated successfully");
      setSeriesDialogOpen(false);
      setEditingSeries(null);
      setSeriesName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update series");
    },
  });

  const deleteSeriesMutation = trpc.series.delete.useMutation({
    onSuccess: () => {
      utils.series.list.invalidate();
      toast.success("Series deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete series");
    },
  });

  // Insert mutations
  const createInsertMutation = trpc.inserts.create.useMutation({
    onSuccess: () => {
      utils.inserts.list.invalidate();
      toast.success("Insert created successfully");
      setInsertDialogOpen(false);
      setInsertName("");
      setInsertSeriesId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create inserts");
    },
  });

  const updateInsertMutation = trpc.inserts.update.useMutation({
    onSuccess: () => {
      utils.inserts.list.invalidate();
      toast.success("Insert updated successfully");
      setInsertDialogOpen(false);
      setEditingInsert(null);
      setInsertName("");
      setInsertSeriesId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update inserts");
    },
  });

  const deleteInsertMutation = trpc.inserts.delete.useMutation({
    onSuccess: () => {
      utils.inserts.list.invalidate();
      toast.success("Insert deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete inserts");
    },
  });

  // Specialty mutations
  const createSpecialtyMutation = trpc.parallels.create.useMutation({
    onSuccess: () => {
      utils.parallels.list.invalidate();
      toast.success("Specialty created successfully");
      setSpecialtyDialogOpen(false);
      setSpecialtyName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create specialty");
    },
  });

  const updateSpecialtyMutation = trpc.parallels.update.useMutation({
    onSuccess: () => {
      utils.parallels.list.invalidate();
      toast.success("Specialty updated successfully");
      setSpecialtyDialogOpen(false);
      setEditingSpecialty(null);
      setSpecialtyName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update specialty");
    },
  });

  const deleteSpecialtyMutation = trpc.parallels.delete.useMutation({
    onSuccess: () => {
      utils.parallels.list.invalidate();
      toast.success("Specialty deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete specialty");
    },
  });

  // Category mutations
  const createCategoryMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success("Category created successfully");
      setCategoryDialogOpen(false);
      setCategoryName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create category");
    },
  });

  const updateCategoryMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success("Category updated successfully");
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update category");
    },
  });

  const deleteCategoryMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });

  // Collection Type mutations
  const createCollectionTypeMutation = trpc.collectionTypes.create.useMutation({
    onSuccess: () => {
      utils.collectionTypes.list.invalidate();
      toast.success("Collection type created successfully");
      setCollectionTypeDialogOpen(false);
      setCollectionTypeName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create collection type");
    },
  });

  const updateCollectionTypeMutation = trpc.collectionTypes.update.useMutation({
    onSuccess: () => {
      utils.collectionTypes.list.invalidate();
      toast.success("Collection type updated successfully");
      setCollectionTypeDialogOpen(false);
      setEditingCollectionType(null);
      setCollectionTypeName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update collection type");
    },
  });

  const deleteCollectionTypeMutation = trpc.collectionTypes.delete.useMutation({
    onSuccess: () => {
      utils.collectionTypes.list.invalidate();
      toast.success("Collection type deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete collection type");
    },
  });

  // Team mutations
  const createTeamMutation = trpc.teams.create.useMutation({
    onSuccess: () => {
      utils.teams.list.invalidate();
      toast.success("Team created successfully");
      setTeamDialogOpen(false);
      setTeamName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create team");
    },
  });

  const updateTeamMutation = trpc.teams.update.useMutation({
    onSuccess: () => {
      utils.teams.list.invalidate();
      toast.success("Team updated successfully");
      setTeamDialogOpen(false);
      setEditingTeam(null);
      setTeamName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update team");
    },
  });

  const deleteTeamMutation = trpc.teams.delete.useMutation({
    onSuccess: () => {
      utils.teams.list.invalidate();
      toast.success("Team deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete team");
    },
  });

  // Autograph Type mutations
  const createAutographTypeMutation = trpc.autographTypes.create.useMutation({
    onSuccess: () => {
      utils.autographTypes.list.invalidate();
      toast.success("Autograph type created successfully");
      setAutographTypeDialogOpen(false);
      setAutographTypeName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create autograph type");
    },
  });

  const updateAutographTypeMutation = trpc.autographTypes.update.useMutation({
    onSuccess: () => {
      utils.autographTypes.list.invalidate();
      toast.success("Autograph type updated successfully");
      setAutographTypeDialogOpen(false);
      setEditingAutographType(null);
      setAutographTypeName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update autograph type");
    },
  });

  const deleteAutographTypeMutation = trpc.autographTypes.delete.useMutation({
    onSuccess: () => {
      utils.autographTypes.list.invalidate();
      toast.success("Autograph type deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete autograph type");
    },
  });

  // Handlers
  const handleBrandSubmit = () => {
    if (!brandName.trim()) {
      toast.error("Brand name is required");
      return;
    }

    if (editingBrand) {
      updateBrandMutation.mutate({ id: editingBrand.id, name: brandName.trim() });
    } else {
      createBrandMutation.mutate({ name: brandName.trim() });
    }
  };

  const handleSeriesSubmit = () => {
    if (!seriesName.trim()) {
      toast.error("Series name is required");
      return;
    }

    if (editingSeries) {
      updateSeriesMutation.mutate({ id: editingSeries.id, name: seriesName.trim(), brandId: seriesBrandId });
    } else {
      createSeriesMutation.mutate({ name: seriesName.trim(), brandId: seriesBrandId });
    }
  };

  const handleInsertSubmit = () => {
    if (!insertsName.trim()) {
      toast.error("Insert name is required");
      return;
    }

    if (editingInsert) {
      updateInsertMutation.mutate({ id: editingInsert.id, name: insertsName.trim(), seriesId: insertsSeriesId });
    } else {
      createInsertMutation.mutate({ name: insertsName.trim(), seriesId: insertsSeriesId });
    }
  };

  const handleSpecialtySubmit = () => {
    if (!parallelName.trim()) {
      toast.error("Specialty name is required");
      return;
    }

    if (editingSpecialty) {
      updateSpecialtyMutation.mutate({ id: editingSpecialty.id, name: parallelName.trim() });
    } else {
      createSpecialtyMutation.mutate({ name: parallelName.trim() });
    }
  };

  const handleCategorySubmit = () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, name: categoryName.trim() });
    } else {
      createCategoryMutation.mutate({ name: categoryName.trim() });
    }
  };

  const handleCollectionTypeSubmit = () => {
    if (!collectionTypeName.trim()) {
      toast.error("Collection type name is required");
      return;
    }

    if (editingCollectionType) {
      updateCollectionTypeMutation.mutate({ id: editingCollectionType.id, name: collectionTypeName.trim() });
    } else {
      createCollectionTypeMutation.mutate({ name: collectionTypeName.trim() });
    }
  };

  const handleTeamSubmit = () => {
    if (!teamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    if (editingTeam) {
      updateTeamMutation.mutate({ id: editingTeam.id, name: teamName.trim() });
    } else {
      createTeamMutation.mutate({ name: teamName.trim() });
    }
  };

  const handleAutographTypeSubmit = () => {
    if (!autographTypeName.trim()) {
      toast.error("Autograph type name is required");
      return;
    }

    if (editingAutographType) {
      updateAutographTypeMutation.mutate({ id: editingAutographType.id, name: autographTypeName.trim() });
    } else {
      createAutographTypeMutation.mutate({ name: autographTypeName.trim() });
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
            <CardDescription>Please sign in to access admin panel</CardDescription>
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

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              Go Home
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
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Admin Management</CardTitle>
            <CardDescription>Manage brands, series, and parallels</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="brands">
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="brands">Brands</TabsTrigger>
                <TabsTrigger value="series">Series</TabsTrigger>
                <TabsTrigger value="inserts">Insert</TabsTrigger>
                <TabsTrigger value="parallels">Parallels</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="collectionTypes">Collection Types</TabsTrigger>
                <TabsTrigger value="teams">Teams</TabsTrigger>
                <TabsTrigger value="autographTypes">Autograph Types</TabsTrigger>
              </TabsList>

              {/* Brands Tab */}
              <TabsContent value="brands" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Brands</h3>
                  <Button
                    onClick={() => {
                      setEditingBrand(null);
                      setBrandName("");
                      setBrandDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Brand
                  </Button>
                </div>

                {brandsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brands?.map((brand) => (
                        <TableRow key={brand.id}>
                          <TableCell className="font-medium">{brand.name}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingBrand(brand);
                                  setBrandName(brand.name);
                                  setBrandDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`Delete brand "${brand.name}"?`)) {
                                    deleteBrandMutation.mutate({ id: brand.id });
                                  }
                                }}
                                disabled={deleteBrandMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Series Tab */}
              <TabsContent value="series" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Series</h3>
                  <Button
                    onClick={() => {
                      setEditingSeries(null);
                      setSeriesName("");
                      setSeriesDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Series
                  </Button>
                </div>

                {seriesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {series?.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingSeries(s);
                                  setSeriesName(s.name);
                                  setSeriesBrandId(s.brandId);
                                  setSeriesDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`Delete series "${s.name}"?`)) {
                                    deleteSeriesMutation.mutate({ id: s.id });
                                  }
                                }}
                                disabled={deleteSeriesMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Insert Tab */}
              <TabsContent value="inserts" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Insert</h3>
                  <Button
                    onClick={() => {
                      setEditingInsert(null);
                      setInsertName("");
                      setInsertSeriesId(null);
                      setInsertDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Insert
                  </Button>
                </div>

                {insertsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Series</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inserts?.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.name}</TableCell>
                          <TableCell>
                            {sub.seriesId ? series?.find(s => s.id === sub.seriesId)?.name || "Unknown" : "None"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingInsert(sub);
                                  setInsertName(sub.name);
                                  setInsertSeriesId(sub.seriesId);
                                  setInsertDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`Delete inserts "${sub.name}"?`)) {
                                    deleteInsertMutation.mutate({ id: sub.id });
                                  }
                                }}
                                disabled={deleteInsertMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Parallels Tab */}
              <TabsContent value="parallels" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Parallels</h3>
                  <Button
                    onClick={() => {
                      setEditingSpecialty(null);
                      setSpecialtyName("");
                      setSpecialtyDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Specialty
                  </Button>
                </div>

                {parallelsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parallels?.map((specialty) => (
                        <TableRow key={specialty.id}>
                          <TableCell className="font-medium">{specialty.name}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingSpecialty(specialty);
                                  setSpecialtyName(specialty.name);
                                  setSpecialtyDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`Delete specialty "${specialty.name}"?`)) {
                                    deleteSpecialtyMutation.mutate({ id: specialty.id });
                                  }
                                }}
                                disabled={deleteSpecialtyMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Categories Tab */}
              <TabsContent value="categories" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Categories</h3>
                  <Button
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryName("");
                      setCategoryDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </div>

                {categoriesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories?.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setCategoryName(category.name);
                                  setCategoryDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`Delete category "${category.name}"?`)) {
                                    deleteCategoryMutation.mutate({ id: category.id });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Collection Types Tab */}
              <TabsContent value="collectionTypes" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Collection Types</h3>
                  <Button
                    onClick={() => {
                      setEditingCollectionType(null);
                      setCollectionTypeName("");
                      setCollectionTypeDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Collection Type
                  </Button>
                </div>

                {collectionTypesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collectionTypes?.map((type) => (
                        <TableRow key={type.id}>
                          <TableCell className="font-medium">{type.name}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingCollectionType(type);
                                  setCollectionTypeName(type.name);
                                  setCollectionTypeDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`Delete collection type "${type.name}"?`)) {
                                    deleteCollectionTypeMutation.mutate({ id: type.id });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
              {/* Teams Tab */}
              <TabsContent value="teams" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Teams</h3>
                  <Button
                    onClick={() => {
                      setEditingTeam(null);
                      setTeamName("");
                      setTeamDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Team
                  </Button>
                </div>

                {teamsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teams?.map((team) => (
                        <TableRow key={team.id}>
                          <TableCell>{team.name}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingTeam(team);
                                  setTeamName(team.name);
                                  setTeamDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this team?")) {
                                    deleteTeamMutation.mutate({ id: team.id });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Autograph Types Tab */}
              <TabsContent value="autographTypes" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Autograph Types</h3>
                  <Button
                    onClick={() => {
                      setEditingAutographType(null);
                      setAutographTypeName("");
                      setAutographTypeDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Autograph Type
                  </Button>
                </div>

                {autographTypesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {autographTypes?.map((type) => (
                        <TableRow key={type.id}>
                          <TableCell>{type.name}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingAutographType(type);
                                  setAutographTypeName(type.name);
                                  setAutographTypeDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this autograph type?")) {
                                    deleteAutographTypeMutation.mutate({ id: type.id });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Brand Dialog */}
      <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBrand ? "Edit Brand" : "Add Brand"}</DialogTitle>
            <DialogDescription>
              {editingBrand ? "Update the brand name" : "Create a new brand"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g., Panini"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBrandDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBrandSubmit}
              disabled={createBrandMutation.isPending || updateBrandMutation.isPending}
            >
              {createBrandMutation.isPending || updateBrandMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Series Dialog */}
      <Dialog open={seriesDialogOpen} onOpenChange={setSeriesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSeries ? "Edit Series" : "Add Series"}</DialogTitle>
            <DialogDescription>
              {editingSeries ? "Update the series name" : "Create a new series"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seriesName">Series Name</Label>
              <Input
                id="seriesName"
                value={seriesName}
                onChange={(e) => setSeriesName(e.target.value)}
                placeholder="e.g., Prizm"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seriesBrand">Brand (Optional)</Label>
              <Select value={seriesBrandId?.toString()} onValueChange={(v) => setSeriesBrandId(v ? parseInt(v) : null)}>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSeriesDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSeriesSubmit}
              disabled={createSeriesMutation.isPending || updateSeriesMutation.isPending}
            >
              {createSeriesMutation.isPending || updateSeriesMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insert Dialog */}
      <Dialog open={insertsDialogOpen} onOpenChange={setInsertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingInsert ? "Edit Insert" : "Add Insert"}</DialogTitle>
            <DialogDescription>
              {editingInsert ? "Update the inserts details" : "Create a new inserts"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="insertsName">Insert Name</Label>
              <Input
                id="insertsName"
                value={insertsName}
                onChange={(e) => setInsertName(e.target.value)}
                placeholder="e.g., Silver, Gold, Base"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insertsSeries">Series (Optional)</Label>
              <Select
                value={insertsSeriesId?.toString() || ""}
                onValueChange={(value) => setInsertSeriesId(value ? parseInt(value) : null)}
              >
                <SelectTrigger id="insertsSeries">
                  <SelectValue placeholder="Select series" />
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInsertDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInsertSubmit}
              disabled={createInsertMutation.isPending || updateInsertMutation.isPending}
            >
              {createInsertMutation.isPending || updateInsertMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Specialty Dialog */}
      <Dialog open={specialtyDialogOpen} onOpenChange={setSpecialtyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSpecialty ? "Edit Specialty" : "Add Specialty"}</DialogTitle>
            <DialogDescription>
              {editingSpecialty ? "Update the specialty name" : "Create a new specialty"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parallelName">Specialty Name</Label>
              <Input
                id="parallelName"
                value={parallelName}
                onChange={(e) => setSpecialtyName(e.target.value)}
                placeholder="e.g., Rookie Card"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSpecialtyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSpecialtySubmit}
              disabled={createSpecialtyMutation.isPending || updateSpecialtyMutation.isPending}
            >
              {createSpecialtyMutation.isPending || updateSpecialtyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update the category name" : "Create a new category (e.g., Basketball, Baseball, F1)"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g., Basketball"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCategorySubmit}
              disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending || updateCategoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collection Type Dialog */}
      <Dialog open={collectionTypeDialogOpen} onOpenChange={setCollectionTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCollectionType ? "Edit Collection Type" : "Add Collection Type"}</DialogTitle>
            <DialogDescription>
              {editingCollectionType ? "Update the collection type name" : "Create a new collection type (e.g., Player, Series, Parallels)"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collectionTypeName">Collection Type Name</Label>
              <Input
                id="collectionTypeName"
                value={collectionTypeName}
                onChange={(e) => setCollectionTypeName(e.target.value)}
                placeholder="e.g., Player Collection"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollectionTypeDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCollectionTypeSubmit}
              disabled={createCollectionTypeMutation.isPending || updateCollectionTypeMutation.isPending}
            >
              {createCollectionTypeMutation.isPending || updateCollectionTypeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Dialog */}
      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeam ? "Edit Team" : "Add Team"}</DialogTitle>
            <DialogDescription>
              {editingTeam ? "Update the team name" : "Add a new team to the database"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTeamSubmit}>
              {editingTeam ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Autograph Type Dialog */}
      <Dialog open={autographTypeDialogOpen} onOpenChange={setAutographTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAutographType ? "Edit Autograph Type" : "Add Autograph Type"}</DialogTitle>
            <DialogDescription>
              {editingAutographType ? "Update the autograph type name" : "Add a new autograph type to the database"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="autographTypeName">Autograph Type Name</Label>
              <Input
                id="autographTypeName"
                value={autographTypeName}
                onChange={(e) => setAutographTypeName(e.target.value)}
                placeholder="Enter autograph type name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAutographTypeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAutographTypeSubmit}>
              {editingAutographType ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
