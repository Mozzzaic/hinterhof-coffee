import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * One place to register plugins. Importing them more than once is harmless,
 * but registering from a single module keeps the tree-shaking honest and
 * means a component never has to think about setup order.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
