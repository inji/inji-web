import {
    standardizeError,
    logError,
    withErrorHandling,
    ERROR_TYPES,
    StandardError,
    ErrorOptions,
} from '../../utils/errorHandling';
import {reportApplicationError} from '../../utils/logger';

jest.mock('../../utils/logger', () => ({
    reportApplicationError: jest.fn(),
}));

const mockReportApplicationError = reportApplicationError as jest.MockedFunction<typeof reportApplicationError>;

describe('errorHandling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('standardizeError', () => {
        it('should handle HTTP error with known status code', () => {
            const error = {
                response: {
                    status: 404,
                    data: { message: 'Not found' },
                },
            };

            const result = standardizeError(error, { context: 'testContext' });

            expect(result.code).toBe(ERROR_TYPES.API_NOT_FOUND);
            expect(result.originalError).toBe(error);
        });

        it('should handle HTTP error with unknown status code (4xx)', () => {
            const error = {
                response: {
                    status: 418,
                    data: { message: 'I am a teapot' },
                },
            };

            const result = standardizeError(error);

            expect(result.code).toBe(ERROR_TYPES.API_CLIENT);
        });

        it('should handle HTTP error with unknown status code (5xx)', () => {
            const error = {
                response: {
                    status: 501,
                    data: { message: 'Not implemented' },
                },
            };

            const result = standardizeError(error);

            expect(result.code).toBe(ERROR_TYPES.API_SERVER);
        });

        it('should handle network error', () => {
            const error = {
                code: 'NETWORK_ERROR',
                message: 'Network request failed',
            };

            const result = standardizeError(error);

            expect(result.code).toBe(ERROR_TYPES.API_NETWORK);
            expect(result.originalError).toBe(error);
        });

        it('should handle network error from message', () => {
            const error = {
                message: 'Network Error occurred',
            };

            const result = standardizeError(error);

            expect(result.code).toBe(ERROR_TYPES.API_NETWORK);
        });

        it('should handle timeout error', () => {
            const error = {
                code: 'TIMEOUT',
                message: 'Request timed out',
            };

            const result = standardizeError(error);

            expect(result.code).toBe(ERROR_TYPES.API_TIMEOUT);
            expect(result.originalError).toBe(error);
        });

        it('should handle timeout error from message', () => {
            const error = {
                message: 'Request timeout occurred',
            };

            const result = standardizeError(error);

            expect(result.code).toBe(ERROR_TYPES.API_TIMEOUT);
        });

        it('should handle wallet error', () => {
            const error = {
                message: 'Wallet ID not available in storage',
            };

            const result = standardizeError(error);

            expect(result.code).toBe(ERROR_TYPES.WALLET_NOT_AVAILABLE);
            expect(result.originalError).toBe(error);
        });

        it('should handle credentials error', () => {
            const error = {
                message: 'No matching credentials found for request',
            };

            const result = standardizeError(error);

            expect(result.code).toBe(ERROR_TYPES.CREDENTIALS_NOT_FOUND);
            expect(result.originalError).toBe(error);
        });

        it('should handle error with message', () => {
            const error = {
                message: 'Custom error message',
            };

            const result = standardizeError(error);

            expect(result.code).toBe(ERROR_TYPES.UNKNOWN);
            expect(result.originalError).toBe(error);
        });

        it('should handle unknown error', () => {
            const error = {};

            const result = standardizeError(error);

            expect(result.code).toBe(ERROR_TYPES.UNKNOWN);
            expect(result.originalError).toBe(error);
        });

        it('should handle HTTP status codes with specific mappings', () => {
            const statusCodes = [
                { status: 400, expected: ERROR_TYPES.API_CLIENT },
                { status: 401, expected: ERROR_TYPES.API_UNAUTHORIZED },
                { status: 404, expected: ERROR_TYPES.API_NOT_FOUND },
                { status: 500, expected: ERROR_TYPES.API_SERVER },
            ];

            statusCodes.forEach(({ status, expected }) => {
                const error = { response: { status } };
                const result = standardizeError(error);
                expect(result.code).toBe(expected);
            });
        });

        it('should fallback unmapped 4xx codes to API_CLIENT', () => {
            const error = { response: { status: 403 } };
            const result = standardizeError(error);
            expect(result.code).toBe(ERROR_TYPES.API_CLIENT);
        });

        it('should fallback unmapped 5xx codes to API_SERVER', () => {
            const error = { response: { status: 502 } };
            const result = standardizeError(error);
            expect(result.code).toBe(ERROR_TYPES.API_SERVER);
        });

        it('should preserve original error', () => {
            const error = {
                response: {
                    status: 400,
                    data: { message: 'Custom response message' },
                },
            };

            const result = standardizeError(error);

            expect(result.code).toBe(ERROR_TYPES.API_CLIENT);
            expect(result.originalError).toBe(error);
        });
    });

    describe('logError', () => {
        it('should log error by default', () => {
            const originalError = new Error('Test error');
            const error: StandardError = {
                code: ERROR_TYPES.API_CLIENT,
                originalError,
            };

            logError(error, { context: 'testContext' });

            expect(mockReportApplicationError).toHaveBeenCalledTimes(1);
            expect(mockReportApplicationError).toHaveBeenCalledWith({
                code: ERROR_TYPES.API_CLIENT,
                message: 'Test error',
                context: 'testContext',
                timestamp: expect.any(String),
            });
        });

        it('should not log when logError is false', () => {
            const error: StandardError = {
                code: ERROR_TYPES.API_CLIENT,
            };

            logError(error, { logError: false });

            expect(mockReportApplicationError).not.toHaveBeenCalled();
        });

        it('should include context in log data', () => {
            const originalError = new Error('Server error');
            const error: StandardError = {
                code: ERROR_TYPES.API_SERVER,
                originalError,
            };

            logError(error, { context: 'apiCall' });

            expect(mockReportApplicationError).toHaveBeenCalledWith({
                code: ERROR_TYPES.API_SERVER,
                message: 'Server error',
                context: 'apiCall',
                timestamp: expect.any(String),
            });
        });

        it('should log with sanitized metadata only', () => {
            const originalError = new Error('Original error');
            (originalError as Error & {response?: {data?: {access_token?: string}}}).response = {
                data: {access_token: "secret-token"}
            };
            const error: StandardError = {
                code: ERROR_TYPES.UNKNOWN,
                originalError,
            };

            logError(error, {context: "credentialIssuance"});

            expect(mockReportApplicationError).toHaveBeenCalledTimes(1);
            expect(mockReportApplicationError).toHaveBeenCalledWith({
                code: ERROR_TYPES.UNKNOWN,
                message: "Original error",
                context: "credentialIssuance",
                timestamp: expect.any(String)
            });
            expect(JSON.stringify(mockReportApplicationError.mock.calls[0])).not.toContain("secret-token");
        });
    });

    describe('withErrorHandling', () => {
        it('should return data on successful async function', async () => {
            const asyncFn = jest.fn().mockResolvedValue({ data: 'success' });

            const result = await withErrorHandling(asyncFn);

            expect(result.data).toEqual({ data: 'success' });
            expect(result.error).toBeUndefined();
            expect(asyncFn).toHaveBeenCalled();
        });

        it('should return error on failed async function', async () => {
            const error = new Error('Test error');
            const asyncFn = jest.fn().mockRejectedValue(error);

            const result = await withErrorHandling(asyncFn);

            expect(result.data).toBeUndefined();
            expect(result.error).toBeDefined();
            expect(result.error?.code).toBe(ERROR_TYPES.UNKNOWN);
            expect(result.error?.originalError).toBe(error);
        });

        it('should log error by default', async () => {
            const error = new Error('Test error');
            const asyncFn = jest.fn().mockRejectedValue(error);

            await withErrorHandling(asyncFn);

            expect(mockReportApplicationError).toHaveBeenCalled();
        });

        it('should not log error when logError is false', async () => {
            const error = new Error('Test error');
            const asyncFn = jest.fn().mockRejectedValue(error);

            await withErrorHandling(asyncFn, { logError: false });

            expect(mockReportApplicationError).not.toHaveBeenCalled();
        });

        it('should standardize HTTP errors', async () => {
            const error = {
                response: {
                    status: 404,
                    data: { message: 'Not found' },
                },
            };
            const asyncFn = jest.fn().mockRejectedValue(error);

            const result = await withErrorHandling(asyncFn);

            expect(result.error?.code).toBe(ERROR_TYPES.API_NOT_FOUND);
        });

        it('should handle complex async function', async () => {
            const asyncFn = jest.fn().mockImplementation(async () => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                return { success: true, data: { id: 1 } };
            });

            const result = await withErrorHandling(asyncFn);

            expect(result.data).toEqual({ success: true, data: { id: 1 } });
            expect(result.error).toBeUndefined();
        });
    });
});

