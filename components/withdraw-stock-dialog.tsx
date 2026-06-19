"use client";

import { useState, useTransition } from "react";
import { withdrawStock } from "@/actions/stock.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GlassWater } from "lucide-react";

export function WithdrawStockDialog({
  stockItemId,
  maxQuantity,
}: {
  stockItemId: string;
  maxQuantity: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const { error } = await withdrawStock(stockItemId, formData);
      if (error) {
        alert(error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-stone-400 hover:text-primary"
          />
        }
      >
        <GlassWater size={14} />
        <span className="sr-only">Withdraw bottles</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Bottles</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="withdraw-quantity">Quantity *</Label>
            <Input
              id="withdraw-quantity"
              name="quantity"
              type="number"
              min={1}
              max={maxQuantity}
              defaultValue={1}
              required
            />
            <p className="text-xs text-muted-foreground">{maxQuantity} in stock</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="withdraw-date">Date</Label>
            <Input
              id="withdraw-date"
              name="withdrawnAt"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="withdraw-reason">Occasion / circumstance</Label>
            <Textarea
              id="withdraw-reason"
              name="reason"
              rows={3}
              placeholder="e.g. Anniversary dinner, gift to a friend, corked and discarded…"
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Saving…" : "Withdraw"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
