import { useMe } from "@/api/hooks/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminProfilePage() {
  const { data: me, isLoading, isError } = useMe();

  if (isLoading) return <div className="p-4">Loading…</div>;
  if (isError || !me) return <div className="p-4 text-red-600">Failed to load profile.</div>;

  return (
    <div className="p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-gray-500">Name:</span> {`${me.first_name || ""} ${me.last_name || ""}`.trim() || "—"}</div>
          <div><span className="text-gray-500">Email:</span> {me.email}</div>
          <div><span className="text-gray-500">Role:</span> {me.is_superuser ? "Superuser" : me.is_staff ? "Staff" : "User"}</div>
          <div><span className="text-gray-500">Vendor:</span> {me.is_vendor ? "Yes" : "No"}</div>
          <div><span className="text-gray-500">Active:</span> {me.is_active ? "Yes" : "No"}</div>
        </CardContent>
      </Card>
    </div>
  );
}
