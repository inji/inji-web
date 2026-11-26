export type SharedTimestampParts = {
    isToday: boolean;
    time: string;
    dateTimeLabel: string;
};

/**
 * Formats a share/activity timestamp for display.
 * Callers own i18n for the "today" label using `time` when `isToday` is true.
 */
export function formatSharedTimestamp(
    date: Date,
    locale: string,
    now: Date = new Date()
): SharedTimestampParts {
    const isToday =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();

    const time = date.toLocaleTimeString(locale, {
        hour: "numeric",
        minute: "2-digit",
    });

    const dateTimeLabel = date.toLocaleString(locale, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

    return { isToday, time, dateTimeLabel };
}

/**
 * Formats a credential status timestamp as DD/MM/YY hh:mmAM/PM in local time.
 * Fractional seconds beyond milliseconds are trimmed so timestamps such as
 * 2026-11-15T12:50:05.908173200Z still parse.
 */
export function formatLastCheckedAt(value: string): string {
    const normalized = value.replace(/(\.\d{3})\d+/, "$1");
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const period = date.getHours() >= 12 ? "PM" : "AM";
    const hour12 = date.getHours() % 12 || 12;
    const hours = String(hour12).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}${period}`;
}

/**
 * Preview timestamp, for example "20 October 2025, 06:30PM".
 * English uses day-month-year. Other languages use that locale's long date.
 */
export function formatPreviewLastChecked(value: string, locale: string): string {
    const normalized = value.replace(/(\.\d{3})\d+/, "$1");
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const dateLocale = locale.toLowerCase().startsWith("en") ? "en-GB" : locale;
    const datePart = date.toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const period = date.getHours() >= 12 ? "PM" : "AM";
    const hour12 = date.getHours() % 12 || 12;
    const hours = String(hour12).padStart(2, "0");

    return `${datePart}, ${hours}:${minutes}${period}`;
}
