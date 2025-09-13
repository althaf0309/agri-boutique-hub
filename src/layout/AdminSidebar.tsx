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
  const { open } = useSidebar();

  const getNavClass = ({ isActive }: { isActive: boolean }) => {
    return isActive 
      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";
  };

  const isActive = (url: string) => {
    if (url === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar 
      collapsible="icon"
      className="border-r bg-white"
    >
      <SidebarContent>
        {/* Header with trigger */}
        <div className="flex h-16 items-center border-b px-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">Admin Panel</span>
              <span className="text-xs text-muted-foreground truncate">E-Commerce</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto py-4">
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
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
                          className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}