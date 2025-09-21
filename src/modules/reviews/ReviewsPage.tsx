import { useMemo, useState } from "react";
import { useReviews, useUpdateReview, useDeleteReview } from "@/api/hooks/reviews";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

export function ReviewsPage() {
  const { data: reviews = [], isLoading } = useReviews();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();
  const { toast } = useToast();

  const [onlyPending, setOnlyPending] = useState(false);

  const rows = useMemo(() => {
    return onlyPending ? reviews.filter((r: any) => !r.is_approved) : reviews;
  }, [reviews, onlyPending]);

  const toggleApprove = async (r: any, checked: boolean) => {
    try {
      await updateReview.mutateAsync({ id: r.id, is_approved: checked } as any);
      toast({ title: checked ? "Approved" : "Unapproved" });
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message, variant: "destructive" });
    }
  };

  const onDelete = async (id: number) => {
    const ok = window.confirm("Delete this review?");
    if (!ok) return;
    try {
      await deleteReview.mutateAsync({ id });
      toast({ title: "Review deleted" });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Reviews</h1>
        <div className="flex items-center gap-2 text-sm">
          <span>Only Pending</span>
          <Switch checked={onlyPending} onCheckedChange={setOnlyPending} />
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>All Reviews</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">No reviews.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Product</th>
                    <th className="text-left py-2 px-2">User</th>
                    <th className="text-left py-2 px-2">Rating</th>
                    <th className="text-left py-2 px-2">Title</th>
                    <th className="text-left py-2 px-2">Approved</th>
                    <th className="text-right py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r: any) => (
                    <tr key={r.id} className="border-b">
                      <td className="py-2 px-2">{r.product?.name ?? "—"}</td>
                      <td className="py-2 px-2">{r.user_email || r.user?.email || "—"}</td>
                      <td className="py-2 px-2">★ {r.rating}</td>
                      <td className="py-2 px-2">{r.title || "—"}</td>
                      <td className="py-2 px-2">
                        <Switch
                          checked={!!r.is_approved}
                          onCheckedChange={(v) => toggleApprove(r, v)}
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <Button size="sm" variant="destructive" onClick={() => onDelete(r.id)}>
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
