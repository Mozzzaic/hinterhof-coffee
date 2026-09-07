import Image from "next/image";
import Link from "next/link";
import { stats } from "@/lib/site";
import Counter from "./Counter";
import Reveal from "./Reveal";
import StoryMark from "./StoryMark";

export default function Story() {
  return (
    <section id="story" className="story-section section-shell">
      <div className="site-container">
        <div className="story-manifesto">
          <Reveal>
            <p className="label">03 / A little further back, since 2016</p>
            <h2 className="display">
              better coffee.
              <br />
              fewer shortcuts.
            </h2>
          </Reveal>
          <StoryMark />
        </div>
        <div className="story-layout">
          <Reveal as="figure" className="story-photo">
            <div className="duotone story-photo-crop">
              <Image
                src="/images/roastery.jpg"
                alt="Freshly roasted beans emptying from a Probat drum roaster."
                fill
                sizes="(min-width: 1024px) 48vw, 90vw"
                className="object-cover"
              />
            </div>
            <figcaption className="label">
              Small batches. Every detail, by hand.
            </figcaption>
          </Reveal>
          <Reveal className="story-copy">
            <p className="story-lede">
              The best things in Berlin aren’t always on the street.
            </p>
            <p>
              We started with a second-hand 5 kg roaster and a workshop nobody
              else wanted. No sign on the street. One grinder. A coffee worth
              coming back for.
            </p>
            <p>
              The Probat got bigger in 2019. The idea stayed small: buy
              carefully, roast right here, and give every batch ten days to find
              its feet.
            </p>
            <p>
              Since 2022, most of our coffee comes through two importers who
              publish what the producer was paid. The rest comes from the same
              two farms we opened with.
            </p>
            <Link href="/#visit" className="pill-button pill-outline">
              Come see how we roast <span aria-hidden="true">↗</span>
            </Link>
            <p className="label">
              Thursdays at 16:00 · Free tours · Eight places
            </p>
          </Reveal>
        </div>
        <Reveal className="story-numbers">
          {stats.map((stat) => (
            <div key={stat.unit}>
              <Counter value={stat.figure} className="display" />
              <span className="label">{stat.unit}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
