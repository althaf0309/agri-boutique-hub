import { useLocation, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Download, Home } from "lucide-react";

/* --- image helpers (same pattern used elsewhere in your app) --- */
const PLACEHOLDER =
  (import.meta as any)?.env?.VITE_PRODUCT_PLACEHOLDER ||
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='14'>No Image</text></svg>";

const MEDIA_BASE =
  (import.meta as any)?.env?.VITE_MEDIA_URL ||
  (import.meta as any)?.env?.VITE_API_BASE_URL ||
  "";

function normalizeUrl(raw?: string): string {
  if (!raw) return "";
  let u = String(raw).trim();
  const hasProto = /^https?:\/\//i.test(u);
  if (!hasProto && !u.startsWith("/")) u = `/${u}`;
  u = u.replace(/([^:]\/)\/+/g, "$1").replace(/ /g, "%20").replace(/"/g, "%22").replace(/'/g, "%27");
  if (/^https?:\/\//i.test(u)) {
    if (typeof window !== "undefined" && window.location.protocol === "https:" && u.startsWith("http://")) {
      u = "https://" + u.slice("http://".length);
    }
    return u;
  }
  const base = (MEDIA_BASE || "").replace(/\/+$/, "");
  const path = u.replace(/^\/+/, "");
  const full = base ? `${base}/${path}` : `/${path}`;
  if (typeof window !== "undefined" && window.location.protocol === "https:" && full.startsWith("http://")) {
    return "https://" + full.slice("http://".length);
  }
  return full;
}

type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  weight?: string | null;
  image?: string | null; // ✅ allow image per line item
};

export default function OrderSuccess() {
  const { state } = useLocation() as {
    state?: {
      customer: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        email: string;
        phone: string;
        paymentStatus?: "paid" | "cod" | "received";
      };
      items: Array<OrderItem>;
      totals: { subtotal: number; shipping: number; tax: number; total: number };
      gateway?: { provider: string; orderId?: string; paymentId?: string };
    };
  };
  const navigate = useNavigate();

  if (!state) {
    // fallback if user landed directly
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>No order data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">Looks like this page was opened directly.</p>
              <Button asChild>
                <Link to="/">Go home</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const { customer, items, totals, gateway } = state;

  const openPrintInvoice = () => {
    // Prepare rows with normalized images
    const rowsHtml = items
      .map((i) => {
        const img = normalizeUrl(i.image || "") || PLACEHOLDER;
        const amount = (i.price * i.quantity).toFixed(2);
        const unit = i.price.toFixed(2);
        const name = `${i.name}${i.weight ? ` (${i.weight})` : ""}`;
        return `<tr>
          <td style="width:56px;padding:6px 8px">
            <img src="${img}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #eee" />
          </td>
          <td>${name}</td>
          <td class="right">${i.quantity}</td>
          <td class="right">₹${unit}</td>
          <td class="right">₹${amount}</td>
        </tr>`;
      })
      .join("");

    const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif;padding:24px}
    h1{margin:0 0 16px}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th,td{border:1px solid #ddd;padding:8px;font-size:14px;vertical-align:middle}
    th{background:#f7f7f7;text-align:left}
    .totals{margin-top:16px;float:right;width:360px}
    .totals td{border:none;padding:6px 8px}
    .right{text-align:right}
    .muted{color:#666}
    .no-border{border:none !important}
  </style>
</head>
<body>
  <h1>Invoice</h1>
  <div class="muted">Payment: ${(gateway?.provider || "-").toUpperCase()} ${gateway?.paymentId ? `• ${gateway.paymentId}` : ""}</div>
  <div class="muted">Order ID: ${gateway?.orderId || "-"}</div>
  <div style="margin-top:12px">
    <div><strong>${customer.firstName} ${customer.lastName}</strong></div>
    <div>${customer.address}, ${customer.city}, ${customer.state} ${customer.zipCode}</div>
    <div>${customer.email} • ${customer.phone}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:56px">Img</th>
        <th style="width:48%">Item</th>
        <th class="right">Qty</th>
        <th class="right">Price</th>
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <table class="totals">
    <tbody>
      <tr><td>Subtotal</td><td class="right">₹${totals.subtotal.toFixed(2)}</td></tr>
      <tr><td>Shipping</td><td class="right">₹${totals.shipping.toFixed(2)}</td></tr>
      <tr><td>Tax</td><td class="right">₹${totals.tax.toFixed(2)}</td></tr>
      <tr><td><strong>Total</strong></td><td class="right"><strong>₹${totals.total.toFixed(2)}</strong></td></tr>
    </tbody>
  </table>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const downloadInvoiceJSON = () => {
    const blob = new Blob([JSON.stringify({ customer, items, totals, gateway }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${gateway?.orderId || Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <CardTitle>
              Thank you! Your order is {customer.paymentStatus === "paid" ? "confirmed" : "received"}.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Payment: <strong>{(gateway?.provider || "").toUpperCase() || "—"}</strong>
              {gateway?.paymentId ? ` • ${gateway.paymentId}` : ""}
              {gateway?.orderId ? ` • Order: ${gateway.orderId}` : ""}
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Delivery To</h3>
                <div className="text-sm">
                  <div>
                    {customer.firstName} {customer.lastName}
                  </div>
                  <div>{customer.address}</div>
                  <div>
                    {customer.city}, {customer.state} {customer.zipCode}
                  </div>
                  <div>
                    {customer.email} • {customer.phone}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{totals.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items table with images */}
            <div>
              <h3 className="font-semibold mb-2">Items</h3>
              <div className="overflow-x-auto rounded border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 w-[56px]">Img</th>
                      <th className="text-left p-2">Item</th>
                      <th className="text-right p-2">Qty</th>
                      <th className="text-right p-2">Price</th>
                      <th className="text-right p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i, idx) => {
                      const img = normalizeUrl(i.image || "") || PLACEHOLDER;
                      const amount = i.price * i.quantity;
                      return (
                        <tr key={idx} className="border-t">
                          <td className="p-2">
                            <img
                              src={img}
                              alt=""
                              className="w-12 h-12 object-cover rounded border"
                              loading="lazy"
                            />
                          </td>
                          <td className="p-2">
                            <div className="font-medium truncate">{i.name}</div>
                            {i.weight && <div className="text-xs text-muted-foreground">{i.weight}</div>}
                          </td>
                          <td className="p-2 text-right">{i.quantity}</td>
                          <td className="p-2 text-right">₹{i.price.toFixed(2)}</td>
                          <td className="p-2 text-right">₹{amount.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={openPrintInvoice} className="flex items-center gap-2">
                <Download className="w-4 h-4" /> Print / Save PDF
              </Button>
              <Button variant="outline" onClick={downloadInvoiceJSON}>
                Download JSON
              </Button>
              <Button variant="secondary" onClick={() => navigate("/")} className="flex items-center gap-2">
                <Home className="w-4 h-4" /> Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
