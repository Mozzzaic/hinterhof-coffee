import Image from "next/image";
import Reveal from "./Reveal";

export default function Story() {
  return (
    <section id="story" className="scroll-mt-20 px-6 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1400px]">
        <Reveal className="border-t-[6px] border-ink" />

        <div className="mt-10 grid grid-cols-1 items-start gap-x-14 gap-y-10 min-[620px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Reveal as="figure" className="m-0 min-w-0">
            <div className="relative pr-4 pb-4">
              {/* Offset outline behind the photo — the double-frame motif. */}
              <div
                aria-hidden
                className="absolute bottom-0 left-0 aspect-4/5 w-[calc(100%-1rem)] rounded-[1rem_18rem_1rem_18rem] border-2 border-ink"
              />
              <div className="duotone relative aspect-4/5 w-full rounded-[1rem_18rem_1rem_18rem]">
                <Image
                  src="/images/roastery.jpg"
                  alt="The drum roaster mid-batch, beans tumbling behind the glass."
                  fill
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>
            <figcaption className="label mt-3.5">
              The Probat, mid-batch · 2. Hinterhof
            </figcaption>
          </Reveal>

          <div className="min-w-0">
            <Reveal>
              <p className="label">03 / Our story</p>
              <h2 className="display mt-3.5 text-[clamp(2.5rem,5vw,4.25rem)] lowercase">
                nine years, one courtyard
              </h2>
              <p className="mt-7 max-w-[40ch] text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.14] font-medium text-pretty">
                Rent on the street is for people selling something you already
                know you want. We are two courtyards back.
              </p>
            </Reveal>

            <Reveal className="mt-8 [columns:16.25rem_2] gap-10 text-base leading-relaxed">
              <p className="mb-4">
                Hinterhof started in 2016 with a second-hand 5 kg roaster and a
                lease nobody else wanted: a workshop off the second courtyard,
                no sign on the street, one grinder. The 12 kg Probat replaced
                it in 2019 and has done every batch since.
              </p>
              <p>
                Since 2022 most of the coffee arrives on repeat contracts with
                two importers who publish what the producer was paid; the rest
                comes from the same two farms we opened with. The arithmetic
                has not changed either: small lots, roasted thirty-eight steps
                from the bar, rested ten days before they reach the shelf.
                That last part costs us storage and patience, and it is the
                only part we will not shorten.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
