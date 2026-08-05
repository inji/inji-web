import { formatSharedTimestamp } from "../../utils/dateUtils";

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
