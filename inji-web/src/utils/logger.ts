export type ApplicationErrorLog = {
    code: string;
    message: string;
    context?: string;
    timestamp: string;
};

/**
 * Central application error reporting hook.
 * Accepts sanitized metadata only — never pass raw errors, tokens, or proofs.
 * Does not write to the browser console.
 */
export const reportApplicationError = (payload: ApplicationErrorLog): void => {
    // Integrate approved telemetry/backend reporting here when available.
    void payload;
};
