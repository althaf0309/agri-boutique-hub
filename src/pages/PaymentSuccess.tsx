// src/pages/PaymentSuccess.tsx
import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function PaymentSuccess() {
  const q = useQuery();
  const orderId = q.get("order") || "-";
  const paid = q.get("paid") === "1";

  const invoiceHtml = useMemo(() => {
    return `
      <html>
        <head>
          <title>Invoice ${orderId}</title>
          <style>
            body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px;}
            .box{max-width:700px;margin:0 auto;border:1px solid #ddd;border-radius:12px;padding:24px;}
            h1{font-size:20px;margin:0 0 8px;}
            .muted{color:#555}
            table{width:100%;border-collapse:collapse;margin-top:16px;}
            th,td{border-bottom:1px solid #eee;padding:8px;text-align:left;}
            .right{text-align:right}
          </style>
        </head>
        <body>
          <div class="box">
            <h1>Invoice</h1>
            <div class="muted">Order: ${orderId}</div>
            <div class="muted">Status: ${paid ? "Paid" : "Pending (COD)"} </div>

            <table>
              <tr><th>Description</th><th class="right">Amount</th></tr>
              <tr><td>Order total</td><td class="right">Shown on checkout</td></tr>
            </table>
            <p class="muted">Thank you for your purchase!</p>
          </div>
          <script>window.onload = () => window.print()</script>
        </body>
      </html>
    `;
  }, [orderId, paid]);

  const downloadInvoice = () => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(invoiceHtml);
      w.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 text-center space-y-4">
        <h1 className="text-3xl font-bold">{paid ? "Payment Successful 🎉" : "Order Placed (COD) ✅"}</h1>
        <p className="text-muted-foreground">Order ID: {orderId}</p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={downloadInvoice}>Download / Print Invoice</Button>
          <Button variant="outline" asChild>
            <Link to="/">Continue Shopping</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
