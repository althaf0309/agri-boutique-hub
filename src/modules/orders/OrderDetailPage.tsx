import { useParams, Link } from "react-router-dom";
import { useOrder, useConfirmOrder, useUpdateOrder, useDeleteOrder } from "@/api/hooks/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, XCircle, Trash2 } from "lucide-react";

export function OrderDetailPage() {
  const { id } = useParams();
  const orderId = Number(id);
  const { data: order, isLoading } = useOrder(orderId);
  const confirmOrder = useConfirmOrder();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const { toast } = useToast();

  if (isLoading || !order) {
    return <div className="p-6 text-muted-foreground">Loading…</div>;
  }

  const onConfirm = async () => {
    try {
      await confirmOrder.mutateAsync({ id: orderId });
      toast({ title: "Order confirmed" });
    } catch (e: any) {
      toast({ title: "Failed to confirm", description: e?.message, variant: "destructive" });
    }
  };

  const onCancel = async () => {
    const ok = window.confirm("Cancel this order?");
    if (!ok) return;
    try {
      await updateOrder.mutateAsync({ id: orderId, status: "cancelled" } as any);
      toast({ title: "Order cancelled" });
    } catch (e: any) {
      toast({ title: "Failed to cancel", description: e?.message, variant: "destructive" });
    }
  };

  const onDelete = async () => {
    const ok = window.confirm("Delete this order permanently?");
    if (!ok) return;
    try {
      await deleteOrder.mutateAsync({ id: orderId });
      toast({ title: "Order deleted" });
      history.back();
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {order.status === "pending" && (
            <Button size="sm" onClick={onConfirm}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Confirm
            </Button>
          )}
          {order.status !== "cancelled" && (
            <Button size="sm" variant="secondary" onClick={onCancel}>
              <XCircle className="h-4 w-4 mr-1" /> Cancel
            </Button>
          )}
          <Button size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order #{order.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><b>Status:</b> {order.status}</div>
          <div><b>User:</b> {order.user_email || (order as any).user?.email || "—"}</div>
          <div><b>Currency:</b> {order.currency}</div>
          <div><b>Created:</b> {new Date(order.created_at).toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent>
          {order.items?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Product</th>
                    <th className="text-left py-2 px-2">Variant</th>
                    <th className="text-right py-2 px-2">Qty</th>
                    <th className="text-right py-2 px-2">Unit</th>
                    <th className="text-right py-2 px-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it: any) => (
                    <tr key={it.id} className="border-b">
                      <td className="py-2 px-2">{it.product?.name ?? "—"}</td>
                      <td className="py-2 px-2">
                        {it.variant ? JSON.stringify(it.variant.attributes) : "—"}
                      </td>
                      <td className="py-2 px-2 text-right">{it.quantity}</td>
                      <td className="py-2 px-2 text-right">{it.unit_price}</td>
                      <td className="py-2 px-2 text-right">{it.line_total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted-foreground">No items.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
