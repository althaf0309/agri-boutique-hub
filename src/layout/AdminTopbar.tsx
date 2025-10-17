// src/layout/AdminTopbar.tsx
import { Search, User, Bell, Settings, LogOut, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

export function AdminTopbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userEmail = user?.email;

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials = userEmail?.trim()?.[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 bg-white border-b px-3 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <SidebarTrigger className="h-8 w-8" />
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
            Prakrithi Jaiva Kalavara Admin
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input type="search" placeholder="Search..." className="pl-9 w-48 lg:w-64 bg-gray-50 border-gray-200" />
          </div>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="font-medium hidden sm:inline">{userEmail || "User"}</span>
                <ChevronDown className="h-4 w-4 hidden sm:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
