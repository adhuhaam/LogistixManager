import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Car, Fuel, Calendar, Settings } from "lucide-react";

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
}

export default function CarListings() {
  const { canManageVehicles } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    make: '', model: '', year: new Date().getFullYear(), registrationNumber: '',
    chassisNumber: '', engineNumber: '', fuelType: 'hybrid', horsepower: 200,
    kilowatts: 150, seats: 4, color: '', imageUrl: '/images/default-car.jpg',
    registrationDate: new Date().toISOString().split('T')[0],
    registrationExpiry: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
    insuranceNumber: '', insuranceExpiry: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
    mileage: 0
  });

  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
    queryFn: async () => {
      const response = await fetch('/api/vehicles');
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      return response.json();
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (vehicleData: any) => {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData),
      });
      if (!response.ok) throw new Error('Failed to create vehicle');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      setIsAddDialogOpen(false);
      setNewVehicle({
        make: '', model: '', year: new Date().getFullYear(), registrationNumber: '',
        chassisNumber: '', engineNumber: '', fuelType: 'hybrid', horsepower: 200,
        kilowatts: 150, seats: 4, color: '', imageUrl: '/images/default-car.jpg',
        registrationDate: new Date().toISOString().split('T')[0],
        registrationExpiry: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
        insuranceNumber: '', insuranceExpiry: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
        mileage: 0
      });
      toast({ title: "Vehicle added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add vehicle", variant: "destructive" });
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, vehicleData }: { id: number; vehicleData: any }) => {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData),
      });
      if (!response.ok) throw new Error('Failed to update vehicle');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      setEditingVehicle(null);
      toast({ title: "Vehicle updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update vehicle", variant: "destructive" });
    },
  });

  const filteredVehicles = vehicles?.filter(vehicle =>
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    createVehicleMutation.mutate(newVehicle);
  };

  const handleUpdateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      updateVehicleMutation.mutate({ id: editingVehicle.id, vehicleData: editingVehicle });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'assigned': return 'bg-yellow-500';
      case 'maintenance': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-dark-bg">
        <Header title="Vehicle Fleet" subtitle="Loading vehicles..." />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-dark-card rounded-lg animate-pulse"></div>
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
                  <DialogTitle className="text-white">Add New Vehicle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateVehicle} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Make</Label>
                      <Input
                        value={newVehicle.make}
                        onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Model</Label>
                      <Input
                        value={newVehicle.model}
                        onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Year</Label>
                      <Input
                        type="number"
                        value={newVehicle.year}
                        onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Registration Number</Label>
                      <Input
                        value={newVehicle.registrationNumber}
                        onChange={(e) => setNewVehicle({ ...newVehicle, registrationNumber: e.target.value })}
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Fuel Type</Label>
                      <Select value={newVehicle.fuelType} onValueChange={(value) => setNewVehicle({ ...newVehicle, fuelType: value })}>
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
                        onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-purple-primary hover:bg-purple-dark">
                    Add Vehicle
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="bg-dark-card border-gray-800 hover:border-purple-primary transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-primary rounded-lg flex items-center justify-center">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{vehicle.make} {vehicle.model}</CardTitle>
                      <p className="text-gray-400 text-sm">{vehicle.year} • {vehicle.registrationNumber}</p>
                    </div>
                  </div>
                  {canManageVehicles() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingVehicle(vehicle)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={`${getStatusColor(vehicle.status)} text-white`}>
                    {vehicle.status.toUpperCase()}
                  </Badge>
                  <span className="text-gray-400 text-sm capitalize">{vehicle.fuelType}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Fuel className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{vehicle.horsepower} HP</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{vehicle.seats} Seats</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{vehicle.mileage.toLocaleString()} mi</span>
                  </div>
                  <div className="text-gray-300">
                    {vehicle.assignedDriverId ? 'Assigned' : 'Available'}
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-400">Color: {vehicle.color}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No vehicles found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first vehicle'}
            </p>
            {canManageVehicles() && !searchTerm && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-purple-primary hover:bg-purple-dark">
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Edit Vehicle Dialog */}
      {editingVehicle && (
        <Dialog open={!!editingVehicle} onOpenChange={() => setEditingVehicle(null)}>
          <DialogContent className="bg-dark-card border-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Vehicle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Make</Label>
                  <Input
                    value={editingVehicle.make}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, make: e.target.value })}
                    className="bg-dark-elevated border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Model</Label>
                  <Input
                    value={editingVehicle.model}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                    className="bg-dark-elevated border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Status</Label>
                  <Select value={editingVehicle.status} onValueChange={(value) => setEditingVehicle({ ...editingVehicle, status: value })}>
                    <SelectTrigger className="bg-dark-elevated border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-elevated border-gray-700">
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">Mileage</Label>
                  <Input
                    type="number"
                    value={editingVehicle.mileage}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, mileage: parseInt(e.target.value) })}
                    className="bg-dark-elevated border-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1 bg-purple-primary hover:bg-purple-dark">
                  Update Vehicle
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingVehicle(null)} className="border-gray-700 text-gray-300">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}