import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useOrders, useConfirmOrder, useUpdateOrder, useDeleteOrder } from "@/api/hooks/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Trash2, Eye } from "lucide-react";

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

/* ---------- page ---------- */
export function OrdersPage() {
  const { data: orders = [], isLoading } = useOrders();
  const confirmOrder = useConfirmOrder();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] =
    useState<"all" | "pending" | "confirmed" | "cancelled">("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o: any) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const onConfirm = async (id: number) => {
    try {
      await confirmOrder.mutateAsync({ id });
      toast({ title: "Order confirmed" });
    } catch (e: any) {
      toast({ title: "Failed to confirm", description: e?.message, variant: "destructive" });
    }
  };

  const onCancel = async (id: number) => {
    const ok = window.confirm("Cancel this order?");
    if (!ok) return;
    try {
      await updateOrder.mutateAsync({ id, status: "cancelled" } as any);
      toast({ title: "Order cancelled" });
    } catch (e: any) {
      toast({ title: "Failed to cancel", description: e?.message, variant: "destructive" });
    }
  };

  const onDelete = async (id: number) => {
    const ok = window.confirm("Delete this order permanently?");
    if (!ok) return;
    try {
      await deleteOrder.mutateAsync({ id });
      toast({ title: "Order deleted" });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6">
      {/* header / filter */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Orders</h1>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">#</th>
                    <th className="text-left py-2 px-2">Customer</th>
                    <th className="text-left py-2 px-2">Email / Phone</th>
                    <th className="text-left py-2 px-2">Items</th>
                    <th className="text-left py-2 px-2">Total</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Created</th>
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

                    return (
                      <tr key={o.id} className="border-b hover:bg-muted/30 align-middle">
                        <td className="py-2 px-2 font-medium">#{o.id}</td>
                        <td className="py-2 px-2">{name}</td>
                        <td className="py-2 px-2">
                          <div>{email}</div>
                          {phone ? <div className="text-xs text-muted-foreground">{phone}</div> : null}
                        </td>
                        <td className="py-2 px-2">
                          {first?.image ? (
                            <div className="flex items-center gap-2">
                              <img
                                src={first.image}
                                alt={first.name || "Item"}
                                className="h-10 w-10 rounded object-cover"
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
                        <td className="py-2 px-2">{fmtINR(total)}</td>
                        <td className="py-2 px-2">
                          <StatusPill status={o.status} />
                        </td>
                        <td className="py-2 px-2">{new Date(o.created_at).toLocaleString()}</td>
                        <td className="py-2 px-2 text-right whitespace-nowrap">
                          <Button asChild size="sm" variant="outline" className="mr-2" title="View">
                            <Link to={`/admin/orders/${o.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          {o.status === "pending" && (
                            <Button size="sm" className="mr-2" onClick={() => onConfirm(o.id)} title="Confirm">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                          )}
                          {o.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="mr-2"
                              onClick={() => onCancel(o.id)}
                              title="Cancel"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => onDelete(o.id)} title="Delete">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
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
