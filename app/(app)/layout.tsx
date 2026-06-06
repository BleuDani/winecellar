import Link from "next/link";
import { LayoutDashboard, Wine, Warehouse, Grape } from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cellars", label: "Cellars", icon: Warehouse },
  { href: "/wines", label: "Wines", icon: Wine },
  { href: "/grapes", label: "Grapes", icon: Grape },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <aside className="w-56 shrink-0 border-r border-border bg-sidebar flex flex-col">
        <div className="px-6 py-5 border-b border-border">
          <span className="font-semibold text-lg tracking-tight text-primary">
            🍷 Bleu's Wine Cellar
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-primary transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
