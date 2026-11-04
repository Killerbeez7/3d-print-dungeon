import { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import { formatPrice, getFileFormat, toDate } from "@/features/models/utils/modelMeta";

describe("formatPrice", () => {
  it("formats in the model's currency", () => {
    expect(formatPrice(12.5)).toBe("$12.50");
    expect(formatPrice(3, "eur")).toBe("€3.00");
  });

  it("falls back to the plain number for an unknown currency", () => {
    expect(formatPrice(4, "not-a-currency")).toBe("4");
  });
});

describe("getFileFormat", () => {
  it("reads the extension of a file name", () => {
    expect(getFileFormat("orc-warrior.stl")).toBe("STL");
    expect(getFileFormat("tower.3mf")).toBe("3MF");
  });

  it("reads the extension of a Storage download URL, ignoring the query", () => {
    const url =
      "https://firebasestorage.googleapis.com/v0/b/demo/o/models%2Fabc%2Fdragon.obj?alt=media&token=t";
    expect(getFileFormat(url)).toBe("OBJ");
  });

  it("returns null when there is no extension", () => {
    expect(getFileFormat("README")).toBeNull();
    expect(getFileFormat(undefined)).toBeNull();
  });
});

describe("toDate", () => {
  it("accepts every date shape stored on models", () => {
    const iso = "2026-01-02T03:04:05.000Z";
    expect(toDate(iso)?.toISOString()).toBe(iso);
    expect(toDate(Date.parse(iso))?.toISOString()).toBe(iso);
    expect(toDate(new Date(iso))?.toISOString()).toBe(iso);
    expect(toDate(Timestamp.fromDate(new Date(iso)))?.toISOString()).toBe(iso);
  });

  it("returns null for missing or invalid dates", () => {
    expect(toDate(undefined)).toBeNull();
    expect(toDate("not a date")).toBeNull();
  });
});
