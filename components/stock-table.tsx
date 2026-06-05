import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { removeStockItem } from "@/actions/stock.actions";
import { Trash2 } from "lucide-react";

type StockItem = {
  id: string;
  quantity: number;
  purchasePrice: unknown;
  binLocation: string | null;
  drinkFrom: number | null;
  drinkUntil: number | null;
  wine?: {
    id: string;
    producer: string;
    name: string;
    vintage: number | null;
  };
  cellar?: {
    id: string;
    name: string;
  };
};

export function StockTable({
  stockItems,
  showWine,
  showCellar,
}: {
  stockItems: StockItem[];
  showWine?: boolean;
  showCellar?: boolean;
}) {
  if (stockItems.length === 0) {
    return <p className="text-sm text-stone-500">No stock entries yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showWine && <TableHead>Wine</TableHead>}
          {showCellar && <TableHead>Cellar</TableHead>}
          <TableHead className="text-right">Qty</TableHead>
          <TableHead>Bin</TableHead>
          <TableHead>Drink Window</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {stockItems.map((item) => (
          <TableRow key={item.id}>
            {showWine && item.wine && (
              <TableCell>
                <Link
                  href={`/wines/${item.wine.id}`}
                  className="hover:underline font-medium"
                >
                  {item.wine.producer} {item.wine.name}
                  {item.wine.vintage && (
                    <span className="text-stone-500 ml-1">
                      {item.wine.vintage}
                    </span>
                  )}
                </Link>
              </TableCell>
            )}
            {showCellar && item.cellar && (
              <TableCell>
                <Link
                  href={`/cellars/${item.cellar.id}`}
                  className="hover:underline"
                >
                  {item.cellar.name}
                </Link>
              </TableCell>
            )}
            <TableCell className="text-right font-medium">
              {item.quantity}
            </TableCell>
            <TableCell className="text-stone-500">
              {item.binLocation ?? "—"}
            </TableCell>
            <TableCell className="text-stone-500">
              {item.drinkFrom && item.drinkUntil
                ? `${item.drinkFrom}–${item.drinkUntil}`
                : item.drinkFrom
                  ? `from ${item.drinkFrom}`
                  : item.drinkUntil
                    ? `until ${item.drinkUntil}`
                    : "—"}
            </TableCell>
            <TableCell className="text-right text-stone-500">
              {item.purchasePrice
                ? `€${Number(item.purchasePrice).toFixed(2)}`
                : "—"}
            </TableCell>
            <TableCell>
              <form action={removeStockItem.bind(null, item.id)}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-stone-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </Button>
              </form>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
