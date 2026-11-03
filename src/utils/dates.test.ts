import { describe, expect, it } from "vitest";
import { addDays, formatDate, formatRelativeDate } from "./dates";

const at = (month: number, day: number, hour = 12, minute = 0) => new Date(2026, month - 1, day, hour, minute);

describe("formatDate", () => {
  it("hides the year when it is the current one", () => {
    expect(formatDate(at(11, 9).toISOString(), at(11, 3))).toBe("Nov 9");
  });

  it("shows the year when it differs", () => {
    expect(formatDate(new Date(2027, 0, 8).toISOString(), at(11, 3))).toBe("Jan 8, 2027");
  });
});

describe("formatRelativeDate", () => {
  it("counts calendar days, not elapsed time", () => {
    const now = at(11, 3, 10, 0);
    const almostSixDaysLater = at(11, 9, 9, 59);
    expect(Math.floor((almostSixDaysLater.getTime() - now.getTime()) / 86_400_000)).toBe(5);
    expect(formatRelativeDate(almostSixDaysLater.toISOString(), now)).toBe("in 6 days");
  });

  it("treats a date a few hours away on the next day as tomorrow", () => {
    expect(formatRelativeDate(at(11, 4, 1).toISOString(), at(11, 3, 23))).toBe("tomorrow");
  });

  it("names today and yesterday", () => {
    expect(formatRelativeDate(at(11, 3, 23).toISOString(), at(11, 3, 1))).toBe("today");
    expect(formatRelativeDate(at(11, 2).toISOString(), at(11, 3))).toBe("yesterday");
  });

  it("describes past dates", () => {
    expect(formatRelativeDate(at(10, 24).toISOString(), at(11, 3))).toBe("10 days ago");
  });
});

describe("addDays", () => {
  it("moves the date the same way the API does", () => {
    const iso = "2026-11-09T01:35:49.093Z";
    expect(addDays(iso, 30)).toBe("2026-12-09T01:35:49.093Z");
  });
});
