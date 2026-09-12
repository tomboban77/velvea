"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Star,
  Ticket,
  Gift,
  Building2,
  Newspaper,
  Settings,
  Blocks,
  Mail,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { adminLogoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/collections", label: "Collections", icon: FolderTree },
  { href: "/admin/builder", label: "Custom Builder", icon: Blocks },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/discounts", label: "Discounts", icon: Ticket },
  { href: "/admin/gift-cards", label: "Gift Cards", icon: Gift },
  { href: "/admin/inquiries", label: "Corporate", icon: Building2 },
  { href: "/admin/articles", label: "Gift Guides", icon: Newspaper },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/admin" className="flex items-center">
          <Logo height={26} />
        </Link>
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close">
          <X className="h-5 w-5 text-canvas/70" />
        </button>
      </div>
      <span className="mx-5 mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-canvas/40">
        Management
      </span>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-canvas"
                  : "text-canvas/60 hover:bg-white/5 hover:text-canvas"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate px-2 text-xs text-canvas/50">{email}</p>
        <div className="mt-2 flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-canvas/70 hover:text-canvas"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View store
          </a>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-canvas/70 hover:text-danger"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-charcoal lg:block">
        {Sidebar}
      </aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-charcoal">{Sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-line bg-canvas/90 px-5 backdrop-blur">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-ink">Velvea Admin</span>
          <span className="ml-auto rounded-full bg-iris-soft px-3 py-1 text-xs font-medium text-ink">
            {process.env.NODE_ENV === "development" ? "Dev" : "Live"}
          </span>
        </header>
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
