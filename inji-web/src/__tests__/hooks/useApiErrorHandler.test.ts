import { renderHook, act, waitFor } from '@testing-library/react';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { ERROR_TYPES } from '../../utils/errorHandling';
import * as errorHandling from '../../utils/errorHandling';

// Mock error handling utilities
jest.mock('../../utils/errorHandling', () => ({
    ...jest.requireActual('../../utils/errorHandling'),
    standardizeError: jest.fn(),
    logError: jest.fn(),
}));

// Mock i18n
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'ErrorCard.technicalTitle': 'Technical Error',
                'ErrorCard.technicalDescription': 'A technical error occurred',
                'ErrorCard.defaultTitle': 'Error',
                'ErrorCard.defaultDescription': 'An error occurred',
                'RetryCard.defaultTitle': 'Retry',
                'RetryCard.defaultDescription': 'Please retry the operation',
            };
            return translations[key] || key;
        },
    }),
}));

describe('useApiErrorHandler', () => {
    const mockStandardizeError = errorHandling.standardizeError as jest.MockedFunction<typeof errorHandling.standardizeError>;
    const mockLogError = errorHandling.logError as jest.MockedFunction<typeof errorHandling.logError>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Initial state', () => {
        it('should initialize with correct default values', () => {
            const { result } = renderHook(() => useApiErrorHandler());

            expect(result.current.showError).toBe(false);
            expect(result.current.isRetrying).toBe(false);
            expect(result.current.errorTitle).toBeUndefined();
            expect(result.current.errorDescription).toBeUndefined();
            expect(result.current.onRetry).toBeUndefined();
            expect(result.current.onClose).toBeDefined();
        });
    });

    describe('handleApiError - Technical errors', () => {
        it('should handle API_NETWORK error as technical error', () => {
            const error = new Error('Network error');
            mockStandardizeError.mockReturnValue({
                code: ERROR_TYPES.API_NETWORK,
                message: 'Network connection error',
                timestamp: new Date(),
            });

            const { result } = renderHook(() => useApiErrorHandler());

            act(() => {
                result.current.handleApiError(error, 'testContext');
            });

            expect(result.current.showError).toBe(true);
            expect(result.current.errorTitle).toBe('Technical Error');
            expect(result.current.errorDescription).toBe('A technical error occurred');
            expect(result.current.onRetry).toBeUndefined();
            expect(result.current.onClose).toBeDefined();
        });

        it('should handle API_UNAUTHORIZED error as technical error', () => {
            const error = new Error('Unauthorized');
            mockStandardizeError.mockReturnValue({
                code: ERROR_TYPES.API_UNAUTHORIZED,
                message: 'Unauthorized access',
                timestamp: new Date(),
            });

            const { result } = renderHook(() => useApiErrorHandler());

            act(() => {
                result.current.handleApiError(error, 'testContext');
            });

            expect(result.current.showError).toBe(true);
            expect(result.current.errorTitle).toBe('Technical Error');
            expect(result.current.onRetry).toBeUndefined();
        });

        it('should handle API_SERVER error as technical error', () => {
            const error = new Error('Server error');
            mockStandardizeError.mockReturnValue({
                code: ERROR_TYPES.API_SERVER,
                message: 'Server error occurred',
                timestamp: new Date(),
            });

            const { result } = renderHook(() => useApiErrorHandler());

            act(() => {
                result.current.handleApiError(error, 'testContext');
            });

            expect(result.current.showError).toBe(true);
            expect(result.current.errorTitle).toBe('Technical Error');
            expect(result.current.onRetry).toBeUndefined();
        });
    });

    describe('handleApiError - Retryable errors', () => {
        it('should handle retryable error with retry function', () => {
            const error = new Error('Retryable error');
            const mockRetryFn = jest.fn().mockResolvedValue({ ok: () => true });
            
            mockStandardizeError.mockReturnValue({
                code: ERROR_TYPES.API_CLIENT,
                message: 'Client error',
                timestamp: new Date(),
            });

            const { result } = renderHook(() => useApiErrorHandler());

            act(() => {
                result.current.handleApiError(error, 'testContext', mockRetryFn);
            });

            expect(result.current.showError).toBe(true);
            expect(result.current.errorTitle).toBe('Retry');
            expect(result.current.errorDescription).toBe('Please retry the operation');
            expect(result.current.onRetry).toBeDefined();
            expect(result.current.onClose).toBeUndefined();
        });

        it('should handle retryable error without retry function', () => {
            const error = new Error('Retryable error');
            
            mockStandardizeError.mockReturnValue({
                code: ERROR_TYPES.API_CLIENT,
                message: 'Client error',
                timestamp: new Date(),
            });

            const { result } = renderHook(() => useApiErrorHandler());

            act(() => {
                result.current.handleApiError(error, 'testContext');
            });

            expect(result.current.showError).toBe(true);
            expect(result.current.errorTitle).toBe('Error');
            expect(result.current.errorDescription).toBe('An error occurred');
            expect(result.current.onRetry).toBeUndefined();
            expect(result.current.onClose).toBeDefined();
        });
    });

    describe('handleApiError - Non-retryable errors', () => {
        it('should handle non-retryable error', () => {
            const error = new Error('Non-retryable error');
            
            mockStandardizeError.mockReturnValue({
                code: ERROR_TYPES.UNKNOWN,
                message: 'Unknown error',
                timestamp: new Date(),
            });

            const { result } = renderHook(() => useApiErrorHandler());

            act(() => {
                result.current.handleApiError(error, 'testContext');
            });

            expect(result.current.showError).toBe(true);
            expect(result.current.errorTitle).toBe('Error');
            expect(result.current.errorDescription).toBe('An error occurred');
            expect(result.current.onRetry).toBeUndefined();
            expect(result.current.onClose).toBeDefined();
        });
    });

    describe('Custom retry configuration', () => {
        it('should use custom retryable error codes', () => {
            const error = new Error('Custom error');
            const mockRetryFn = jest.fn().mockResolvedValue({ ok: () => true });
            
            mockStandardizeError.mockReturnValue({
                code: ERROR_TYPES.UNKNOWN,
                message: 'Unknown error',
                timestamp: new Date(),
            });

            const { result } = renderHook(() => 
                useApiErrorHandler({ 
                    errorCodesToRetry: [ERROR_TYPES.UNKNOWN] 
                })
            );

            act(() => {
                result.current.handleApiError(error, 'testContext', mockRetryFn);
            });

            expect(result.current.onRetry).toBeDefined();
        });

        it('should call onClose callback when provided', () => {
            const mockOnClose = jest.fn();
            const { result } = renderHook(() => 
                useApiErrorHandler({ onClose: mockOnClose })
            );

            const error = new Error('Test error');
            mockStandardizeError.mockReturnValue({
                code: ERROR_TYPES.API_CLIENT,
                message: 'Client error',
                timestamp: new Date(),
            });

            act(() => {
                result.current.handleApiError(error, 'testContext');
            });

            act(() => {
                result.current.onClose?.();
            });

            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should work correctly when onClose callback is not provided', () => {
            const { result } = renderHook(() => useApiErrorHandler());

            const error = new Error('Test error');
            mockStandardizeError.mockReturnValue({
                code: ERROR_TYPES.API_CLIENT,
                message: 'Client error',
                timestamp: new Date(),
            });

            act(() => {
                result.current.handleApiError(error, 'testContext');
            });

            expect(result.current.showError).toBe(true);
            expect(result.current.onClose).toBeDefined();

            // Should not throw when onClose is called without callback
            act(() => {
                result.current.onClose?.();
            });

            expect(result.current.showError).toBe(false);
        });
    });

    describe('Retry functionality', () => {
        it('should successfully retry and call onRetrySuccess', async () => {
            const error = new Error('Retryable error');
            const responseData = { 
                ok: () => true,
                data: { success: true }
            };
            const mockRetryFn = jest.fn().mockResolvedValue(responseData);
            const mockOnRetrySuccess = jest.fn();
            
            mockStandardizeError.mockReturnValue({
                code: ERROR_TYPES.API_CLIENT,
                message: 'Client error',
                timestamp: new Date(),
            });

            const { result } = renderHook(() => useApiErrorHandler());

            act(() => {
                result.current.handleApiError(
                    error, 
                    'testContext', 
                    mockRetryFn,
                    mockOnRetrySuccess
                );
            });

            expect(result.current.isRetrying).toBe(false);

            await act(async () => {
                await result.current.onRetry?.();
            });

            await waitFor(() => {
                expect(mockRetryFn).toHaveBeenCalled();
                expect(mockOnRetrySuccess).toHaveBeenCalledWith(responseData);
                expect(result.current.showError).toBe(false);
                expect(result.current.isRetrying).toBe(false);
            });
        });

        it('should handle retry failure and show error again', async () => {
            const error = new Error('Retryable error');
            const retryError = new Error('Retry failed');
            const mockRetryFn = jest.fn().mockResolvedValue({ 
                ok: () => false,
                error: retryError
            });
            
            mockStandardizeError
                .mockReturnValueOnce({
                    code: ERROR_TYPES.API_CLIENT,
                    message: 'Client error',
                    timestamp: new Date(),
                })
                .mockReturnValueOnce({
                    code: ERROR_TYPES.API_SERVER,
                    message: 'Server error',
                    timestamp: new Date(),
                });

            const { result } = renderHook(() => useApiErrorHandler());

            act(() => {
                result.current.handleApiError(error, 'testContext', mockRetryFn);
            });

            await act(async () => {
                await result.current.onRetry?.();
            });

            await waitFor(() => {
                expect(result.current.showError).toBe(true);
                expect(result.current.isRetrying).toBe(false);
            });
        });

        it('should handle retry failure when response has no error property', async () => {
            const error = new Error('Retryable error');
            const mockRetryFn = jest.fn().mockResolvedValue({ 
                ok: () => false
                // No error property
            });
            
            mockStandardizeError
                .mockReturnValueOnce({
                    code: ERROR_TYPES.API_CLIENT,
                    message: 'Client error',
                    timestamp: new Date(),
                })
                .mockReturnValueOnce({
                    code: ERROR_TYPES.UNKNOWN,
                    message: 'Retry API failure',
                    timestamp: new Date(),
                });

            const { result } = renderHook(() => useApiErrorHandler());

            act(() => {
                result.current.handleApiError(error, 'testContext', mockRetryFn);
            });

            await act(async () => {
                await result.current.onRetry?.();
            });

            await waitFor(() => {
                expect(result.current.showError).toBe(true);
                expect(result.current.isRetrying).toBe(false);
            });
        });

        it('should handle retry exception', async () => {
            const error = new Error('Retryable error');
            const retryException = new Error('Retry exception');
            const mockRetryFn = jest.fn().mockRejectedValue(retryException);
            
            mockStandardizeError
                .mockReturnValueOnce({
                    code: ERROR_TYPES.API_CLIENT,
                    message: 'Client error',
                    timestamp: new Date(),
                })
                .mockReturnValueOnce({
                    code: ERROR_TYPES.UNKNOWN,
                    message: 'Unknown error',
                    timestamp: new Date(),
                });

            const { result } = renderHook(() => useApiErrorHandler());

            act(() => {
                result.current.handleApiError(error, 'testContext', mockRetryFn);
            });

            await act(async () => {
                await result.current.onRetry?.();
            });

            await waitFor(() => {
                expect(result.current.showError).toBe(true);
                expect(result.current.isRetrying).toBe(false);
            });
        });

        it('should prevent multiple concurrent retries', async () => {
            const error = new Error('Retryable error');
            let resolveRetry: (value: {ok: () => boolean}) => void = () => undefined;
            const mockRetryFn = jest.fn().mockImplementation(() =>
                new Promise((resolve) => {
                    resolveRetry = resolve;
                })
            );

            mockStandardizeError.mockReturnValue({
                code: ERROR_TYPES.API_CLIENT,
                message: 'Client error',
                timestamp: new Date(),
            });

            const { result } = renderHook(() => useApiErrorHandler());

            act(() => {
                result.current.handleApiError(error, 'testContext', mockRetryFn);
            });

            let retry1Promise: Promise<void> | undefined;
            await act(async () => {
                retry1Promise = result.current.onRetry?.();
            });

            expect(result.current.isRetrying).toBe(true);

            const retry2Promise = result.current.onRetry?.();

            await act(async () => {
                resolveRetry({ok: () => true});
                await Promise.all([retry1Promise, retry2Promise]);
            });

            expect(mockRetryFn).toHaveBeenCalledTimes(1);
        });
    });

    describe('clearError', () => {
        it('should clear all error state', () => {
            const error = new Error('Test error');
            mockStandardizeError.mockReturnValue({
                code: ERROR_TYPES.API_CLIENT,
                message: 'Client error',
                timestamp: new Date(),
            });

            const { result } = renderHook(() => useApiErrorHandler());

            act(() => {
                result.current.handleApiError(error, 'testContext');
            });

            expect(result.current.showError).toBe(true);

            act(() => {
                result.current.clearError();
            });

            expect(result.current.showError).toBe(false);
            expect(result.current.errorTitle).toBeUndefined();
            expect(result.current.errorDescription).toBeUndefined();
            expect(result.current.isRetrying).toBe(false);
        });
    });

    describe('Error logging', () => {
        it('should log error when handleApiError is called', () => {
            const error = new Error('Test error');
            const stdError = {
                code: ERROR_TYPES.API_CLIENT,
                message: 'Client error',
                timestamp: new Date(),
            };
            
            mockStandardizeError.mockReturnValue(stdError);

            const { result } = renderHook(() => useApiErrorHandler());

            act(() => {
                result.current.handleApiError(error, 'testContext');
            });

            expect(mockLogError).toHaveBeenCalledWith(stdError, { context: 'testContext' });
        });
    });
});

