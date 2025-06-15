import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import MobileNav from "@/components/mobile-nav";
import CarCard from "@/components/car-card";
import { Filter, Plus, Search } from "lucide-react";
import type { Car } from "@shared/schema";

export default function CarListings() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: cars, isLoading } = useQuery<Car[]>({
    queryKey: ["/api/cars"],
  });

  const filteredCars = cars?.filter(car =>
    car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.type.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
          {/* Desktop Header */}
          <div className="hidden lg:block">
            <Header title="Car Listings" />
          </div>

          {/* Car Listings Content */}
          <div className="p-4 lg:p-6">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <h1 className="text-2xl font-bold text-white lg:hidden">Car Listings</h1>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:flex-initial">
                  <Input
                    type="text"
                    placeholder="Search cars..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-dark-elevated border-0 px-4 py-2 rounded-lg pl-10 text-sm w-full sm:w-64 focus:ring-2 focus:ring-purple-primary text-white placeholder:text-gray-400"
                  />
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="bg-dark-elevated border-gray-700 text-white hover:bg-gray-700">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button className="bg-purple-primary hover:bg-purple-dark text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Car
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-dark-card border border-gray-800 rounded-2xl p-6 animate-pulse">
                    <div className="h-40 bg-gray-700 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Car Grid */}
            {!isLoading && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCars.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>

                {/* No Results */}
                {filteredCars.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-dark-card rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No cars found</h3>
                    <p className="text-gray-400 mb-4">
                      {searchQuery 
                        ? `No cars match your search "${searchQuery}"`
                        : "No cars available at the moment"
                      }
                    </p>
                    {searchQuery && (
                      <Button 
                        variant="outline" 
                        onClick={() => setSearchQuery("")}
                        className="bg-dark-elevated border-gray-700 text-white hover:bg-gray-700"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
