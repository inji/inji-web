package utils;

/**
 * Thrown by BaseTest when a {@code @NeedsUIN} scenario cannot acquire a free UIN.
 * Using a distinct exception (not SkipException) lets TestNG's IRetryAnalyzer
 * detect it and re-queue the scenario once a UIN becomes available.
 */
public class NoUINAvailableException extends RuntimeException {
    public NoUINAvailableException(String message) {
        super(message);
    }
}