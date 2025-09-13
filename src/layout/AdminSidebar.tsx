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

  return (
    <Sidebar 
      side="left"
      variant="sidebar"
      collapsible="icon"
      className="border-r transition-all duration-300"
    >
      <SidebarContent className="bg-white">
        {/* Header with Logo and Toggle */}
        <div className="flex h-16 items-center border-b px-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="text-sm font-semibold truncate">Admin Panel</span>
                <span className="text-xs text-muted-foreground truncate">E-Commerce</span>
              </div>
            )}
          </div>
          
          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 flex-shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto py-2">
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const itemIsActive = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={itemIsActive}>
                        <NavLink 
                          to={item.url} 
                          end={item.url === "/admin"}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                            itemIsActive 
                              ? "bg-primary text-primary-foreground shadow-sm" 
                              : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                          }`}
                          title={isCollapsed ? item.title : undefined}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {!isCollapsed && (
                            <span className="truncate font-medium">{item.title}</span>
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
        {!isCollapsed && (
          <div className="border-t p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-muted">
                <Settings className="h-3 w-3" />
              </div>
              <span className="truncate">Admin v1.0.0</span>
            </div>
          </div>
        )}

        {/* Collapsed Footer */}
        {isCollapsed && (
          <div className="border-t p-2 flex justify-center">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-muted">
              <Settings className="h-3 w-3" />
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}