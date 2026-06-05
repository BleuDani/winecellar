"use client";

import { useState, useTransition } from "react";
import { createCellar } from "@/actions/cellar.actions";
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
import { Plus } from "lucide-react";

export function CreateCellarDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const { error } = await createCellar(formData);
      if (error) {
        alert(error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus size={16} className="mr-1" /> New Cellar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Cellar</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" required placeholder="Main Cellar" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" placeholder="Basement" />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating…" : "Create Cellar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
