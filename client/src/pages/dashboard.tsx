import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import MobileNav from "@/components/mobile-nav";
import TrendChart from "@/components/trend-chart";
import { MoreHorizontal, TrendingUp } from "lucide-react";
import type { SalesMetrics, SalesStatistics, Car } from "@shared/schema";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<SalesMetrics>({
    queryKey: ["/api/sales-metrics"],
  });

  const { data: statistics, isLoading: statsLoading } = useQuery<SalesStatistics[]>({
    queryKey: ["/api/sales-statistics"],
  });

  const { data: cars, isLoading: carsLoading } = useQuery<Car[]>({
    queryKey: ["/api/cars"],
  });

  const profitData = [20, 35, 25, 45, 30, 55];
  const salesData = [30, 20, 40, 25, 50, 35];

  const topSellingCars = cars?.filter(car => car.status === "sold").slice(0, 3) || [];

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
            <Header title="Dashboard" subtitle="Welcome back, Dianne!" />
          </div>

          {/* Dashboard Content */}
          <div className="p-4 lg:p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Profit Card */}
              <Card className="bg-dark-card border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Total Profit</span>
                      <Badge className="bg-trend-green text-black text-xs font-medium">
                        {metrics?.profitGrowth || "67"}% <TrendingUp className="w-3 h-3 ml-1" />
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="text-gray-400 h-auto w-auto p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-white">
                      ${metrics ? parseFloat(metrics.totalProfit).toLocaleString() : "93,247.38"}
                    </p>
                    <p className="text-sm text-gray-400">Profit growth from previous month</p>
                  </div>
                  <TrendChart data={profitData} color="#10B981" />
                </CardContent>
              </Card>

              {/* Total Sales Card */}
              <Card className="bg-dark-card border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Total Sales</span>
                      <Badge className="bg-trend-yellow text-black text-xs font-medium">
                        {metrics?.salesGrowth || "8"}% <TrendingUp className="w-3 h-3 ml-1" />
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="text-gray-400 h-auto w-auto p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-white">
                      ${metrics ? parseFloat(metrics.totalSales).toLocaleString() : "8,49,752.01"}
                    </p>
                    <p className="text-sm text-gray-400">Sales growth from previous month</p>
                  </div>
                  <TrendChart data={salesData} color="#F59E0B" />
                </CardContent>
              </Card>

              {/* Sales Statistics Card */}
              <Card className="bg-dark-card border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-white">Sales Statistics</h3>
                    <div className="flex bg-dark-elevated rounded-lg p-1">
                      <Button variant="ghost" size="sm" className="text-sm text-gray-400 h-auto py-1 px-3">
                        Weekly
                      </Button>
                      <Button size="sm" className="text-sm bg-purple-primary text-white h-auto py-1 px-3">
                        Monthly
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {statistics?.map((stat, index) => {
                      const colors = ["bg-red-500", "bg-blue-500", "bg-red-600", "bg-blue-600", "bg-orange-500"];
                      return (
                        <div key={stat.id} className="flex items-center space-x-3">
                          <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-full`}></div>
                          <span className="text-sm text-gray-400 flex-1">
                            {stat.country} {parseFloat(stat.percentage).toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Geographic Visualization and Top Selling Cars */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Geographic Map */}
              <Card className="bg-dark-card border-gray-800">
                <CardContent className="p-6">
                  <div className="h-64 bg-gradient-to-br from-dark-elevated to-dark-bg rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-30">
                      <div className="w-full h-full bg-gray-800 rounded-xl"></div>
                    </div>
                    {/* Geographic data points */}
                    <div className="absolute top-12 left-16 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute top-16 right-24 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-20 left-32 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-16 right-16 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Sales: 36.1%</span>
                    <span className="text-gray-400">India Sports: $12.3M</span>
                  </div>
                </CardContent>
              </Card>

              {/* Top Selling Cars */}
              <Card className="bg-dark-card border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-white">Top Selling Cars</CardTitle>
                    <Button variant="ghost" className="text-purple-primary text-sm p-0 h-auto">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topSellingCars.map((car) => (
                    <div key={car.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">BMW</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-white">{car.model}</p>
                          <p className="text-xs text-gray-400">#{car.bookingNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm text-white">{car.customerName}</p>
                        <p className="text-xs text-gray-400">{car.customerEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm text-white">
                          {car.orderDate ? new Date(car.orderDate).toLocaleDateString() : "26 Jan 2024"}
                        </p>
                        <Badge className="bg-green-900 text-green-300 text-xs">
                          Successful
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {topSellingCars.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No sold cars found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
