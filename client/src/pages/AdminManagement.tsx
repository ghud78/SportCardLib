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

  // Subseries state
  const [subseriesDialogOpen, setSubseriesDialogOpen] = useState(false);
  const [editingSubseries, setEditingSubseries] = useState<{ id: number; name: string; seriesId: number | null } | null>(null);
  const [subseriesName, setSubseriesName] = useState("");
  const [subseriesSeriesId, setSubseriesSeriesId] = useState<number | null>(null);

  // Specialty state
  const [specialtyDialogOpen, setSpecialtyDialogOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<{ id: number; name: string } | null>(null);
  const [specialtyName, setSpecialtyName] = useState("");

  // Queries
  const { data: brands, isLoading: brandsLoading } = trpc.brands.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: series, isLoading: seriesLoading } = trpc.series.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: subseries, isLoading: subseriesLoading } = trpc.subseries.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: specialties, isLoading: specialtiesLoading } = trpc.specialties.list.useQuery(undefined, {
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

  // Subseries mutations
  const createSubseriesMutation = trpc.subseries.create.useMutation({
    onSuccess: () => {
      utils.subseries.list.invalidate();
      toast.success("Subseries created successfully");
      setSubseriesDialogOpen(false);
      setSubseriesName("");
      setSubseriesSeriesId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create subseries");
    },
  });

  const updateSubseriesMutation = trpc.subseries.update.useMutation({
    onSuccess: () => {
      utils.subseries.list.invalidate();
      toast.success("Subseries updated successfully");
      setSubseriesDialogOpen(false);
      setEditingSubseries(null);
      setSubseriesName("");
      setSubseriesSeriesId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update subseries");
    },
  });

  const deleteSubseriesMutation = trpc.subseries.delete.useMutation({
    onSuccess: () => {
      utils.subseries.list.invalidate();
      toast.success("Subseries deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete subseries");
    },
  });

  // Specialty mutations
  const createSpecialtyMutation = trpc.specialties.create.useMutation({
    onSuccess: () => {
      utils.specialties.list.invalidate();
      toast.success("Specialty created successfully");
      setSpecialtyDialogOpen(false);
      setSpecialtyName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create specialty");
    },
  });

  const updateSpecialtyMutation = trpc.specialties.update.useMutation({
    onSuccess: () => {
      utils.specialties.list.invalidate();
      toast.success("Specialty updated successfully");
      setSpecialtyDialogOpen(false);
      setEditingSpecialty(null);
      setSpecialtyName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update specialty");
    },
  });

  const deleteSpecialtyMutation = trpc.specialties.delete.useMutation({
    onSuccess: () => {
      utils.specialties.list.invalidate();
      toast.success("Specialty deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete specialty");
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

  const handleSubseriesSubmit = () => {
    if (!subseriesName.trim()) {
      toast.error("Subseries name is required");
      return;
    }

    if (editingSubseries) {
      updateSubseriesMutation.mutate({ id: editingSubseries.id, name: subseriesName.trim(), seriesId: subseriesSeriesId });
    } else {
      createSubseriesMutation.mutate({ name: subseriesName.trim(), seriesId: subseriesSeriesId });
    }
  };

  const handleSpecialtySubmit = () => {
    if (!specialtyName.trim()) {
      toast.error("Specialty name is required");
      return;
    }

    if (editingSpecialty) {
      updateSpecialtyMutation.mutate({ id: editingSpecialty.id, name: specialtyName.trim() });
    } else {
      createSpecialtyMutation.mutate({ name: specialtyName.trim() });
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
            <CardDescription>Manage brands, series, and specialties</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="brands">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="brands">Brands</TabsTrigger>
                <TabsTrigger value="series">Series</TabsTrigger>
                <TabsTrigger value="subseries">Subseries</TabsTrigger>
                <TabsTrigger value="specialties">Specialties</TabsTrigger>
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

              {/* Subseries Tab */}
              <TabsContent value="subseries" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Subseries</h3>
                  <Button
                    onClick={() => {
                      setEditingSubseries(null);
                      setSubseriesName("");
                      setSubseriesSeriesId(null);
                      setSubseriesDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subseries
                  </Button>
                </div>

                {subseriesLoading ? (
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
                      {subseries?.map((sub) => (
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
                                  setEditingSubseries(sub);
                                  setSubseriesName(sub.name);
                                  setSubseriesSeriesId(sub.seriesId);
                                  setSubseriesDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`Delete subseries "${sub.name}"?`)) {
                                    deleteSubseriesMutation.mutate({ id: sub.id });
                                  }
                                }}
                                disabled={deleteSubseriesMutation.isPending}
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

              {/* Specialties Tab */}
              <TabsContent value="specialties" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Specialties</h3>
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

                {specialtiesLoading ? (
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
                      {specialties?.map((specialty) => (
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

      {/* Subseries Dialog */}
      <Dialog open={subseriesDialogOpen} onOpenChange={setSubseriesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSubseries ? "Edit Subseries" : "Add Subseries"}</DialogTitle>
            <DialogDescription>
              {editingSubseries ? "Update the subseries details" : "Create a new subseries"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subseriesName">Subseries Name</Label>
              <Input
                id="subseriesName"
                value={subseriesName}
                onChange={(e) => setSubseriesName(e.target.value)}
                placeholder="e.g., Silver, Gold, Base"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subseriesSeries">Series (Optional)</Label>
              <Select
                value={subseriesSeriesId?.toString() || ""}
                onValueChange={(value) => setSubseriesSeriesId(value ? parseInt(value) : null)}
              >
                <SelectTrigger id="subseriesSeries">
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
            <Button variant="outline" onClick={() => setSubseriesDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubseriesSubmit}
              disabled={createSubseriesMutation.isPending || updateSubseriesMutation.isPending}
            >
              {createSubseriesMutation.isPending || updateSubseriesMutation.isPending ? (
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
              <Label htmlFor="specialtyName">Specialty Name</Label>
              <Input
                id="specialtyName"
                value={specialtyName}
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
    </div>
  );
}
