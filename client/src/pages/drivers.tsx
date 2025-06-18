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
import { Search, Plus, Edit, UserCheck, Phone, Mail, Calendar, Award } from "lucide-react";

interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  experience: number;
  status: string;
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  status: string;
  assignedDriverId?: number;
}

export default function DriversPage() {
  const { canManageDrivers } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [newDriver, setNewDriver] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
    experience: 1,
    status: 'active'
  });

  const { data: drivers, isLoading } = useQuery<Driver[]>({
    queryKey: ['/api/drivers'],
    queryFn: async () => {
      const response = await fetch('/api/drivers');
      if (!response.ok) throw new Error('Failed to fetch drivers');
      return response.json();
    },
  });

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
    queryFn: async () => {
      const response = await fetch('/api/vehicles');
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      return response.json();
    },
  });

  const createDriverMutation = useMutation({
    mutationFn: async (driverData: any) => {
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData),
      });
      if (!response.ok) throw new Error('Failed to create driver');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
      setIsAddDialogOpen(false);
      setNewDriver({
        name: '',
        email: '',
        phone: '',
        licenseNumber: '',
        licenseExpiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
        experience: 1,
        status: 'active'
      });
      toast({ title: "Driver added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add driver", variant: "destructive" });
    },
  });

  const updateDriverMutation = useMutation({
    mutationFn: async ({ id, driverData }: { id: number; driverData: any }) => {
      const response = await fetch(`/api/drivers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData),
      });
      if (!response.ok) throw new Error('Failed to update driver');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
      setEditingDriver(null);
      toast({ title: "Driver updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update driver", variant: "destructive" });
    },
  });

  const assignVehicleMutation = useMutation({
    mutationFn: async ({ vehicleId, driverId }: { vehicleId: number; driverId: number }) => {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, driverId, assignedBy: 1 }),
      });
      if (!response.ok) throw new Error('Failed to assign vehicle');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
      setIsAssignDialogOpen(false);
      setSelectedDriver(null);
      toast({ title: "Vehicle assigned successfully" });
    },
    onError: () => {
      toast({ title: "Failed to assign vehicle", variant: "destructive" });
    },
  });

  const filteredDrivers = drivers?.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const availableVehicles = vehicles?.filter(vehicle => 
    vehicle.status === 'available' || !vehicle.assignedDriverId
  ) || [];

  const handleCreateDriver = (e: React.FormEvent) => {
    e.preventDefault();
    createDriverMutation.mutate(newDriver);
  };

  const handleUpdateDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      updateDriverMutation.mutate({ id: editingDriver.id, driverData: editingDriver });
    }
  };

  const handleAssignVehicle = (vehicleId: number) => {
    if (selectedDriver) {
      assignVehicleMutation.mutate({ vehicleId, driverId: selectedDriver.id });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const isLicenseExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-dark-bg">
        <Header title="Driver Management" subtitle="Loading drivers..." />
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
      <Header title="Driver Management" subtitle="Manage your driver workforce" />

      <div className="p-6 space-y-6">
        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-dark-card border-gray-700 text-white"
              />
            </div>
          </div>
          
          {canManageDrivers() && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-primary hover:bg-purple-dark text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Driver
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-dark-card border-gray-800 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Driver</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateDriver} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Full Name</Label>
                      <Input
                        value={newDriver.name}
                        onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Email</Label>
                      <Input
                        type="email"
                        value={newDriver.email}
                        onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Phone</Label>
                      <Input
                        value={newDriver.phone}
                        onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">License Number</Label>
                      <Input
                        value={newDriver.licenseNumber}
                        onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">License Expiry</Label>
                      <Input
                        type="date"
                        value={newDriver.licenseExpiryDate}
                        onChange={(e) => setNewDriver({ ...newDriver, licenseExpiryDate: e.target.value })}
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Experience (Years)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newDriver.experience}
                        onChange={(e) => setNewDriver({ ...newDriver, experience: parseInt(e.target.value) })}
                        className="bg-dark-elevated border-gray-700 text-white"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-purple-primary hover:bg-purple-dark">
                    Add Driver
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Driver Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <Card key={driver.id} className="bg-dark-card border-gray-800 hover:border-purple-primary transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-primary rounded-lg flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{driver.name}</CardTitle>
                      <p className="text-gray-400 text-sm">{driver.licenseNumber}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {canManageDrivers() && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDriver(driver);
                            setIsAssignDialogOpen(true);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingDriver(driver)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={`${getStatusColor(driver.status)} text-white`}>
                    {driver.status.toUpperCase()}
                  </Badge>
                  {isLicenseExpiringSoon(driver.licenseExpiryDate) && (
                    <Badge variant="destructive" className="text-xs">
                      License Expiring
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 truncate">{driver.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{driver.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Expires: {new Date(driver.licenseExpiryDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{driver.experience} years experience</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDrivers.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No drivers found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first driver'}
            </p>
            {canManageDrivers() && !searchTerm && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-purple-primary hover:bg-purple-dark">
                <Plus className="w-4 h-4 mr-2" />
                Add Driver
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Edit Driver Dialog */}
      {editingDriver && (
        <Dialog open={!!editingDriver} onOpenChange={() => setEditingDriver(null)}>
          <DialogContent className="bg-dark-card border-gray-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Driver</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateDriver} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Full Name</Label>
                  <Input
                    value={editingDriver.name}
                    onChange={(e) => setEditingDriver({ ...editingDriver, name: e.target.value })}
                    className="bg-dark-elevated border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Email</Label>
                  <Input
                    type="email"
                    value={editingDriver.email}
                    onChange={(e) => setEditingDriver({ ...editingDriver, email: e.target.value })}
                    className="bg-dark-elevated border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Phone</Label>
                  <Input
                    value={editingDriver.phone}
                    onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })}
                    className="bg-dark-elevated border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Status</Label>
                  <Select value={editingDriver.status} onValueChange={(value) => setEditingDriver({ ...editingDriver, status: value })}>
                    <SelectTrigger className="bg-dark-elevated border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-elevated border-gray-700">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1 bg-purple-primary hover:bg-purple-dark">
                  Update Driver
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingDriver(null)} className="border-gray-700 text-gray-300">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Vehicle Assignment Dialog */}
      {isAssignDialogOpen && selectedDriver && (
        <Dialog open={isAssignDialogOpen} onOpenChange={() => setIsAssignDialogOpen(false)}>
          <DialogContent className="bg-dark-card border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Assign Vehicle to {selectedDriver.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-400">Select a vehicle to assign to this driver:</p>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {availableVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-3 bg-dark-elevated rounded-lg border border-gray-700 hover:border-purple-primary transition-colors cursor-pointer"
                    onClick={() => handleAssignVehicle(vehicle.id)}
                  >
                    <div>
                      <h4 className="text-white font-medium">{vehicle.make} {vehicle.model}</h4>
                      <p className="text-gray-400 text-sm">Status: {vehicle.status}</p>
                    </div>
                    <Button size="sm" className="bg-purple-primary hover:bg-purple-dark">
                      Assign
                    </Button>
                  </div>
                ))}
              </div>
              {availableVehicles.length === 0 && (
                <p className="text-gray-400 text-center py-8">No available vehicles to assign</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}