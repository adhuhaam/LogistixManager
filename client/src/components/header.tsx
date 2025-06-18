import { useState } from "react";
import { Bell, Search, Settings, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user, logout, isSuperAdmin } = useAuth();

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

  return (
    <header className="bg-dark-card border-b border-gray-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search here..."
              className="pl-10 w-80 bg-dark-elevated border-gray-700 text-white"
            />
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-gray-400">
            <Bell className="w-5 h-5" />
          </Button>
          
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 p-2 hover:bg-dark-elevated">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user ? getRoleLabel(user.role) : 'Loading...'}</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user ? getRoleColor(user.role) : 'bg-gray-500'}`}>
                  <span className="text-sm font-medium text-white">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-dark-card border-gray-700" align="end">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
                <p className="text-xs text-purple-primary mt-1">{user ? getRoleLabel(user.role) : ''}</p>
              </div>
              <DropdownMenuSeparator className="bg-gray-700" />
              {isSuperAdmin && (
                <DropdownMenuItem asChild className="text-gray-300 focus:bg-dark-elevated focus:text-white">
                  <Link href="/settings" className="flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem 
                onClick={logout}
                className="text-red-400 focus:bg-red-500/20 focus:text-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}