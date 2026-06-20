"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wine, Warehouse, Grape, User } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cellars", label: "Cellars", icon: Warehouse },
  { href: "/wines", label: "Wines", icon: Wine },
  { href: "/grapes", label: "Grapes", icon: Grape },
  { href: "/account", label: "Account", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-sidebar flex pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 pt-2 text-[10px] transition-colors",
              active
                ? "text-primary"
                : "text-sidebar-foreground/60 hover:text-primary"
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
