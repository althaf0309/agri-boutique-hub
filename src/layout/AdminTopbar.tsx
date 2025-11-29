// src/layout/AdminTopbar.tsx
import {
  Search,
  User,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  ListChecks,
  MessageCircleWarning,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAdminNotifications, useMe } from "@/api/hooks/admin";

export function AdminTopbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userEmail = user?.email;

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials =
    (me?.first_name?.[0] ||
      me?.email?.[0] ||
      userEmail?.trim()?.[0] ||
      "U"
    ).toUpperCase();

  const fullName =
    me ? `${me.first_name || ""} ${me.last_name || ""}`.trim() || me.email : userEmail || "User";

  return (
    <header
      className="
        sticky top-0 z-40
        border-b
        bg-background/80 backdrop-blur
        supports-[backdrop-filter]:bg-background/60
        px-3 sm:px-6 py-2.5
        shadow-sm
      "
      role="banner"
    >
      <div className="flex items-center justify-between min-h-14">
        {/* Left: trigger + brand */}
        <div className="flex items-center gap-2 sm:gap-4">
          <SidebarTrigger className="h-8 w-8" aria-label="Toggle sidebar" />
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-semibold text-foreground truncate leading-tight">
              Prakrithi Jaiva Kalavara Admin
            </h1>
            <span className="text-xs text-muted-foreground leading-none">E-Commerce Dashboard</span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Search (icon on mobile, input optional on md+) */}
          {/* Uncomment to enable full search input on desktops
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 w-56 lg:w-72 bg-muted/30"
            />
          </div>
          */}
          <Button variant="ghost" size="icon" className="md:hidden" title="Search">
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {!!notif?.unseen && notif.unseen > 0 && (
                  <span
                    className="
                      absolute -top-1 -right-1
                      h-5 min-w-5 px-1
                      bg-red-500 text-white text-[10px] font-bold
                      rounded-full flex items-center justify-center
                      ring-2 ring-background
                    "
                    aria-label={`${notif.unseen} unread notifications`}
                  >
                    {notif.unseen > 9 ? "9+" : notif.unseen}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <span className="text-xs text-muted-foreground">
                  {notif?.total ?? 0} total • {notif?.unseen ?? 0} unread
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {(notif?.buckets ?? []).map((b) => (
                <DropdownMenuItem key={b.key} asChild>
                  <Link to={b.href} className="flex items-center justify-between w-full">
                    <span className="inline-flex items-center gap-2">
                      {b.key === "orders" && <ListChecks className="h-4 w-4" />}
                      {b.key === "reviews" && <MessageCircleWarning className="h-4 w-4" />}
                      {b.key === "contacts" && <MessageCircleWarning className="h-4 w-4" />}
                      {b.label}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        b.count ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {b.count}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}

              {(notif?.buckets?.length ?? 0) === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">No notifications</div>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin/notifications" className="w-full text-center">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Account */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 sm:px-3"
                title="Account menu"
                aria-label="Account menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt={fullName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="font-medium hidden sm:inline max-w-[12rem] truncate">{fullName}</span>
                <ChevronDown className="h-4 w-4 hidden sm:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
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
