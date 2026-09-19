"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Map as MapIcon,
  AlertTriangle,
  FileText,
  FlaskConical,
  Trees,
  Settings2,
  Radio,
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/monitoring", label: "Monitoring", icon: MapIcon },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/reports", label: "Field Reports", icon: FileText },
  { href: "/demo", label: "Demo Center", icon: FlaskConical },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r bg-white">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white">
          <Trees className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold leading-none">TreeTrack</div>
          <div className="text-[11px] text-zinc-500">Reforestation Monitor</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-emerald-50 text-emerald-800" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 space-y-3">
        <div className="rounded-lg bg-zinc-50 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
            <Radio className="h-3.5 w-3.5 text-emerald-600" /> Live monitoring
          </div>
          <p className="mt-1 text-xs text-zinc-500">24 plots • Sentinel-2 • 12-day revisit</p>
        </div>
        <div className="text-[11px] text-zinc-400">© TreeTrack • Kiambu, Kenya</div>
      </div>
    </aside>
  );
}
