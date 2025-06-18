import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Edit,
  Car,
  Fuel,
  Calendar,
  Settings,
  Eye,
  MapPin,
  Shield,
  FileCheck,
  Truck,
} from "lucide-react";

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  fuelType: string;
  horsepower: number;
  seats: number;
  color: string;
  status: string;
  mileage: number;
  assignedDriverId?: number;
  category: string;
  roadworthinessExpiry: string;
  annualFeeExpiry: string;
  insuranceExpiry: string;
  location: string;
  imageUrl: string;
}

interface Driver {
  id: number;
  name: string;
  email: string;
  status: string;
}

export default function CarListings() {
  const { canManageVehicles } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    registrationNumber: "",
    chassisNumber: "",
    engineNumber: "",
    fuelType: "hybrid",
    horsepower: 200,
    kilowatts: 150,
    seats: 4,
    color: "",
    imageUrl: "/images/default-car.jpg",
    registrationDate: new Date().toISOString().split("T")[0],
    registrationExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    insuranceNumber: "",
    insuranceExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    mileage: 0,
    category: "sedan",
    location: "Main Depot",
    roadworthinessExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    annualFeeExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    queryFn: async () => {
      const response = await fetch("/api/vehicles");
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      return response.json();
    },
  });

  const { data: drivers } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
    queryFn: async () => {
      const response = await fetch("/api/drivers");
      if (!response.ok) throw new Error("Failed to fetch drivers");
      return response.json();
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (vehicleData: any) => {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleData),
      });
      if (!response.ok) throw new Error("Failed to create vehicle");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setIsAddDialogOpen(false);
      setNewVehicle({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        registrationNumber: "",
        chassisNumber: "",
        engineNumber: "",
        fuelType: "hybrid",
        horsepower: 200,
        kilowatts: 150,
        seats: 4,
        color: "",
        imageUrl: "/images/default-car.jpg",
        registrationDate: new Date().toISOString().split("T")[0],
        registrationExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        insuranceNumber: "",
        insuranceExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        mileage: 0,
        category: "sedan",
        location: "Main Depot",
        roadworthinessExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        annualFeeExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      });
      toast({ title: "Vehicle added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add vehicle", variant: "destructive" });
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async ({
      id,
      vehicleData,
    }: {
      id: number;
      vehicleData: any;
    }) => {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleData),
      });
      if (!response.ok) throw new Error("Failed to update vehicle");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setEditingVehicle(null);
      toast({ title: "Vehicle updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update vehicle", variant: "destructive" });
    },
  });

  const filteredVehicles =
    vehicles?.filter(
      (vehicle) =>
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.registrationNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    ) || [];

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    createVehicleMutation.mutate(newVehicle);
  };

  const handleUpdateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      updateVehicleMutation.mutate({
        id: editingVehicle.id,
        vehicleData: editingVehicle,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "assigned":
        return "bg-yellow-500";
      case "maintenance":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-dark-bg">
        <Header title="Vehicle Fleet" subtitle="Loading vehicles..." />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-dark-card rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-dark-bg">
      <Header title="Vehicle Fleet" subtitle="Manage your vehicle inventory" />

      <div className="p-6 space-y-6">
        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-dark-card border-gray-700 text-white"
              />
            </div>
          </div>

          {canManageVehicles() && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-primary hover:bg-purple-dark text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-dark-card border-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Add New Vehicle
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateVehicle} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Make</Label>
                      <Input
                        value={newVehicle.make}
                        onChange={(e) =>
                          setNewVehicle({ ...newVehicle, make: e.target.value })
                        }
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Model</Label>
                      <Input
                        value={newVehicle.model}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            model: e.target.value,
                          })
                        }
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Year</Label>
                      <Input
                        type="number"
                        value={newVehicle.year}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            year: parseInt(e.target.value),
                          })
                        }
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">
                        Registration Number
                      </Label>
                      <Input
                        value={newVehicle.registrationNumber}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            registrationNumber: e.target.value,
                          })
                        }
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Category</Label>
                      <Select
                        value={newVehicle.category}
                        onValueChange={(value) =>
                          setNewVehicle({ ...newVehicle, category: value })
                        }
                      >
                        <SelectTrigger className="bg-dark-elevated border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-elevated border-gray-700">
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="coupe">Coupe</SelectItem>
                          <SelectItem value="hatchback">Hatchback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Fuel Type</Label>
                      <Select
                        value={newVehicle.fuelType}
                        onValueChange={(value) =>
                          setNewVehicle({ ...newVehicle, fuelType: value })
                        }
                      >
                        <SelectTrigger className="bg-dark-elevated border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-elevated border-gray-700">
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="electric">Electric</SelectItem>
                          <SelectItem value="gasoline">Gasoline</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Color</Label>
                      <Input
                        value={newVehicle.color}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            color: e.target.value,
                          })
                        }
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Location</Label>
                      <Input
                        value={newVehicle.location}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            location: e.target.value,
                          })
                        }
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Vehicle Image URL</Label>
                      <Input
                        value={newVehicle.imageUrl}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            imageUrl: e.target.value,
                          })
                        }
                        className="bg-dark-elevated border-gray-700 text-white"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Insurance Number</Label>
                      <Input
                        value={newVehicle.insuranceNumber}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            insuranceNumber: e.target.value,
                          })
                        }
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Insurance Expiry</Label>
                      <Input
                        type="date"
                        value={newVehicle.insuranceExpiry}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            insuranceExpiry: e.target.value,
                          })
                        }
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">
                        Roadworthiness Expiry
                      </Label>
                      <Input
                        type="date"
                        value={newVehicle.roadworthinessExpiry}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            roadworthinessExpiry: e.target.value,
                          })
                        }
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Annual Fee Expiry</Label>
                      <Input
                        type="date"
                        value={newVehicle.annualFeeExpiry}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            annualFeeExpiry: e.target.value,
                          })
                        }
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-purple-primary hover:bg-purple-dark"
                  >
                    Add Vehicle
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Vehicle Grid - 4 cards layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredVehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="bg-dark-card border-gray-800 hover:border-purple-primary transition-colors"
            >
              {/* Vehicle Image */}
              <div className="h-48 bg-gray-800 rounded-t-lg overflow-hidden">
                <img
                  src={vehicle.imageUrl || "/images/default-car.jpg"}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/default-car.jpg";
                  }}
                />
              </div>

              <CardHeader className="pb-3">
                <div>
                  <CardTitle className="text-white text-lg">
                    {vehicle.make} {vehicle.model}
                  </CardTitle>
                  <p className="text-gray-400 text-sm">
                    {vehicle.year} • {vehicle.registrationNumber}
                  </p>
                  <p className="text-purple-primary text-xs font-medium uppercase">
                    {vehicle.category}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge
                    className={`${getStatusColor(vehicle.status)} text-white`}
                  >
                    {vehicle.status.toUpperCase()}
                  </Badge>
                  <span className="text-gray-400 text-sm capitalize">
                    {vehicle.fuelType}
                  </span>
                </div>

                {/* Key Information with Icons */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-purple-primary" />
                      <span className="text-gray-400">Location:</span>
                    </div>
                    <span className="text-gray-300 font-medium">
                      {vehicle.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400">Driver:</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${vehicle.assignedDriverId ? "text-green-400" : "text-yellow-400"}`}
                    >
                      {vehicle.assignedDriverId ? "Assigned" : "Available"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Fuel className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-400">Fuel:</span>
                    </div>
                    <span className="text-gray-300 font-medium capitalize">
                      {vehicle.fuelType}
                    </span>
                  </div>
                </div>

                {/* Expiry Dates with Icons */}
                <div className="pt-3 border-t border-gray-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-3 h-3 text-green-400" />
                      <span className="text-gray-400">Roadworthy:</span>
                    </div>
                    <span
                      className={`${new Date(vehicle.roadworthinessExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "text-red-400" : "text-gray-300"}`}
                    >
                      {new Date(
                        vehicle.roadworthinessExpiry,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileCheck className="w-3 h-3 text-blue-400" />
                      <span className="text-gray-400">Annual Fee:</span>
                    </div>
                    <span
                      className={`${new Date(vehicle.annualFeeExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "text-red-400" : "text-gray-300"}`}
                    >
                      {new Date(vehicle.annualFeeExpiry).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3 text-yellow-400" />
                      <span className="text-gray-400">Insurance:</span>
                    </div>
                    <span
                      className={`${new Date(vehicle.insuranceExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "text-red-400" : "text-gray-300"}`}
                    >
                      {new Date(vehicle.insuranceExpiry).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-gray-700 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingVehicle(vehicle)}
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-dark-elevated hover:text-white"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {canManageVehicles() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingVehicle(vehicle)}
                      className="flex-1 border-gray-700 text-gray-300 hover:bg-purple-primary hover:text-white hover:border-purple-primary"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No vehicles found
            </h3>
            <p className="text-gray-400 mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by adding your first vehicle"}
            </p>
            {canManageVehicles() && !searchTerm && (
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-purple-primary hover:bg-purple-dark"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Edit Vehicle Dialog */}
      {editingVehicle && (
        <Dialog
          open={!!editingVehicle}
          onOpenChange={() => setEditingVehicle(null)}
        >
          <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Edit Vehicle - {editingVehicle.make} {editingVehicle.model}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateVehicle} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Make</Label>
                  <Input
                    value={editingVehicle.make}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        make: e.target.value,
                      })
                    }
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">Model</Label>
                  <Input
                    value={editingVehicle.model}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        model: e.target.value,
                      })
                    }
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Registration Number
                  </Label>
                  <Input
                    value={editingVehicle.registrationNumber}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        registrationNumber: e.target.value,
                      })
                    }
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <Select
                    value={editingVehicle.category}
                    onValueChange={(value) =>
                      setEditingVehicle({ ...editingVehicle, category: value })
                    }
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="coupe">Coupe</SelectItem>
                      <SelectItem value="hatchback">Hatchback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Select
                    value={editingVehicle.status}
                    onValueChange={(value) =>
                      setEditingVehicle({ ...editingVehicle, status: value })
                    }
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground">Assign Driver</Label>
                  <Select
                    value={editingVehicle.assignedDriverId?.toString() || "none"}
                    onValueChange={(value) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        assignedDriverId: value !== "none" ? parseInt(value) : undefined,
                        status: value !== "none" ? "assigned" : "available",
                      })
                    }
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="none">No Driver</SelectItem>
                      {drivers
                        ?.filter((driver) => driver.status === "active")
                        .map((driver) => (
                          <SelectItem
                            key={driver.id}
                            value={driver.id.toString()}
                          >
                            {driver.name} ({driver.email})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <Input
                    value={editingVehicle.location}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        location: e.target.value,
                      })
                    }
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">Mileage</Label>
                  <Input
                    type="number"
                    value={editingVehicle.mileage}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        mileage: parseInt(e.target.value),
                      })
                    }
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Vehicle Image URL
                  </Label>
                  <Input
                    value={editingVehicle.imageUrl}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        imageUrl: e.target.value,
                      })
                    }
                    className="bg-background border-border text-foreground"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Roadworthiness Expiry
                  </Label>
                  <Input
                    type="date"
                    value={editingVehicle.roadworthinessExpiry?.split("T")[0]}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        roadworthinessExpiry: e.target.value,
                      })
                    }
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Annual Fee Expiry
                  </Label>
                  <Input
                    type="date"
                    value={editingVehicle.annualFeeExpiry?.split("T")[0]}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        annualFeeExpiry: e.target.value,
                      })
                    }
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Insurance Expiry
                  </Label>
                  <Input
                    type="date"
                    value={editingVehicle.insuranceExpiry?.split("T")[0]}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        insuranceExpiry: e.target.value,
                      })
                    }
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              {/* Image Preview */}
              {editingVehicle.imageUrl && (
                <div>
                  <Label className="text-gray-300">Image Preview</Label>
                  <div className="mt-2 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={editingVehicle.imageUrl}
                      alt="Vehicle preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  className="flex-1 bg-purple-primary hover:bg-purple-dark"
                >
                  Update Vehicle
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingVehicle(null)}
                  className="border-gray-700 text-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Vehicle Detail View Dialog */}
      {viewingVehicle && (
        <Dialog
          open={!!viewingVehicle}
          onOpenChange={() => setViewingVehicle(null)}
        >
          <DialogContent className="bg-dark-card border-gray-800 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">
                {viewingVehicle.make} {viewingVehicle.model} (
                {viewingVehicle.year})
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Vehicle Image */}
              <div className="w-full h-64 bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={viewingVehicle.imageUrl || "/images/default-car.jpg"}
                  alt={`${viewingVehicle.make} ${viewingVehicle.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/default-car.jpg";
                  }}
                />
              </div>

              {/* Vehicle Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        Registration Number:
                      </span>
                      <span className="text-white font-medium">
                        {viewingVehicle.registrationNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-purple-primary font-medium uppercase">
                        {viewingVehicle.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge
                        className={`${getStatusColor(viewingVehicle.status)} text-white`}
                      >
                        {viewingVehicle.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Color:</span>
                      <span className="text-white">{viewingVehicle.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fuel Type:</span>
                      <span className="text-white capitalize">
                        {viewingVehicle.fuelType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Horsepower:</span>
                      <span className="text-white">
                        {viewingVehicle.horsepower} HP
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Seats:</span>
                      <span className="text-white">{viewingVehicle.seats}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mileage:</span>
                      <span className="text-white">
                        {viewingVehicle.mileage?.toLocaleString() || 0} mi
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location & Assignment */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    Assignment & Location
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Location:</span>
                      <span className="text-white font-medium">
                        {viewingVehicle.location}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Driver Status:</span>
                      <span
                        className={`font-medium ${viewingVehicle.assignedDriverId ? "text-green-400" : "text-yellow-400"}`}
                      >
                        {viewingVehicle.assignedDriverId
                          ? "Assigned"
                          : "Available"}
                      </span>
                    </div>
                    {viewingVehicle.assignedDriverId && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Driver ID:</span>
                        <span className="text-white">
                          #{viewingVehicle.assignedDriverId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compliance & Expiry Dates */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    Compliance & Expiry Dates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-dark-elevated p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="w-5 h-5 text-green-400" />
                        <span className="text-gray-300 font-medium">
                          Roadworthiness
                        </span>
                      </div>
                      <p
                        className={`text-sm ${new Date(viewingVehicle.roadworthinessExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "text-red-400" : "text-gray-300"}`}
                      >
                        Expires:{" "}
                        {new Date(
                          viewingVehicle.roadworthinessExpiry,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-dark-elevated p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileCheck className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-300 font-medium">
                          Annual Fee
                        </span>
                      </div>
                      <p
                        className={`text-sm ${new Date(viewingVehicle.annualFeeExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "text-red-400" : "text-gray-300"}`}
                      >
                        Expires:{" "}
                        {new Date(
                          viewingVehicle.annualFeeExpiry,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-dark-elevated p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-300 font-medium">
                          Insurance
                        </span>
                      </div>
                      <p
                        className={`text-sm ${new Date(viewingVehicle.insuranceExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "text-red-400" : "text-gray-300"}`}
                      >
                        Expires:{" "}
                        {new Date(
                          viewingVehicle.insuranceExpiry,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
                {canManageVehicles() && (
                  <Button
                    onClick={() => {
                      setViewingVehicle(null);
                      setEditingVehicle(viewingVehicle);
                    }}
                    className="bg-purple-primary hover:bg-purple-dark"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Vehicle
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setViewingVehicle(null)}
                  className="border-gray-700 text-gray-300"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
