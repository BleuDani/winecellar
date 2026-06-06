"use client";

import { useState, useTransition } from "react";
import { createGrape } from "@/actions/grape.actions";
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

export function CreateGrapeDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const { error } = await createGrape(formData);
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
        <Plus size={16} className="mr-1" /> New Grape
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Grape Variety</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="grape-name">Name *</Label>
            <Input id="grape-name" name="name" required placeholder="e.g. Cabernet Sauvignon" />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating…" : "Create Grape"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
