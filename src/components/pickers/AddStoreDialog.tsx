import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateStore } from "@/api/hooks/stores";
import { useToast } from "@/hooks/use-toast";

export function AddStoreDialog({ onCreated }: { onCreated: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { mutateAsync, isPending } = useCreateStore();
  const { toast } = useToast();

  const save = async () => {
    try {
      const s = await mutateAsync({ name });
      toast({ title: "Store created" });
      onCreated(s.id);
      setOpen(false);
      setName("");
    } catch {
      toast({ title: "Failed to create store", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button type="button" variant="outline" className="w-full">Add new store</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New Store</DialogTitle></DialogHeader>
        <Input placeholder="Store name" value={name} onChange={(e) => setName(e.target.value)} />
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="ghost">Cancel</Button>
          <Button onClick={save} disabled={!name.trim() || isPending}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
