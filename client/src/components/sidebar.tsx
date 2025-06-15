import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BarChart3, 
  Car, 
  Users, 
  CreditCard, 
  Mail, 
  HelpCircle, 
  Settings 
} from "lucide-react";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/car-listings", label: "Car Listing", icon: Car },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/transactions", label: "Transactions", icon: CreditCard },
  { href: "/messages", label: "Messages", icon: Mail, hasNotification: true },
];

const secondaryItems = [
  { href: "/help", label: "Help Request", icon: HelpCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-dark-card flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-primary to-blue-500 rounded-lg flex items-center justify-center">
            <Car className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FoCar</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
            
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl transition-colors",
                    isActive
                      ? "bg-purple-primary text-white"
                      : "text-gray-400 hover:text-white hover:bg-dark-elevated"
                  )}>
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.hasNotification && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <ul className="space-y-2">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <a className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                      isActive
                        ? "bg-purple-primary text-white"
                        : "text-gray-400 hover:text-white hover:bg-dark-elevated"
                    )}>
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">DR</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-white">Dianne Russell</p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
