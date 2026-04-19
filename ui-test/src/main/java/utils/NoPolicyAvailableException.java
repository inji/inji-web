package utils;

/**
 * Thrown by BaseTest when a {@code @NeedsPolicy} scenario cannot acquire a free Policy.
 * Using a distinct exception (not SkipException) lets TestNG's IRetryAnalyzer
 * detect it and re-queue the scenario once a Policy becomes available.
 */
public class NoPolicyAvailableException extends RuntimeException {
    public NoPolicyAvailableException(String message) {
        super(message);
    }
}