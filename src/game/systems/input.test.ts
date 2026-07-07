import { describe, expect, it } from "vitest";
import { getDirectionFromButtons, type InputButtons } from "./input";

const emptyButtons: InputButtons = {
  up: false,
  down: false,
  left: false,
  right: false,
};

describe("input mapping", () => {
  it("combines throttle and turn buttons", () => {
    expect(getDirectionFromButtons({ ...emptyButtons, up: true, left: true })).toEqual({
      x: -1,
      z: -1,
    });
  });

  it("cancels opposite buttons on the same axis", () => {
    expect(getDirectionFromButtons({ ...emptyButtons, left: true, right: true })).toEqual({
      x: 0,
      z: 0,
    });
  });
});
