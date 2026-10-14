import { Link, createFileRoute } from "@tanstack/react-router";

import { Footer } from "@/components/site/Footer";
import { Gallery } from "@/components/site/Gallery";
import { Hero } from "@/components/site/Hero";
import { Navbar } from "@/components/site/Navbar";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/studio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Parinaya Wedding Films | Luxury Candid Wedding Photography" },
      {
        name: "description",
        content:
          "Parinaya Wedding Films documents Indian celebrations through luxury candid wedding photography and cinematic films.",
      },
      {
        property: "og:title",
        content: "Parinaya Wedding Films | Luxury Candid Wedding Photography & Films",
      },
      {
        property: "og:description",
        content:
          "Timeless wedding stories captured with pure candid emotion. Based in India & Available Worldwide.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://bespoke-album-app.lovable.app/" },
      {
        property: "og:image",
        content: "https://bespoke-album-app.lovable.app/og-image.jpg",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Parinaya Wedding Films | Luxury Candid Wedding Photography & Films",
      },
      {
        name: "twitter:description",
        content: "Timeless wedding stories captured with pure candid emotion.",
      },
      {
        name: "twitter:image",
        content: "https://bespoke-album-app.lovable.app/og-image.jpg",
      },
    ],
    links: [{ rel: "canonical", href: "https://bespoke-album-app.lovable.app/" }],
  }),
  component: Home,
});

function Home() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      <section className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">Our philosophy</p>
          </div>
          <div className="md:col-span-8">
            <h2 className="text-3xl leading-tight md:text-5xl">{settings.tagline}</h2>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {settings.bio}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 md:px-10 md:pb-32">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 className="mt-3 text-4xl md:text-5xl">The Portfolio</h2>
          </div>
          <Link
            to="/portfolio"
            className="text-[11px] uppercase tracking-[0.24em] text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <Gallery limit={6} />
      </section>

      <section className="border-y border-border/60 bg-surface px-5 py-24 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Transparent pricing</p>
          <h2 className="mt-4 text-4xl md:text-5xl">
            Build your investment, event by event
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Add each function — haldi, mehendi, sangeet, muhurtham, reception — then choose exactly
            the cameras and crew you want. See your total update live.
          </p>
          <Button asChild size="lg" className="mt-10 rounded-none px-8 text-[11px] tracking-[0.22em]">
            <Link to="/quote">BUILD YOUR INVESTMENT &amp; RESERVE DATE</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
