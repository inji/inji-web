import { formatLastCheckedAt, formatPreviewLastChecked, formatSharedTimestamp } from "../../utils/dateUtils";

describe("formatLastCheckedAt", () => {
    test("formats a local timestamp as DD/MM/YY hh:mmAM/PM", () => {
        const iso = new Date(2025, 9, 12, 22, 30, 0).toISOString();

        expect(formatLastCheckedAt(iso)).toBe("12/10/25 10:30PM");
    });

    test("trims fractional seconds beyond milliseconds", () => {
        const iso = new Date(2025, 9, 20, 6, 30, 5, 908).toISOString();
        const withNanoseconds = iso.replace(/(\.\d{3})\d*Z$/, "$1123200Z");

        expect(formatLastCheckedAt(withNanoseconds)).toBe("20/10/25 06:30AM");
    });

    test("returns an empty string for an invalid timestamp", () => {
        expect(formatLastCheckedAt("not-a-date")).toBe("");
    });
});

describe("formatPreviewLastChecked", () => {
    test("formats a local timestamp as a long date with time", () => {
        const iso = new Date(2025, 9, 20, 18, 30, 0).toISOString();

        expect(formatPreviewLastChecked(iso, "en")).toBe("20 October 2025, 06:30PM");
    });
});

describe("formatSharedTimestamp", () => {
    const locale = "en-US";

    test("returns isToday true and time when date is today", () => {
        const now = new Date(2026, 6, 17, 14, 30, 0);
        const date = new Date(2026, 6, 17, 9, 5, 0);

        const result = formatSharedTimestamp(date, locale, now);

        expect(result.isToday).toBe(true);
        expect(result.time).toBe(
            date.toLocaleTimeString(locale, {
                hour: "numeric",
                minute: "2-digit",
            })
        );
        expect(result.dateTimeLabel).toBe(
            date.toLocaleString(locale, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
            })
        );
    });

    test("returns isToday false when date is not today", () => {
        const now = new Date(2026, 6, 17, 14, 30, 0);
        const date = new Date(2026, 6, 16, 9, 5, 0);

        const result = formatSharedTimestamp(date, locale, now);

        expect(result.isToday).toBe(false);
        expect(result.dateTimeLabel).toBe(
            date.toLocaleString(locale, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
            })
        );
    });

    test("defaults now to current date when omitted", () => {
        const date = new Date();
        const result = formatSharedTimestamp(date, locale);

        expect(result.isToday).toBe(true);
    });
});
