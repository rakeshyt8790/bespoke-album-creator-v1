import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "@/components/site/Footer";
import { Gallery } from "@/components/site/Gallery";
import { Navbar } from "@/components/site/Navbar";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Wedding Portfolio | Parinaya Wedding Films" },
      {
        name: "description",
        content:
          "Explore luxury candid wedding photography, pre-wedding portraits and cinematic films by Parinaya Wedding Films.",
      },
      { property: "og:title", content: "Wedding Portfolio | Parinaya Wedding Films" },
      {
        property: "og:description",
        content: "Luxury candid wedding photographs, pre-wedding portraits and cinematic films by Parinaya Wedding Films.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://bespoke-album-app.lovable.app/portfolio" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://bespoke-album-app.lovable.app/portfolio" },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-10 md:pt-40">
        <p className="eyebrow">Archive</p>
        <h1 className="mt-3 text-5xl md:text-7xl">The Portfolio</h1>
        <div className="hairline my-10" />
        <Gallery />
      </main>
      <Footer />
    </div>
  );
}
