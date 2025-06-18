import { useLocation, Link } from "wouter";
import { Car, BarChart3, Users, CreditCard, MessageCircle, HelpCircle, Settings, UserCheck, Truck, Sun, Moon, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, isSuperAdmin, canManageVehicles, canManageDrivers, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location, isMobile]);

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
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-card border border-border shadow-lg"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-64 bg-card border-r border-border flex flex-col h-screen transition-transform duration-300 z-50",
        isMobile ? "fixed inset-y-0 left-0" : "relative",
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <img src="/attached_assets/ssss_1750216549833.png" alt="Logistics" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-xl font-bold text-foreground">Logistic Manager</span>
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
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}>
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 pt-8 border-t border-border">
            <ul className="space-y-2">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", getRoleColor(user.role))}>
              <span className="text-sm font-medium text-primary-foreground">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-foreground">{user.name}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Theme Toggle and Logout */}
          <div className="mt-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}