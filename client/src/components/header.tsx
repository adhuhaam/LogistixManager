import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-dark-card p-6 border-b border-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-gray-400">{subtitle}</p>}
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search here..."
              className="bg-dark-elevated border-0 px-4 py-2 rounded-xl pl-10 text-sm w-64 focus:ring-2 focus:ring-purple-primary text-white placeholder:text-gray-400"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Bell className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 bg-purple-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">DR</span>
          </div>
        </div>
      </div>
    </header>
  );
}
