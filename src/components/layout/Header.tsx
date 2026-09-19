"use client";
import Link from "next/link";
import { Trees, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4 md:hidden">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-700 text-white">
          <Trees className="h-4 w-4" />
        </div>
        <span className="font-semibold text-sm">TreeTrack</span>
      </Link>
      <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)}>
        <Menu className="h-5 w-5" />
      </Button>
      {open && (
        <div className="absolute left-0 top-14 z-50 w-full border-b bg-white p-4 shadow-md md:hidden">
          <nav className="space-y-2">
            {[
              { href: "/", label: "Dashboard" },
              { href: "/monitoring", label: "Monitoring" },
              { href: "/alerts", label: "Alerts" },
              { href: "/reports", label: "Field Reports" },
              { href: "/demo", label: "Demo Center" },
            ].map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm hover:bg-zinc-50">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
