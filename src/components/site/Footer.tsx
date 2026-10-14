import { Link } from "@tanstack/react-router";
import { Instagram, MapPin, Phone, Youtube } from "lucide-react";

import { useSettings } from "@/lib/studio";

export function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="border-t border-border/60 bg-ink px-5 py-16 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-3">
        <div>
          <p className="display text-2xl tracking-[0.16em]">{settings.studio_name}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {settings.tagline}
          </p>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="eyebrow">Studio</p>
          {settings.studio_address ? (
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              {settings.studio_address}
            </p>
          ) : null}
          {settings.phone_number ? (
            <a
              href={`tel:${settings.phone_number}`}
              className="flex items-center gap-2 transition-colors hover:text-primary"
            >
              <Phone className="size-4 text-primary" />
              {settings.phone_number}
            </a>
          ) : null}
        </div>

        <div className="space-y-4">
          <p className="eyebrow">Follow</p>
          <div className="flex gap-4">
            {settings.instagram_url ? (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="border border-border p-3 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Instagram className="size-4" />
              </a>
            ) : null}
            {settings.youtube_url ? (
              <a
                href={settings.youtube_url}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="border border-border p-3 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Youtube className="size-4" />
              </a>
            ) : null}
          </div>
          <Link
            to="/admin"
            className="inline-block text-[11px] uppercase tracking-[0.22em] text-muted-foreground/60 transition-colors hover:text-primary"
          >
            Studio login
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-7xl border-t border-border/60 pt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60">
        © {new Date().getFullYear()} {settings.studio_name}
      </div>
    </footer>
  );
}
