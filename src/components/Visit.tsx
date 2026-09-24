import { site } from "@/lib/site";
import LineReveal from "./LineReveal";
import OpenStatus from "./OpenStatus";
import Reveal from "./Reveal";
import VisitWalk from "./VisitWalk";

export default function Visit() {
  return (
    <section id="visit" className="visit-section section-shell">
      <div className="site-container">
        <div className="section-heading">
          <div>
            <Reveal as="p" className="label">
              04 / See you out back
            </Reveal>
            <LineReveal className="display">you’re nearly here.</LineReveal>
          </div>
          <Reveal delay={0.14}>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapsQuery)}`}
              target="_blank"
              rel="noreferrer noopener"
              className="pill-button"
            >
              Get directions <span aria-hidden="true">↗</span>
            </a>
          </Reveal>
        </div>
        <div className="visit-layout">
          <VisitWalk />
          <Reveal className="visit-information" delay={0.14}>
            <p className="label">Your next coffee is here</p>
            <address>
              <span className="display">
                Oranienstraße
                <br />
                147.
              </span>
              <p>
                {site.address.detail}
                <br />
                {site.address.postcode} {site.address.city}
              </p>
            </address>
            <OpenStatus />
            <dl className="visit-hours">
              {site.hours.slice(0, 3).map((slot) => (
                <div key={slot.days}>
                  <dt>{slot.days}</dt>
                  <dd>{slot.time}</dd>
                </div>
              ))}
            </dl>
            <p className="visit-transit">{site.transit}</p>
            <a
              href={`mailto:${site.contact.email}?subject=Thursday%20roastery%20tour`}
              className="tour-link"
            >
              <span>
                <span className="label">Behind the roast</span>
                <span>Free tour · Thursdays, 16:00</span>
              </span>
              <span aria-hidden="true">↗</span>
            </a>
            <p className="visit-closure">
              Eight places — email to book.
              <br />
              Closed 24–26 December and 1 January.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
