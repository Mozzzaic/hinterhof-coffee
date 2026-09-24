import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";

/**
 * One place to register plugins. Importing them more than once is harmless,
 * but registering from a single module keeps the tree-shaking honest and
 * means a component never has to think about setup order.
 *
 * The project has exactly one curve, --ease-expo in globals.css. GSAP gets
 * the same one under the name "ink", and it is the default for every tween.
 */
export const EASE = "ink";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase);
  CustomEase.create(EASE, "0.22,1,0.36,1");
  gsap.defaults({ ease: EASE, duration: 0.7 });
}

export { gsap, ScrollTrigger, SplitText, Flip };
