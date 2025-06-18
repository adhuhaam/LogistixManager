import { useLocation, Link } from "wouter";
import { Car, BarChart3, Users, CreditCard, MessageCircle, HelpCircle, Settings, UserCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, isSuperAdmin, canManageVehicles, canManageDrivers, logout } = useAuth();

  // Build navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { href: "/", label: "Dashboard", icon: BarChart3 },
    ];

    const roleBasedItems = [];

    // All users can see vehicle fleet
    roleBasedItems.push({ href: "/car-listings", label: "Vehicle Fleet", icon: Car });

    // Super Admin and Admin can manage drivers
    if (canManageDrivers()) {
      roleBasedItems.push({ href: "/drivers", label: "Drivers", icon: UserCheck });
    }

    return [...baseItems, ...roleBasedItems];
  };

  const getSecondaryItems = () => {
    const items = [
      { href: "/help", label: "Help Request", icon: HelpCircle },
    ];

    // Super Admin gets access to system settings
    if (isSuperAdmin) {
      items.push({ href: "/settings", label: "Settings", icon: Settings });
    }

    return items;
  };

  const mainItems = getNavigationItems();
  const secondaryItems = getSecondaryItems();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-500';
      case 'admin': return 'bg-purple-primary';
      case 'user': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'user': return 'User';
      default: return 'Unknown';
    }
  };

  if (!user) return null;

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
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <li key={item.href}>
                <Link href={item.href} className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                  isActive
                    ? "bg-purple-primary text-white"
                    : "text-gray-400 hover:text-white hover:bg-dark-elevated"
                )}>
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
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
                  <Link href={item.href} className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                    isActive
                      ? "bg-purple-primary text-white"
                      : "text-gray-400 hover:text-white hover:bg-dark-elevated"
                  )}>
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
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
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", getRoleColor(user.role))}>
            <span className="text-sm font-medium text-white">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-white">{user.name}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {getRoleLabel(user.role)}
              </Badge>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-3 w-full text-xs text-gray-400 hover:text-white transition-colors text-left"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}