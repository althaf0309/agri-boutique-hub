import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateVendor } from "@/api/hooks/vendors";
import { useToast } from "@/hooks/use-toast";

export function AddVendorDialog({ onCreated }: { onCreated: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { mutateAsync, isPending } = useCreateVendor();
  const { toast } = useToast();

  const save = async () => {
    try {
      const v = await mutateAsync({ name });
      toast({ title: "Vendor created" });
      onCreated(v.id);
      setOpen(false);
      setName("");
    } catch {
      toast({ title: "Failed to create vendor", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button type="button" variant="outline" className="w-full">Add new vendor</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New Vendor</DialogTitle></DialogHeader>
        <Input placeholder="Vendor name" value={name} onChange={(e) => setName(e.target.value)} />
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="ghost">Cancel</Button>
          <Button onClick={save} disabled={!name.trim() || isPending}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
