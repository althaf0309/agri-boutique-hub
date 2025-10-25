import { useMemo } from "react";
import { useAdminNotifications } from "@/api/hooks/admin";
import { markRead, markReadMany } from "@/lib/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useAdminNotifications();

  const unseenKeys = useMemo(
    () => (data?.flat ?? []).filter(i => !i.read).map(i => i.key),
    [data]
  );

  const handleMarkAll = () => {
    markReadMany(unseenKeys);
    qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
  };

  const markOne = (key: string) => {
    markRead(key);
    qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
  };

  if (isLoading) return <div className="p-4">Loading…</div>;
  if (isError)   return <div className="p-4 text-red-600">Failed to load notifications.</div>;

  const items = data?.flat ?? [];

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <div className="flex items-center gap-2">
          <Badge variant={data?.unseen ? "default" : "secondary"}>
            {data?.unseen ?? 0} unread
          </Badge>
          <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={!unseenKeys.length}>
            Mark all as read
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {items.length === 0 && <div className="py-6 text-sm text-gray-500">No notifications</div>}

          {items.map((it) => (
            <div key={it.key} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium truncate">{it.title}</div>
                <div className="text-xs text-gray-500">{it.kind.toUpperCase()} • {it.created_at ? new Date(it.created_at).toLocaleString() : "—"}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!it.read && <Badge>New</Badge>}
                <Button asChild variant="ghost" size="sm">
                  <Link to={it.href}>Open</Link>
                </Button>
                {!it.read && (
                  <Button variant="secondary" size="sm" onClick={() => markOne(it.key)}>
                    Mark read
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
