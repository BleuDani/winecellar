"use client";

import { useState, useTransition } from "react";
import { updateCellar } from "@/actions/cellar.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";

type Cellar = { id: string; name: string; location: string | null };

export function EditCellarDialog({ cellar }: { cellar: Cellar }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const { error } = await updateCellar(cellar.id, formData);
      if (error) {
        alert(error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="icon-sm" />}>
        <Pencil size={14} />
        <span className="sr-only">Edit cellar</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Cellar</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-cellar-name">Name *</Label>
            <Input
              id="edit-cellar-name"
              name="name"
              required
              defaultValue={cellar.name}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-cellar-location">Location</Label>
            <Input
              id="edit-cellar-location"
              name="location"
              defaultValue={cellar.location ?? ""}
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
