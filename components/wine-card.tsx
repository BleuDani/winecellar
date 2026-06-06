import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Wine = {
  id: string;
  producer: string;
  name: string;
  vintage: number | null;
  region: string | null;
  grape: string | null;
  labelImage: string | null;
  stockItems: { quantity: number }[];
  vivinoData: { score: unknown } | null;
};

export function WineCard({ wine }: { wine: Wine }) {
  const totalBottles = wine.stockItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <Link href={`/wines/${wine.id}`}>
      <Card className="hover:border-stone-400 transition-colors cursor-pointer h-full flex flex-col">
        {wine.labelImage && (
          <div className="relative h-36 w-full overflow-hidden rounded-t-xl">
            <Image
              src={wine.labelImage}
              alt={`${wine.name} label`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {wine.producer}
          </p>
          <CardTitle className="text-base leading-tight">{wine.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {wine.vintage && (
            <Badge variant="outline" className="text-xs">
              {wine.vintage}
            </Badge>
          )}
          {wine.region && (
            <Badge variant="outline" className="text-xs">
              {wine.region}
            </Badge>
          )}
          {wine.grape && (
            <Badge variant="secondary" className="text-xs">
              {wine.grape}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {totalBottles} btl
          </Badge>
          {wine.vivinoData && (
            <Badge className="text-xs bg-red-700 hover:bg-red-700">
              ★ {String(wine.vivinoData.score)}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
