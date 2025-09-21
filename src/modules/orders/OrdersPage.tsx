import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useOrders, useConfirmOrder, useUpdateOrder, useDeleteOrder } from "@/api/hooks/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Trash2, Eye } from "lucide-react";

export function OrdersPage() {
  const { data: orders = [], isLoading } = useOrders();
  const confirmOrder = useConfirmOrder();
  const updateOrder  = useUpdateOrder();
  const deleteOrder  = useDeleteOrder();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<"all"|"pending"|"confirmed"|"cancelled">("all");

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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Orders</h1>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-40">
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
                    <th className="text-left py-2 px-2">User</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Currency</th>
                    <th className="text-left py-2 px-2">Created</th>
                    <th className="text-right py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o: any) => (
                    <tr key={o.id} className="border-b hover:bg-muted/30">
                      <td className="py-2 px-2">#{o.id}</td>
                      <td className="py-2 px-2">{o.user_email || (o.user?.email ?? "—")}</td>
                      <td className="py-2 px-2">{o.status}</td>
                      <td className="py-2 px-2">{o.currency || "INR"}</td>
                      <td className="py-2 px-2">{new Date(o.created_at).toLocaleString()}</td>
                      <td className="py-2 px-2 text-right">
                        <Button asChild size="sm" variant="outline" className="mr-2">
                          <Link to={`/admin/orders/${o.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        {o.status === "pending" && (
                          <Button size="sm" className="mr-2" onClick={() => onConfirm(o.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                        )}
                        {o.status !== "cancelled" && (
                          <Button size="sm" variant="secondary" className="mr-2" onClick={() => onCancel(o.id)}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => onDelete(o.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
