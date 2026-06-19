import Link from "next/link";
import { LayoutDashboard, Wine, Warehouse, Grape, LogOut } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth.actions";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cellars", label: "Cellars", icon: Warehouse },
  { href: "/wines", label: "Wines", icon: Wine },
  { href: "/grapes", label: "Grapes", icon: Grape },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const nickname = user?.user_metadata?.nickname as string | undefined;
  const cellarTitle = nickname ? `${nickname}'s Wine Cellar` : "Wine Cellar";

  return (
    <div className="flex h-screen">
      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex w-56 shrink-0 border-r border-border bg-sidebar flex-col">
        <div className="px-6 py-5 border-b border-border">
          <span className="font-semibold text-lg tracking-tight text-primary">
            🍷 {cellarTitle}
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
        <div className="px-3 py-4 border-t border-border">
          <Link
            href="/account"
            className="block text-xs text-muted-foreground px-3 mb-2 truncate hover:text-primary transition-colors"
          >
            {user?.email}
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-primary transition-colors w-full"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content — extra bottom padding on mobile for the tab bar */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8">
        {children}
      </main>

      {/* Bottom tab bar — mobile only */}
      <BottomNav />
    </div>
  );
}
