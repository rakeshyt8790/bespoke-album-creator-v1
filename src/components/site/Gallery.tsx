import { Play, X } from "lucide-react";
import { useMemo, useState } from "react";

import { SmartImage } from "@/components/site/SmartImage";
import { useMedia, youtubeEmbed, type PortfolioMedia } from "@/lib/studio";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Weddings", "Pre-Weddings", "Films"] as const;

export function Gallery({ limit }: { limit?: number }) {
  const { media } = useMedia();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [active, setActive] = useState<PortfolioMedia | null>(null);

  const items = useMemo(() => {
    const filtered =
      filter === "All"
        ? media
        : media.filter(
            (m) =>
              m.category === filter ||
              (filter === "Films" && m.media_type === "video") ||
              (filter === "Pre-Weddings" && m.category === "Pre-Wedding"),
          );
    return limit ? filtered.slice(0, limit) : filtered;
  }, [media, filter, limit]);

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "pb-1 text-[11px] uppercase tracking-[0.24em] transition-colors",
              filter === f
                ? "border-b border-primary text-primary"
                : "border-b border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No work in this collection yet.
        </p>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {items.map((item) => {
            const embed = item.media_type === "video" ? youtubeEmbed(item.media_url) : null;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item)}
                className="group relative block w-full overflow-hidden break-inside-avoid border border-border/50 text-left"
              >
                {embed ? (
                  <div className="flex aspect-video w-full items-center justify-center bg-surface-2">
                    <Play className="size-8 text-primary" />
                  </div>
                ) : (
                  <SmartImage
                    reference={item.media_url}
                    alt={item.title || "Portfolio image"}
                    className="w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/40" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="display text-lg">{item.title}</p>
                  <p className="eyebrow mt-1">{item.category}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {active ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute right-5 top-5 text-muted-foreground hover:text-primary"
            onClick={() => setActive(null)}
          >
            <X className="size-6" />
          </button>
          <div className="max-h-[88svh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {active.media_type === "video" && youtubeEmbed(active.media_url) ? (
              <iframe
                src={youtubeEmbed(active.media_url) as string}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full border border-border"
              />
            ) : (
              <SmartImage
                reference={active.media_url}
                alt={active.title}
                eager
                className="max-h-[80svh] w-full object-contain"
              />
            )}
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {active.title} — {active.category}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
