/**
 * Standardized Error Handling Utilities
 * Provides consistent error handling patterns across the application
 */

import {reportApplicationError} from "./logger";

export interface StandardError {
    code: string;
    originalError?: any;
}

export interface ErrorOptions {
    context?: string;
    logError?: boolean;
    fallbackMessage?: string;
}

// Internal error types and mappings (not exported as they're only used internally)
export const ERROR_TYPES = {
    API_TIMEOUT: 'API_TIMEOUT',
    API_NETWORK: 'API_NETWORK',
    API_SERVER: 'API_SERVER',
    API_CLIENT: 'API_CLIENT',
    API_UNAUTHORIZED: 'API_UNAUTHORIZED',
    API_NOT_FOUND: 'API_NOT_FOUND',
    WALLET_NOT_AVAILABLE: 'WALLET_NOT_AVAILABLE',
    CREDENTIALS_NOT_FOUND: 'CREDENTIALS_NOT_FOUND',
    UNKNOWN: 'UNKNOWN'
} as const;

const HTTP_STATUS_TO_ERROR_TYPE: Record<number, string> = {
    400: ERROR_TYPES.API_CLIENT,
    401: ERROR_TYPES.API_UNAUTHORIZED,
    404: ERROR_TYPES.API_NOT_FOUND,
    500: ERROR_TYPES.API_SERVER
};

/**
 * Standardizes any error into a StandardError object
 */
export const standardizeError = (
    error: any, 
    options: ErrorOptions = {}
): StandardError => {
    // Determine error type
    let errorType: string = ERROR_TYPES.UNKNOWN;
    
    // Handle different error types
    if (error?.response?.status) {
        // HTTP error
        const status = error.response.status;
        errorType = HTTP_STATUS_TO_ERROR_TYPE[status] || 
                   (status >= 400 && status < 500 ? ERROR_TYPES.API_CLIENT : ERROR_TYPES.API_SERVER);
    } else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
        // Network error
        errorType = ERROR_TYPES.API_NETWORK;
    } else if (error?.code === 'TIMEOUT' || error?.message?.includes('timeout')) {
        // Timeout error
        errorType = ERROR_TYPES.API_TIMEOUT;
    } else if (error?.message?.includes('Wallet ID not available')) {
        // Wallet error
        errorType = ERROR_TYPES.WALLET_NOT_AVAILABLE;
    } else if (error?.message?.includes('No matching credentials')) {
        // Credentials error
        errorType = ERROR_TYPES.CREDENTIALS_NOT_FOUND;
    }
    
    return {
        code: errorType,
        originalError: error
    };
};

/**
 * Logs error with consistent format and sanitized metadata only.
 * Does not write raw error objects (may contain tokens/proofs) to the console.
 */
export const logError = (error: StandardError, options: ErrorOptions = {}): void => {
    if (options.logError === false) return;

    const originalMessage = typeof error.originalError?.message === "string"
        ? error.originalError.message
        : undefined;
    const responseMessage = typeof error.originalError?.response?.data?.message === "string"
        ? error.originalError.response.data.message
        : typeof error.originalError?.response?.data?.error === "string"
            ? error.originalError.response.data.error
            : undefined;

    const message = options.fallbackMessage ||
        responseMessage ||
        originalMessage ||
        "An unexpected error occurred";

    reportApplicationError({
        code: error.code,
        message,
        context: options.context,
        timestamp: new Date().toISOString()
    });
};

/**
 * Standard error handling wrapper for async functions
 */
export const withErrorHandling = async <T>(
    asyncFn: () => Promise<T>,
    options: ErrorOptions = {}
): Promise<{ data?: T; error?: StandardError }> => {
    try {
        const data = await asyncFn();
        return { data };
    } catch (error) {
        const standardError = standardizeError(error, options);
        logError(standardError, options);
        return { error: standardError };
    }
};
