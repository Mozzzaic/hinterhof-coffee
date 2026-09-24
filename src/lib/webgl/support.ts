/**
 * Whether the press runs, decided once.
 *
 * The inline script in layout.tsx sets `data-press="on"` on <html> before the
 * first paint when WebGL2 exists and the visitor has not asked to save data.
 * CSS reads the same attribute to hide the static posters the canvases
 * replace. If three.js then fails to load, `pressFailed()` flips it back and
 * every poster reappears: nothing ever depends on the canvas being there.
 */

export const PRESS_SCRIPT = `(function(){try{var d=document.documentElement,c=navigator.connection;d.setAttribute("data-js","");if(window.WebGL2RenderingContext&&!(c&&c.saveData))d.setAttribute("data-press","on")}catch(e){}})()`;

export function pressOn() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.dataset.press === "on"
  );
}

export function pressFailed() {
  if (typeof document !== "undefined")
    document.documentElement.dataset.press = "off";
}

export function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

let three: Promise<typeof import("three")> | null = null;

/** three.js never ships in the first bundle: it is fetched the first time a canvas asks. */
export function loadThree() {
  three ??= import("three").catch((error) => {
    pressFailed();
    throw error;
  });
  return three;
}
