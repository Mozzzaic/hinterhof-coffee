import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * One place to register plugins. Importing them more than once is harmless,
 * but registering from a single module keeps the tree-shaking honest and
 * means a component never has to think about setup order.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/** House easing — the same expo-out curve the CSS transitions use. */
export const EASE = "power3.out";

export { gsap, ScrollTrigger, SplitText };
