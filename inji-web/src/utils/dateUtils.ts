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
