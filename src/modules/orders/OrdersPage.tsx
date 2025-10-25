import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useOrders, useConfirmOrder, useUpdateOrder, useDeleteOrder } from "@/api/hooks/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import {
  CheckCircle2, XCircle, Trash2, Eye, Truck,
  PackageOpen, PackageSearch, CheckCheck
} from "lucide-react";

/* ---------- small helpers ---------- */
function fmtINR(v: any) {
  const n = Number(v ?? 0);
  return `₹${n.toFixed(2)}`;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    cancelled: "bg-rose-100 text-rose-800 border-rose-200",
  };
  const cls = map[status] || "bg-secondary text-secondary-foreground";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}

function ShipPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    placed: "bg-slate-100 text-slate-800 border-slate-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
  const s = (status || "placed").toLowerCase();
  const cls = map[s] ?? map.placed;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {s}
    </span>
  );
}

/* ---------- page ---------- */
export function OrdersPage() {
  const { user } = useAuth();
  const isAdmin = !!user?.is_superuser;

  // 👇 superadmin sees ALL orders; others see their own (hook handles fallback)
  const { data: orders = [], isLoading } = useOrders({ showAll: isAdmin });

  const confirmOrder = useConfirmOrder();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] =
    useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [shipFilter, setShipFilter] =
    useState<"all" | "placed" | "pending" | "processing" | "delivered">("all");

  const filtered = useMemo(() => {
    let arr = orders;
    if (statusFilter !== "all") {
      arr = arr.filter((o: any) => String(o.status || "pending").toLowerCase() === statusFilter);
    }
    if (shipFilter !== "all") {
      arr = arr.filter((o: any) => String(o.shipment_status || "placed").toLowerCase() === shipFilter);
    }
    return arr;
  }, [orders, statusFilter, shipFilter]);

  const onConfirm = async (id: number) => {
    try {
      await confirmOrder.mutateAsync({ id });
      toast({ title: "Order confirmed" });
    } catch (e: any) {
      toast({ title: "Failed to confirm", description: e?.message, variant: "destructive" });
    }
  };

  const onCancel = async (id: number) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await updateOrder.mutateAsync({ id, status: "cancelled" } as any);
      toast({ title: "Order cancelled" });
    } catch (e: any) {
      toast({ title: "Failed to cancel", description: e?.message, variant: "destructive" });
    }
  };

  const onDelete = async (id: number) => {
    if (!window.confirm("Delete this order permanently?")) return;
    try {
      await deleteOrder.mutateAsync({ id });
      toast({ title: "Order deleted" });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message, variant: "destructive" });
    }
  };

  const setShipment = async (id: number, shipment_status: "placed" | "pending" | "processing" | "delivered") => {
    try {
      await updateOrder.mutateAsync({ id, shipment_status } as any);
      toast({ title: `Shipment: ${shipment_status}` });
    } catch (e: any) {
      toast({ title: "Failed to update shipment", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-4 sm:p-6 mx-auto w-full">
      {/* header / filters */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg sm:text-xl font-semibold">Orders{isAdmin ? " (All)" : ""}</h1>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-40 sm:w-44">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All (Order)</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={shipFilter} onValueChange={(v: any) => setShipFilter(v)}>
            <SelectTrigger className="w-44 sm:w-48">
              <SelectValue placeholder="Filter shipment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All (Shipment)</SelectItem>
              <SelectItem value="placed">Placed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">No orders.</div>
          ) : (
            <div className="overflow-x-hidden">
              <table className="w-full table-auto text-xs sm:text-sm">
                <thead>
                  <tr className="border-b align-top">
                    <th className="text-left py-2 px-2">#</th>
                    <th className="text-left py-2 px-2">Customer</th>
                    <th className="text-left py-2 px-2">Email / Phone</th>
                    <th className="text-left py-2 px-2">Items</th>
                    <th className="text-left py-2 px-2">Total</th>
                    <th className="text-left py-2 px-2">Order</th>
                    <th className="text-left py-2 px-2">Shipment</th>
                    <th className="text-right py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o: any) => {
                    const cd = o.checkout_details || {};
                    const name = cd.full_name || "—";
                    const email = cd.email || "—";
                    const phone = cd.phone || "";

                    const lines = Array.isArray(o.lines) ? o.lines : [];
                    const first = lines[0];
                    const count = lines.length;

                    const total = o.totals?.grand_total ?? 0;
                    const shipStatus: "placed" | "pending" | "processing" | "delivered" =
                      (o.shipment_status || "placed").toLowerCase();

                    return (
                      <tr key={o.id} className="border-b hover:bg-muted/30 align-top">
                        <td className="py-2 px-2 font-medium">#{o.id}</td>

                        <td className="py-2 px-2 break-words">{name}</td>

                        <td className="py-2 px-2 break-all">
                          <div className="leading-5">{email}</div>
                          {phone ? <div className="text-xs text-muted-foreground">{phone}</div> : null}
                        </td>

                        <td className="py-2 px-2">
                          {first?.image ? (
                            <div className="flex items-center gap-2">
                              <img
                                src={first.image}
                                alt={first.name || "Item"}
                                className="h-9 w-9 rounded object-cover flex-shrink-0"
                              />
                              <div className="text-xs text-muted-foreground">
                                {count} item{count === 1 ? "" : "s"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {count ? `${count} item${count === 1 ? "" : "s"}` : "—"}
                            </span>
                          )}
                        </td>

                        <td className="py-2 px-2 break-words">{fmtINR(total)}</td>

                        <td className="py-2 px-2"><StatusPill status={o.status} /></td>

                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <ShipPill status={shipStatus} />
                            <div className="flex items-center gap-1 flex-wrap">
                              <Button
                                size="icon"
                                variant={shipStatus === "placed" ? "default" : "outline"}
                                title="Placed"
                                onClick={() => setShipment(o.id, "placed")}
                                className="h-8 w-8"
                              >
                                <PackageOpen className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant={shipStatus === "pending" ? "default" : "outline"}
                                title="Pending"
                                onClick={() => setShipment(o.id, "pending")}
                                className="h-8 w-8"
                              >
                                <PackageSearch className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant={shipStatus === "processing" ? "default" : "outline"}
                                title="Processing"
                                onClick={() => setShipment(o.id, "processing")}
                                className="h-8 w-8"
                              >
                                <Truck className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant={shipStatus === "delivered" ? "default" : "outline"}
                                title="Delivered"
                                onClick={() => setShipment(o.id, "delivered")}
                                className="h-8 w-8"
                              >
                                <CheckCheck className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-2 text-right">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <Button asChild size="sm" variant="outline" title="View" className="px-2">
                              <Link to={`/admin/orders/${o.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                <span className="hidden md:inline">View</span>
                              </Link>
                            </Button>
                            {String(o.status).toLowerCase() === "pending" && (
                              <Button size="sm" className="px-2" onClick={() => onConfirm(o.id)} title="Confirm">
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                <span className="hidden md:inline">Confirm</span>
                              </Button>
                            )}
                            {String(o.status).toLowerCase() !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="px-2"
                                onClick={() => onCancel(o.id)}
                                title="Cancel"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                <span className="hidden md:inline">Cancel</span>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onDelete(o.id)}
                              title="Delete"
                              className="px-2"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              <span className="hidden md:inline">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default OrdersPage;
