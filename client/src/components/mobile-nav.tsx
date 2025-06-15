import { Menu, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MobileNav() {
  return (
    <header className="flex items-center justify-between p-4 bg-dark-card lg:hidden">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className="text-gray-400">
          <Menu className="w-5 h-5" />
        </Button>
        <div>
          <p className="text-sm text-gray-400">Admin</p>
          <p className="font-medium text-white">Dianne Russell</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className="text-gray-400">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-400">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
