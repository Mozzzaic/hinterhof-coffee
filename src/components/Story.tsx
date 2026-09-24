import Link from "next/link";
import { stats } from "@/lib/site";
import Counter from "./Counter";
import InkImage from "./InkImage";
import LineReveal from "./LineReveal";
import Reveal from "./Reveal";
import StoryMark from "./StoryMark";

export default function Story() {
  return (
    <section id="story" className="story-section section-shell">
      <div className="site-container">
        <div className="story-manifesto">
          <Reveal as="p" className="label">
            03 / A little further back, since 2016
          </Reveal>
          <LineReveal className="display">
            better coffee.
            <br />
            fewer shortcuts.
          </LineReveal>
          <StoryMark />
        </div>
        <div className="story-layout">
          <figure className="story-photo">
            <div className="story-photo-frame">
              <InkImage
                src="/images/roastery.jpg"
                alt="Freshly roasted beans emptying from a Probat drum roaster."
                sizes="(min-width: 1024px) 50vw, 92vw"
                paper="sky"
                sweep="up"
                className="story-photo-crop"
                focus={[0.42, 0.6]}
                zoom={1.3}
              />
            </div>
            <figcaption className="label">
              Small batches. Every detail, by hand.
            </figcaption>
          </figure>
          <div className="story-copy">
            <Reveal as="p" className="story-lede">
              The best things in Berlin aren’t always on the street.
            </Reveal>
            <Reveal as="p" delay={0.07}>
              We started with a second-hand 5 kg roaster and a workshop nobody
              else wanted. No sign on the street. One grinder. A coffee worth
              coming back for.
            </Reveal>
            <Reveal as="p" delay={0.14}>
              The Probat got bigger in 2019. The idea stayed small: buy
              carefully, roast right here, and give every batch ten days to find
              its feet.
            </Reveal>
            <Reveal as="p" delay={0.21}>
              Since 2022, most of our coffee comes through two importers who
              publish what the producer was paid. The rest comes from the same
              two farms we opened with.
            </Reveal>
            <Reveal className="story-tour" delay={0.28}>
              <Link href="/#visit" className="pill-button pill-outline">
                Come see how we roast <span aria-hidden="true">↗</span>
              </Link>
              <p className="label">
                Thursdays at 16:00 · Free tours · Eight places
              </p>
            </Reveal>
          </div>
        </div>
        <div className="story-numbers">
          {stats.map((stat, index) => (
            <Reveal key={stat.unit} className="story-number" delay={index * 0.07}>
              <Counter value={stat.figure} className="display" />
              <span className="label">{stat.unit}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
