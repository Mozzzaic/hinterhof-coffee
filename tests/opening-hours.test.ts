import assert from "node:assert/strict";
import { test } from "node:test";
import { computeOpenStatus } from "../src/lib/opening-hours";

test("Berlin opening and closing boundaries in summer", () => {
  assert.equal(
    computeOpenStatus(new Date("2026-09-07T05:29:00Z")),
    "Closed — opens today at 07:30",
  );
  assert.equal(
    computeOpenStatus(new Date("2026-09-07T05:30:00Z")),
    "Open now — until 18:00 Berlin time",
  );
  assert.equal(
    computeOpenStatus(new Date("2026-09-07T16:00:00Z")),
    "Closed — opens tomorrow at 07:30",
  );
});
test("weekend schedule and winter timezone", () => {
  assert.equal(
    computeOpenStatus(new Date("2026-11-07T08:00:00Z")),
    "Open now — until 18:00 Berlin time",
  );
  assert.equal(
    computeOpenStatus(new Date("2026-11-08T08:30:00Z")),
    "Closed — opens today at 10:00",
  );
});
test("Christmas and New Year closures", () => {
  assert.equal(
    computeOpenStatus(new Date("2026-12-24T11:00:00Z")),
    "Closed — opens Sunday at 10:00",
  );
  assert.equal(
    computeOpenStatus(new Date("2026-12-23T18:00:00Z")),
    "Closed — opens Sunday at 10:00",
  );
  assert.equal(
    computeOpenStatus(new Date("2027-01-01T11:00:00Z")),
    "Closed — opens tomorrow at 09:00",
  );
});
