import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { SmartImage } from "@/components/site/SmartImage";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/studio";

const links = [
  { to: "/", label: "Home" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/quote", label: "Investment" },
] as const;

export function Navbar() {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          {settings.logo_url ? (
            <SmartImage
              reference={settings.logo_url}
              alt={settings.studio_name}
              className="h-9 w-auto object-contain"
              eager
            />
          ) : null}
          <span className="display text-lg tracking-[0.18em] text-foreground md:text-xl">
            {settings.studio_name}
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
          <Button asChild size="sm" className="rounded-none px-5 text-[11px] tracking-[0.2em]">
            <Link to="/quote">RESERVE DATE</Link>
          </Button>
        </nav>

        <button
          type="button"
          className="text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <nav className="flex flex-col gap-1 border-t border-border/60 px-5 pb-5 pt-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="py-3 text-xs uppercase tracking-[0.22em] text-muted-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
