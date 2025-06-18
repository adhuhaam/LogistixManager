import Header from "@/components/header";
import TrendChart from "@/components/trend-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Eye, Car, UserCheck, Wrench, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { user, isSuperAdmin, isAdmin } = useAuth();

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['/api/vehicles'],
    queryFn: async () => {
      const response = await fetch('/api/vehicles');
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      return response.json();
    },
  });

  const { data: drivers } = useQuery({
    queryKey: ['/api/drivers'],
    queryFn: async () => {
      const response = await fetch('/api/drivers');
      if (!response.ok) return [];
      return response.json();
    },
    enabled: isAdmin || isSuperAdmin,
  });

  const getDashboardTitle = () => {
    if (isSuperAdmin) return `Welcome back, ${user?.name} (Super Admin)`;
    if (isAdmin) return `Welcome back, ${user?.name} (Admin)`;
    return `Welcome back, ${user?.name}`;
  };

  const getVehicleStats = () => {
    if (!vehicles) return { total: 0, available: 0, assigned: 0, maintenance: 0 };
    
    const total = vehicles.length;
    const available = vehicles.filter((v: any) => v.status === 'available').length;
    const assigned = vehicles.filter((v: any) => v.status === 'assigned').length;
    const maintenance = vehicles.filter((v: any) => v.status === 'maintenance').length;
    
    return { total, available, assigned, maintenance };
  };

  const mockUtilizationData = [65, 70, 75, 80, 85, 88];
  const mockPerformanceData = [85, 87, 90, 88, 92, 94];

  if (vehiclesLoading) {
    return (
      <div className="flex-1 bg-dark-bg">
        <Header title="Dashboard" subtitle="Loading..." />
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-dark-card rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getVehicleStats();

  return (
    <div className="flex-1 bg-dark-bg">
      <Header title="Dashboard" subtitle={getDashboardTitle()} />

      <div className="p-6 space-y-6">
        {/* Vehicle Fleet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-dark-card border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Vehicles</p>
                  <Badge className="bg-blue-500 text-white text-xs px-2 py-1 mt-1">
                    Fleet Size
                  </Badge>
                </div>
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <h2 className="text-3xl font-bold text-white">{stats.total}</h2>
              <p className="text-sm text-gray-400">Active fleet vehicles</p>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Available</p>
                  <Badge className="bg-green-500 text-white text-xs px-2 py-1 mt-1">
                    Ready
                  </Badge>
                </div>
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <h2 className="text-3xl font-bold text-white">{stats.available}</h2>
              <p className="text-sm text-gray-400">Ready for assignment</p>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Assigned</p>
                  <Badge className="bg-yellow-500 text-black text-xs px-2 py-1 mt-1">
                    In Use
                  </Badge>
                </div>
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <h2 className="text-3xl font-bold text-white">{stats.assigned}</h2>
              <p className="text-sm text-gray-400">Currently assigned</p>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Maintenance</p>
                  <Badge className="bg-red-500 text-white text-xs px-2 py-1 mt-1">
                    Service
                  </Badge>
                </div>
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-red-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <h2 className="text-3xl font-bold text-white">{stats.maintenance}</h2>
              <p className="text-sm text-gray-400">Under maintenance</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-dark-card border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Fleet Utilization</p>
                  <Badge className="bg-green-500 text-white text-xs px-2 py-1 mt-1">
                    88% ↑
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="text-gray-400">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-white">88%</h2>
                  <p className="text-sm text-gray-400">Fleet efficiency this month</p>
                </div>
                <div className="chart-container">
                  <TrendChart data={mockUtilizationData} color="#10B981" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Driver Performance</p>
                  <Badge className="bg-yellow-500 text-black text-xs px-2 py-1 mt-1">
                    94% ↑
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="text-gray-400">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-white">94%</h2>
                  <p className="text-sm text-gray-400">Average performance score</p>
                </div>
                <div className="chart-container">
                  <TrendChart data={mockPerformanceData} color="#F59E0B" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Vehicle Activity */}
        <Card className="bg-dark-card border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Fleet Overview</CardTitle>
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
                View All Vehicles
              </Button>
            </div>
            <p className="text-sm text-gray-400">
              Current status of your vehicle fleet and assignments.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4 text-sm text-gray-400 pb-2 border-b border-gray-800">
                <div>Vehicle</div>
                <div>Type</div>
                <div>Status</div>
                <div>Driver</div>
                <div>Last Updated</div>
              </div>
              
              <div className="space-y-3">
                {vehicles?.slice(0, 6).map((vehicle: any) => (
                  <div key={vehicle.id} className="grid grid-cols-5 gap-4 items-center py-3 hover:bg-dark-elevated rounded-lg px-3 -mx-3 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-primary rounded-full flex items-center justify-center">
                        <Car className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-white block">{vehicle.make} {vehicle.model}</span>
                        <span className="text-xs text-gray-400">{vehicle.year}</span>
                      </div>
                    </div>
                    <div className="text-gray-300 capitalize">{vehicle.fuelType}</div>
                    <div>
                      <Badge 
                        variant={vehicle.status === 'available' ? 'default' : 
                                vehicle.status === 'assigned' ? 'secondary' : 'destructive'} 
                        className="text-xs"
                      >
                        {vehicle.status}
                      </Badge>
                    </div>
                    <div className="text-gray-300">
                      {vehicle.assignedDriverId ? 'Assigned' : 'Unassigned'}
                    </div>
                    <div className="text-gray-300">
                      {new Date(vehicle.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Statistics - Only for Admin and Super Admin */}
        {(isAdmin || isSuperAdmin) && drivers && (
          <Card className="bg-dark-card border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Driver Management</CardTitle>
                <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
                  Manage Drivers
                </Button>
              </div>
              <p className="text-sm text-gray-400">
                Overview of driver assignments and status.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-dark-elevated rounded-lg">
                  <h3 className="text-2xl font-bold text-white">{drivers.length}</h3>
                  <p className="text-sm text-gray-400">Total Drivers</p>
                </div>
                <div className="text-center p-4 bg-dark-elevated rounded-lg">
                  <h3 className="text-2xl font-bold text-green-500">
                    {drivers.filter((d: any) => d.status === 'active').length}
                  </h3>
                  <p className="text-sm text-gray-400">Active Drivers</p>
                </div>
                <div className="text-center p-4 bg-dark-elevated rounded-lg">
                  <h3 className="text-2xl font-bold text-yellow-500">
                    {vehicles?.filter((v: any) => v.assignedDriverId).length || 0}
                  </h3>
                  <p className="text-sm text-gray-400">Currently Assigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}