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
} from "lucide-react";

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
  const { open, setOpen } = useSidebar();

  const isActive = (url: string) => {
    if (url === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar 
      side="left"
      variant="sidebar"
      collapsible="icon"
      className="border-r"
    >
      <SidebarContent className="bg-white">
        {/* Header with Logo and Toggle */}
        <div className="flex h-16 items-center border-b px-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="text-sm font-semibold truncate">Admin Panel</span>
              <span className="text-xs text-muted-foreground truncate">E-Commerce Dashboard</span>
            </div>
          </div>
          <SidebarTrigger className="-mr-1 h-8 w-8" />
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto py-2">
          <SidebarGroup>
            <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
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
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate font-medium">{item.title}</span>
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
        <div className="border-t p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-muted">
              <Settings className="h-3 w-3" />
            </div>
            <span className="truncate">v1.0.0</span>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}