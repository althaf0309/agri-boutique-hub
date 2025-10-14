import { useParams, Link, useNavigate } from "react-router-dom";
import { useOrder, useConfirmOrder, useUpdateOrder, useDeleteOrder } from "@/api/hooks/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trash2,
  Printer,
  Download,
  BadgeCheck,
  AlertCircle,
  CreditCard,
  Truck,
  Wallet,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    cancelled: "bg-rose-100 text-rose-800 border-rose-200",
  };
  const cls = map[status] || "bg-secondary text-secondary-foreground";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status === "confirmed" && <BadgeCheck className="h-3.5 w-3.5" />}
      {status === "pending" && <AlertCircle className="h-3.5 w-3.5" />}
      {status === "cancelled" && <XCircle className="h-3.5 w-3.5" />}
      {status}
    </span>
  );
}

export function OrderDetailPage() {
  const { id } = useParams();
  const orderId = Number(id);
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(orderId);
  const confirmOrder = useConfirmOrder();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const { toast } = useToast();

  if (isLoading || !order) {
    return <div className="p-6 text-muted-foreground">Loading…</div>;
  }

  const currency = order.currency || "INR";

  const lines =
    (order.lines || []) as Array<{
      product_id: number;
      variant_id: number | null;
      name: string;
      qty: number;
      price: string | number;
      image?: string;
      weight?: string;
    }>;

  const totals = order.totals || {
    subtotal: "0.00",
    shipping: "0.00",
    tax: "0.00",
    grand_total: "0.00",
  };

  const cd = order.checkout_details || ({} as any);
  const customerName = cd.full_name || "—";
  const customerEmail = cd.email || "—";
  const customerPhone = cd.phone || "";
  const customerAddress = [
    cd.address1,
    cd.address2,
    [cd.city, cd.state, cd.postcode].filter(Boolean).join(", "),
    cd.country,
  ]
    .filter(Boolean)
    .join("\n");

  const paymentProvider =
    (order.payment?.provider || order.payment_method || "-").toString().toUpperCase();
  const paymentStatus = order.payment?.status || (order.status === "confirmed" ? "paid" : "unpaid");
  const transactionId = order.payment?.transaction_id || "";

  const itemCount = lines.reduce((n, l) => n + (Number(l.qty) || 0), 0);

  const fmt = (v: string | number) => `${currency === "INR" ? "₹" : ""}${Number(v ?? 0).toFixed(2)}`;

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
      navigate("/admin/orders");
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message, variant: "destructive" });
    }
  };

  const handlePrintInvoice = () => {
    const rowsHtml = (order.lines ?? [])
      .map((i: any) => {
        const unit = Number(i.price ?? 0);
        const amt = unit * Number(i.qty ?? 0);
        const name = String(i.name || "") + (i.weight ? " (" + String(i.weight) + ")" : "");
        const img = i.image ? '<img src="' + String(i.image) + '" alt="item" />' : "";
        return (
          "<tr>" +
          "<td>" +
          img +
          name +
          "</td>" +
          '<td class="right">' +
          String(i.qty ?? 0) +
          "</td>" +
          '<td class="right">' +
          fmt(unit) +
          "</td>" +
          '<td class="right">' +
          fmt(amt) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    const html =
      "<!doctype html>" +
      "<html><head>" +
      '<meta charset="utf-8" />' +
      "<title>Invoice #" +
      order.id +
      "</title>" +
      "<style>" +
      "body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif;padding:24px}" +
      "h1{margin:0 0 16px}" +
      "table{width:100%;border-collapse:collapse;margin-top:16px}" +
      "th,td{border:1px solid #ddd;padding:8px;font-size:14px}" +
      "th{background:#f7f7f7;text-align:left}" +
      ".totals{margin-top:16px;float:right;width:320px}" +
      ".totals td{border:none}" +
      ".right{text-align:right}" +
      ".muted{color:#666}" +
      ".row{display:flex;gap:32px}" +
      ".col{flex:1}" +
      "img{height:28px;width:28px;object-fit:cover;border-radius:4px;margin-right:6px;vertical-align:middle}" +
      "</style></head><body>" +
      "<h1>Invoice #" +
      order.id +
      "</h1>" +
      '<div class="muted">Status: ' +
      order.status +
      "</div>" +
      '<div class="muted">Created: ' +
      new Date(order.created_at).toLocaleString() +
      "</div>" +
      '<div class="muted">Payment: ' +
      paymentProvider +
      (paymentStatus ? " • " + paymentStatus : "") +
      (transactionId ? " • " + transactionId : "") +
      "</div>" +
      '<div class="row" style="margin-top:12px">' +
      '<div class="col">' +
      "<h3>Customer</h3>" +
      "<div>" +
      customerName +
      "</div>" +
      "<div>" +
      customerEmail +
      (customerPhone ? " • " + customerPhone : "") +
      "</div>" +
      "</div>" +
      '<div class="col">' +
      "<h3>Ship To</h3>" +
      "<pre style='margin:0;white-space:pre-wrap'>" +
      customerAddress +
      "</pre>" +
      "</div>" +
      "</div>" +
      "<table><thead>" +
      '<tr><th style="width:48%">Item</th><th class="right">Qty</th><th class="right">Unit</th><th class="right">Amount</th></tr>' +
      "</thead><tbody>" +
      rowsHtml +
      "</tbody></table>" +
      '<table class="totals"><tbody>' +
      '<tr><td>Subtotal</td><td class="right">' +
      fmt(order.totals?.subtotal ?? 0) +
      "</td></tr>" +
      '<tr><td>Shipping</td><td class="right">' +
      fmt(order.totals?.shipping ?? 0) +
      "</td></tr>" +
      '<tr><td>Tax</td><td class="right">' +
      fmt(order.totals?.tax ?? 0) +
      "</td></tr>" +
      '<tr><td><strong>Total</strong></td><td class="right"><strong>' +
      fmt(order.totals?.grand_total ?? 0) +
      "</strong></td></tr>" +
      "</tbody></table>" +
      "<script>window.onload = () => window.print();</script>" +
      "</body></html>";

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(order, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "order_" + order.id + ".json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-4">
      {/* header / actions */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" title="Back">
          <Link to="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handlePrintInvoice} title="Print / Save PDF">
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
          <Button size="sm" variant="secondary" onClick={downloadJSON} title="Download JSON">
            <Download className="h-4 w-4 mr-1" /> JSON
          </Button>
          {order.status === "pending" && (
            <Button size="sm" onClick={onConfirm} title="Confirm order">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Confirm
            </Button>
          )}
          {order.status !== "cancelled" && (
            <Button size="sm" variant="secondary" onClick={onCancel} title="Cancel order">
              <XCircle className="h-4 w-4 mr-1" /> Cancel
            </Button>
          )}
          <Button size="sm" variant="destructive" onClick={onDelete} title="Delete order">
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      {/* top summary row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              Order #{order.id}
              <StatusBadge status={order.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">Created</div>
              <div className="font-medium">{new Date(order.created_at).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Items</div>
              <div className="font-medium">{itemCount}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Currency</div>
              <div className="font-medium">{currency}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="font-semibold">{fmt(totals.grand_total)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Method</span>
              <span className="font-medium">
                {paymentProvider === "CASH-ON-DELIVERY" ? (
                  <span className="inline-flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5" /> COD
                  </span>
                ) : (
                  paymentProvider
                )}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Status</span>
              <span className="font-medium capitalize">{paymentStatus}</span>
            </div>
            {transactionId ? (
              <div className="flex items-center justify-between text-sm">
                <span>Txn ID</span>
                <span className="font-mono text-xs">{transactionId}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* customer + shipping */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-4 w-4" /> Customer & Shipping
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Customer</div>
              <div className="font-medium">{customerName}</div>
              <div className="text-sm">{customerEmail}</div>
              {customerPhone ? <div className="text-sm">{customerPhone}</div> : null}
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Ship To</div>
              <pre className="whitespace-pre-wrap text-sm font-sans leading-5">{customerAddress || "—"}</pre>
            </div>
            {cd?.notes ? (
              <div className="sm:col-span-2 space-y-1">
                <div className="text-sm text-muted-foreground">Notes</div>
                <div className="text-sm">{cd.notes}</div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-medium">{fmt(totals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span className="font-medium">{fmt(totals.shipping)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax</span>
              <span className="font-medium">{fmt(totals.tax)}</span>
            </div>
            <div className="mt-2 border-t pt-2 flex items-center justify-between">
              <span className="font-semibold">Grand Total</span>
              <span className="font-semibold">{fmt(totals.grand_total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          {lines.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Item</th>
                    <th className="text-left py-2 px-2">Image</th>
                    <th className="text-right py-2 px-2">Qty</th>
                    <th className="text-right py-2 px-2">Unit</th>
                    <th className="text-right py-2 px-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((it, idx) => {
                    const unit = Number(it.price || 0);
                    const lineTotal = unit * Number(it.qty || 0);
                    return (
                      <tr key={`${it.product_id}-${it.variant_id}-${idx}`} className="border-b">
                        <td className="py-2 px-2">
                          <div className="font-medium">{it.name}</div>
                          {it.weight ? (
                            <div className="text-xs text-muted-foreground">Weight: {it.weight}</div>
                          ) : null}
                        </td>
                        <td className="py-2 px-2">
                          {it.image ? (
                            <img
                              src={it.image}
                              alt={it.name || "Item"}
                              className="h-14 w-14 object-cover rounded"
                            />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-right">{it.qty}</td>
                        <td className="py-2 px-2 text-right">{fmt(unit)}</td>
                        <td className="py-2 px-2 text-right">{fmt(lineTotal)}</td>
                      </tr>
                    );
                  })}
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
