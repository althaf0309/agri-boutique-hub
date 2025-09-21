import { useState } from "react";
import { useContacts, useUpdateContact, useDeleteContact } from "@/api/hooks/contacts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Eye, Trash2 } from "lucide-react";

export function ContactsPage() {
  const { data: contacts = [], isLoading } = useContacts();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();
  const { toast } = useToast();
  const [selected, setSelected] = useState<any | null>(null);

  const toggleHandled = async (c: any, value: boolean) => {
    try {
      await updateContact.mutateAsync({ id: c.id, handled: value } as any);
      toast({ title: value ? "Marked handled" : "Marked unhandled" });
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message, variant: "destructive" });
    }
  };

  const onDelete = async (id: number) => {
    const ok = window.confirm("Delete this contact submission?");
    if (!ok) return;
    try {
      await deleteContact.mutateAsync({ id });
      toast({ title: "Deleted" });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Contact Submissions</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>All Messages</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Loading…</div>
          ) : contacts.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">No submissions.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Email</th>
                    <th className="text-left py-2 px-2">Subject</th>
                    <th className="text-left py-2 px-2">Handled</th>
                    <th className="text-left py-2 px-2">Created</th>
                    <th className="text-right py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c: any) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-2 px-2">{c.name}</td>
                      <td className="py-2 px-2">{c.email}</td>
                      <td className="py-2 px-2">{c.subject || "—"}</td>
                      <td className="py-2 px-2">
                        <Switch checked={!!c.handled} onCheckedChange={(v) => toggleHandled(c, v)} />
                      </td>
                      <td className="py-2 px-2">{new Date(c.created_at).toLocaleString()}</td>
                      <td className="py-2 px-2 text-right">
                        <Button size="sm" variant="outline" className="mr-2" onClick={() => setSelected(c)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(c.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Simple message viewer */}
              {selected && (
                <div className="mt-4 border rounded p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{selected.subject || "Message"}</div>
                    <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    From {selected.name} &lt;{selected.email}&gt; — {new Date(selected.created_at).toLocaleString()}
                  </div>
                  <div className="whitespace-pre-wrap">{selected.message}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
