import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Leaf, 
  Zap, 
  Gauge, 
  Users, 
  Snowflake, 
  Navigation, 
  Smartphone,
  Fuel,
  Shield,
  Wifi,
  Settings,
  Clock
} from "lucide-react";
import type { Car } from "@shared/schema";

interface CarCardProps {
  car: Car;
  className?: string;
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
    "Climate Control": Snowflake,
    "Connected Drive": Wifi,
    "Active Safety": Shield,
    "M Performance": Settings,
    "Track Mode": Clock,
    "Adaptive M": Settings,
    "AI Assistant": Smartphone,
    "Fast Charging": Zap,
    "Digital Key": Smartphone,
    "Advanced Gear": Settings,
    "RWD": Navigation,
  };
  
  return iconMap[feature] || Settings;
};

const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "hybrid":
    case "electric":
      return "text-trend-green";
    case "gasoline":
      return "text-orange-400";
    default:
      return "text-gray-400";
  }
};

export default function CarCard({ car, className = "" }: CarCardProps) {
  const primaryFeatures = car.features.slice(0, 3);
  const secondaryFeatures = car.features.slice(3, 6);

  return (
    <Card className={`bg-dark-card border-gray-800 hover:shadow-xl transition-shadow ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">BMW</span>
            </div>
            <div>
              <p className="font-medium text-white">{car.model}</p>
              <p className="text-xs text-gray-400 capitalize">{car.type} Car</p>
            </div>
          </div>
          <Link href={`/car-detail/${car.id}`}>
            <Button variant="ghost" className="text-purple-primary text-sm font-medium p-0 h-auto">
              View Details
            </Button>
          </Link>
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-1">Asking Price</p>
          <p className="text-2xl font-bold text-white">${parseFloat(car.price).toLocaleString()}</p>
        </div>

        {/* Car Image with 360° View */}
        <div className="relative mb-4 group">
          <img 
            src={car.imageUrl} 
            alt={`${car.make} ${car.model}`}
            className="w-full h-40 object-cover rounded-xl"
          />
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Badge variant="secondary" className="bg-white bg-opacity-90 text-black">
              360° View
            </Badge>
          </div>
        </div>

        {/* Primary Features */}
        <div className="flex items-center justify-between text-sm mb-4">
          {primaryFeatures.map((feature, index) => {
            const Icon = getCarIcon(feature);
            return (
              <div key={index} className="flex items-center space-x-1">
                <Icon className={`w-4 h-4 ${getTypeColor(feature)}`} />
                <span className="text-gray-400 text-xs">{feature === "Hybrid Car" || feature === "Electric Car" ? car.type : feature}</span>
              </div>
            );
          })}
        </div>

        {/* Secondary Features */}
        {secondaryFeatures.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            {secondaryFeatures.map((feature, index) => {
              const Icon = getCarIcon(feature);
              return (
                <div key={index} className="flex items-center space-x-1">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-xs">{feature}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Additional Specs */}
        <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center space-x-1">
            <Gauge className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-xs">{car.horsepower} HP</span>
          </div>
          {car.kilowatts && (
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-xs">{car.kilowatts} KW</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-xs">{car.seats} Seat{car.seats > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
