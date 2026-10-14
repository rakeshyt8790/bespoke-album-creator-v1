import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SmartImage } from "@/components/site/SmartImage";
import { Button } from "@/components/ui/button";
import { useMedia, useSettings } from "@/lib/studio";

export function Hero() {
  const { settings } = useSettings();
  const { media } = useMedia();

  const slides = (() => {
    const heroes = media.filter((m) => m.is_hero && m.media_type !== "video");
    const pool = heroes.length > 0 ? heroes : media.filter((m) => m.media_type !== "video");
    return pool.slice(0, 6);
  })();

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="relative h-[100svh] min-h-[600px] w-full overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-[1600ms] ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <SmartImage
            reference={slide.media_url}
            alt={slide.title || settings.studio_name}
            eager={i === 0}
            className="size-full scale-105 object-cover"
          />
        </div>
      ))}

      <div className="film-veil absolute inset-0" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-24 md:px-10 md:pb-32">
        <p className="eyebrow mb-6">Wedding Photography &amp; Films — India &amp; Worldwide</p>
        <h1 className="max-w-4xl text-5xl leading-[0.95] md:text-7xl lg:text-8xl">
          {settings.studio_name}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {settings.tagline}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button asChild size="lg" className="rounded-none px-8 text-[11px] tracking-[0.22em]">
            <Link to="/quote">BUILD YOUR INVESTMENT &amp; RESERVE DATE</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-none border-border bg-transparent px-8 text-[11px] tracking-[0.22em] hover:border-primary hover:bg-transparent hover:text-primary"
          >
            <Link to="/portfolio">VIEW PORTFOLIO</Link>
          </Button>
        </div>

        {slides.length > 1 ? (
          <div className="mt-12 flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className="h-px w-10 transition-colors"
                style={{
                  backgroundColor:
                    i === index ? "var(--color-champagne)" : "var(--color-muted-foreground)",
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
