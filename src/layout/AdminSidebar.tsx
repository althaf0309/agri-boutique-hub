import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const getNavClass = (url: string) => {
    const isActive = location.pathname === url || 
      (url !== "/admin" && location.pathname.startsWith(url));
    
    return isActive 
      ? "bg-primary text-primary-foreground" 
      : "hover:bg-muted/50";
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"}>
      <SidebarContent className="border-r bg-white">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <h2 className="text-lg font-semibold">Admin Panel</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClass(item.url)}
                      end={item.url === "/admin"}
                    >
                      <item.icon className={`h-4 w-4 ${collapsed ? "mr-0" : "mr-2"}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}