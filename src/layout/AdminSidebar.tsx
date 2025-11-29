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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Image as ImageIcon,
  MessageSquare,
  ShoppingCart,
  Mail,
  FileText,
  Star,
  Users,
  BarChart3,
  Settings,
  Store as StoreIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Categories", url: "/admin/categories", icon: FolderTree },

  { title: "Stores", url: "/admin/stores", icon: StoreIcon },
  { title: "Vendors", url: "/admin/vendors", icon: Users },
  { title: "Testimonials", url: "/admin/testimonials", icon: MessageSquare },
  { title: "Video Testimonials", url: "/admin/video-testimonials", icon: MessageSquare },
  { title: "Awards", url: "/admin/awards", icon: Star },
  { title: "Certifications", url: "/admin/certifications", icon: FileText },
  { title: "Gallery", url: "/admin/gallery", icon: ImageIcon },
  { title: "Promo Banners", url: "/admin/promo-banners", icon: ImageIcon },
  { title: "Reviews", url: "/admin/reviews", icon: MessageSquare },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Contact", url: "/admin/contact", icon: Mail },
  { title: "Blog", url: "/admin/blog", icon: FileText },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const location = useLocation();
  const { open, setOpen, openMobile, setOpenMobile, isMobile, state } = useSidebar();

  const isActive = (url: string) => {
    if (url === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(url);
  };

  const toggleSidebar = () => {
    if (isMobile) setOpenMobile(!openMobile);
    else setOpen(!open);
  };

  const isCollapsed = state === "collapsed";
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 via-primary/70 to-secondary/70 text-white shadow-md">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            {showLabels && (
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="text-base font-bold text-foreground truncate tracking-tight">
                  Admin Panel
                </span>
                <span className="text-sm text-muted-foreground/80 truncate font-medium">
                  E-Commerce Dashboard
                </span>
              </div>
            )}
          </div>

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
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-medium
                            ${
                              itemIsActive
                                ? "bg-primary/10 border border-primary/20 text-primary shadow-sm"
                                : "text-foreground/80 hover:text-foreground hover:bg-primary/5"
                            }`}
                          title={!showLabels ? item.title : undefined}
                        >
                          <item.icon
                            className={`flex-shrink-0 h-4 w-4 transition-all ${
                              itemIsActive
                                ? "text-primary"
                                : "text-foreground/70 group-hover:text-foreground"
                            }`}
                          />
                          {showLabels && (
                            <span className="truncate text-sm font-semibold tracking-tight">
                              {item.title}
                            </span>
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
        {showLabels ? (
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
        ) : (
          !isMobile && (
            <div className="border-t border-border/30 p-3 flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-secondary/20 border border-border/30">
                <Settings className="h-4 w-4 text-accent-foreground" />
              </div>
            </div>
          )
        )}
      </SidebarContent>
    </Sidebar>
  );
}
