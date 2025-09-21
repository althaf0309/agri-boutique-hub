import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Image,
  Grid3X3,
  Percent,
  Star,
  MessageSquare,
  ShoppingCart,
  Mail,
  FileText,
  Briefcase,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Categories", url: "/admin/categories", icon: FolderTree },
  { title: "Promo Banners", url: "/admin/promo-banners", icon: Image },
  { title: "Product Grids", url: "/admin/product-grids", icon: Grid3X3 },
  { title: "Special Offers", url: "/admin/special-offers", icon: Percent },
  { title: "Collections", url: "/admin/collections", icon: Star },
  { title: "Reviews", url: "/admin/reviews", icon: MessageSquare },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Contact", url: "/admin/contact", icon: Mail },
  { title: "Blog", url: "/admin/blog", icon: FileText },
  { title: "Jobs", url: "/admin/jobs", icon: Briefcase },
  { title: "Job Applications", url: "/admin/job-applications", icon: Users },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();
  const { open, setOpen, openMobile, setOpenMobile, isMobile, state } = useSidebar();

  const isActive = (url: string) => {
    if (url === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(url);
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setOpen(!open);
    }
  };

  const isCollapsed = state === "collapsed";
  const isExpanded = state === "expanded";

  const showLabels = !isCollapsed || isMobile;

  return (
    <Sidebar 
      side="left"
      variant="sidebar"
      collapsible="icon"
      className="border-r border-border/40 shadow-sm transition-all duration-300"
    >
      <SidebarContent className="bg-gradient-to-b from-background via-background/95 to-background/90 backdrop-blur-sm">
        {/* Header with Logo and Toggle */}
        <div className="flex h-16 items-center border-b border-border/30 px-4 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary-glow to-secondary text-primary-foreground shadow-lg shadow-primary/20 flex-shrink-0">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            {showLabels && (
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="text-base font-bold text-foreground truncate tracking-tight">Admin Panel</span>
                <span className="text-sm text-muted-foreground/80 truncate font-medium">E-Commerce Dashboard</span>
              </div>
            )}
          </div>
          
          {/* Toggle Button - Only show on desktop */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-9 w-9 flex-shrink-0 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto py-4 px-2">
          <SidebarGroup>
            {showLabels && (
              <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                Navigation
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.map((item) => {
                  const itemIsActive = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={itemIsActive}>
                        <NavLink 
                          to={item.url} 
                          end={item.url === "/admin"}
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 font-medium ${
                            itemIsActive 
                              ? "bg-gradient-to-r from-primary via-primary-glow to-secondary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" 
                              : "hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 text-foreground/80 hover:text-foreground hover:scale-[1.01] hover:shadow-md"
                          }`}
                          title={!showLabels ? item.title : undefined}
                        >
                          <item.icon className={`flex-shrink-0 transition-all ${itemIsActive ? 'h-5 w-5' : 'h-4 w-4'}`} />
                          {showLabels && (
                            <span className="truncate text-sm font-semibold tracking-tight">{item.title}</span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Footer */}
        {showLabels && (
          <div className="border-t border-border/30 p-4 bg-gradient-to-r from-muted/20 to-muted/10">
            <div className="flex items-center gap-3 text-sm text-muted-foreground/80">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-secondary/20 border border-border/30">
                <Settings className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">Admin v1.0.0</span>
                <span className="text-xs">Management System</span>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Footer */}
        {!showLabels && !isMobile && (
          <div className="border-t border-border/30 p-3 flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-secondary/20 border border-border/30">
              <Settings className="h-4 w-4 text-accent-foreground" />
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}