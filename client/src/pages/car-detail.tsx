import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import { 
  ArrowLeft, 
  Eye, 
  Upload, 
  Plus, 
  Leaf, 
  Zap, 
  Gauge, 
  Users, 
  Snowflake, 
  Navigation, 
  Smartphone,
  Settings,
  Calendar,
  Battery,
  Fuel
} from "lucide-react";
import { Link } from "wouter";
import type { Car } from "@shared/schema";

export default function CarDetail() {
  const [, params] = useRoute("/car-detail/:id");
  const carId = params?.id ? parseInt(params.id) : 0;

  const { data: car, isLoading } = useQuery<Car>({
    queryKey: [`/api/cars/${carId}`],
    enabled: !!carId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <MobileNav />
        <div className="flex">
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          <main className="flex-1 bg-dark-bg p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="h-64 bg-gray-700 rounded-xl mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-40 bg-gray-700 rounded-xl"></div>
                  <div className="h-32 bg-gray-700 rounded-xl"></div>
                </div>
                <div className="h-96 bg-gray-700 rounded-xl"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Car Not Found</h1>
          <Link href="/car-listings">
            <Button className="bg-purple-primary hover:bg-purple-dark">
              Back to Car Listings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getCarIcon = (feature: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      "Hybrid Car": Leaf,
      "Electric Car": Zap,
      "Electric": Zap,
      "Gasoline": Fuel,
      "Smart AC": Snowflake,
      "Smart Tracking": Navigation,
      "Smart Control": Smartphone,
      "Advanced Gear": Settings,
    };
    return iconMap[feature] || Settings;
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Mobile Navigation */}
      <MobileNav />

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-dark-bg">
          {/* Mobile Content */}
          <div className="lg:hidden">
            {/* Mobile Header */}
            <div className="p-4">
              <Link href="/car-listings">
                <Button variant="ghost" size="icon" className="text-gray-400 mb-4">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              
              {/* Car Info */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">BMW</span>
                </div>
                <div>
                  <p className="font-medium text-white">{car.model}</p>
                  <p className="text-sm text-gray-400 capitalize">Plug in {car.type} Car</p>
                </div>
              </div>

              {/* 360 Car View */}
              <div className="relative mb-4">
                <img 
                  src={car.imageUrl} 
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-48 object-cover rounded-xl"
                />
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex space-x-2 mb-4">
                {car.thumbnails.slice(0, 3).map((thumb, index) => (
                  <img 
                    key={index}
                    src={thumb} 
                    alt={`${car.make} view ${index + 1}`}
                    className="w-12 h-12 object-cover rounded-lg opacity-60" 
                  />
                ))}
                <div className="w-12 h-12 bg-dark-bg rounded-lg flex items-center justify-center text-xs text-gray-400">
                  360° View
                </div>
              </div>

              <p className="text-2xl font-bold text-white mb-4">
                ${parseFloat(car.price).toLocaleString()}
              </p>

              {/* Key Features */}
              <div className="space-y-3 mb-6">
                <h4 className="font-medium text-white">Key Features</h4>
                <div className="grid grid-cols-3 gap-3">
                  {car.features.slice(0, 6).map((feature, index) => {
                    const Icon = getCarIcon(feature);
                    return (
                      <div key={index} className="text-center">
                        <div className="w-12 h-12 bg-dark-bg rounded-xl flex items-center justify-center mb-2 mx-auto">
                          <Icon className="w-5 h-5 text-trend-green" />
                        </div>
                        <p className="text-xs text-gray-400">{feature}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Car Description */}
              <div>
                <h4 className="font-medium mb-2 text-white">Car Description</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {car.description || "High-performance luxury vehicle with advanced technology features."}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Content */}
          <div className="hidden lg:block p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Link href="/car-listings">
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-white">Car Details</h1>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" className="bg-dark-elevated border-gray-700 text-white">
                  <Eye className="w-4 h-4 mr-2" />
                  View as customer
                </Button>
                <Button className="bg-purple-primary hover:bg-purple-dark text-white">
                  Update
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Car Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Car Images */}
                <Card className="bg-dark-card border-gray-800">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Car Images</h3>
                    
                    {/* Main Image */}
                    <div className="relative mb-4">
                      <img 
                        src={car.imageUrl} 
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-64 object-cover rounded-xl"
                      />
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                        <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" className="bg-dark-elevated border-gray-700 text-white mb-4 w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload 360° Image
                    </Button>

                    {/* Thumbnail Gallery */}
                    <div className="grid grid-cols-4 gap-3">
                      {car.thumbnails.map((thumb, index) => (
                        <img 
                          key={index}
                          src={thumb} 
                          alt={`${car.make} view ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg" 
                        />
                      ))}
                      <div className="w-full h-20 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-primary transition-colors">
                        <Plus className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Specifications */}
                <Card className="bg-dark-card border-gray-800">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Specifications</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Car Type</label>
                        <div className="p-3 bg-dark-elevated rounded-lg">
                          <span className="text-white capitalize">{car.type} Car</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Launch Date</label>
                        <div className="p-3 bg-dark-elevated rounded-lg">
                          <span className="text-white">{car.year}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Horsepower</label>
                        <div className="p-3 bg-dark-elevated rounded-lg">
                          <span className="text-white">{car.horsepower} HP</span>
                        </div>
                      </div>
                      
                      {car.kilowatts && (
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Power Output</label>
                          <div className="p-3 bg-dark-elevated rounded-lg">
                            <span className="text-white">{car.kilowatts} KW</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Car Info */}
              <div className="space-y-6">
                {/* Car Info Card */}
                <Card className="bg-dark-card border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">BMW</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{car.model}</h3>
                        <p className="text-sm text-gray-400 capitalize">{car.type} Car</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm text-gray-400 mb-1">Asking Price</p>
                      <p className="text-3xl font-bold text-white">
                        ${parseFloat(car.price).toLocaleString()}
                      </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-dark-elevated rounded-lg">
                        <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                          <Gauge className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-400">{car.horsepower} HP</p>
                      </div>
                      
                      <div className="text-center p-3 bg-dark-elevated rounded-lg">
                        <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-400">{car.seats} Seats</p>
                      </div>
                      
                      <div className="text-center p-3 bg-dark-elevated rounded-lg">
                        <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                          {car.type === "electric" ? <Battery className="w-5 h-5 text-trend-green" /> : <Fuel className="w-5 h-5 text-gray-400" />}
                        </div>
                        <p className="text-sm text-gray-400 capitalize">{car.type}</p>
                      </div>
                      
                      <div className="text-center p-3 bg-dark-elevated rounded-lg">
                        <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-400">{car.year}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="font-medium text-white mb-3">Key Features</h4>
                      <div className="space-y-2">
                        {car.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-primary rounded-full"></div>
                            <span className="text-sm text-gray-400">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="mb-4">
                      <h4 className="font-medium text-white mb-2">Status</h4>
                      <Badge className={`${
                        car.status === "available" 
                          ? "bg-green-900 text-green-300" 
                          : car.status === "sold"
                          ? "bg-blue-900 text-blue-300"
                          : "bg-yellow-900 text-yellow-300"
                      }`}>
                        {car.status?.charAt(0).toUpperCase() + car.status?.slice(1)}
                      </Badge>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="font-medium text-white mb-2">Description</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {car.description || "High-performance luxury vehicle with advanced technology features and premium interior finishes."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
