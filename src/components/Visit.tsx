import { site } from "@/lib/site";
import Reveal from "./Reveal";
import OpenStatus from "./OpenStatus";
import ArchMark from "./ArchMark";

export default function Visit() {
  return (
    <section id="visit" className="visit-section section-shell">
      <div className="site-container">
        <Reveal className="section-heading">
          <div>
            <p className="label">04 / See you out back</p>
            <h2 className="display">you’re nearly here.</h2>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapsQuery)}`}
            target="_blank"
            rel="noreferrer noopener"
            className="pill-button"
          >
            Get directions <span aria-hidden="true">↗</span>
          </a>
        </Reveal>
        <div className="visit-layout">
          <Reveal className="courtyard-guide">
            <div className="guide-heading label">
              <span>Finding us is part of it.</span>
              <span>A courtyard guide · Not to scale</span>
            </div>
            <div className="courtyard-route">
              <div className="route-stop">
                <span className="route-number label">01</span>
                <div className="route-arch">
                  <ArchMark className="h-20 w-auto" />
                </div>
                <h3 className="display">off the street</h3>
                <p>
                  Oranienstraße 147.
                  <br />
                  Through the passage.
                </p>
              </div>
              <span className="route-arrow" aria-hidden="true">
                →
              </span>
              <div className="route-stop">
                <span className="route-number label">02</span>
                <div className="route-arch">
                  <ArchMark className="h-20 w-auto" />
                </div>
                <h3 className="display">keep going</h3>
                <p>
                  Past the bins.
                  <br />
                  Across the first courtyard.
                </p>
              </div>
              <span className="route-arrow" aria-hidden="true">
                →
              </span>
              <div className="route-stop route-destination">
                <span className="route-number label">03</span>
                <div className="route-arch">
                  <ArchMark className="h-20 w-auto" />
                </div>
                <h3 className="display">you’re here.</h3>
                <p>
                  Second courtyard.
                  <br />
                  The lit door on your right.
                </p>
              </div>
            </div>
            <div className="guide-bottom">
              <p className="display">
                looks closed.
                <br />
                probably isn’t.
              </p>
              <p>
                The passage is unmarked.
                <br />
                Come on through.
              </p>
            </div>
          </Reveal>
          <Reveal className="visit-information">
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
