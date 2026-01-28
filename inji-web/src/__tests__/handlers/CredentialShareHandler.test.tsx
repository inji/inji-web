import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import { CredentialShareHandler } from "../../handlers/CredentialShareHandler";
import { useApiErrorHandler } from "../../hooks/useApiErrorHandler";

const mockFetchData = jest.fn();
jest.mock("../../hooks/useApi", () => ({
    useApi: () => ({ fetchData: mockFetchData }),
}));

jest.mock("../../hooks/useApiErrorHandler");
const mockUseApiErrorHandler = useApiErrorHandler as jest.Mock;

jest.mock("../../modals/LoaderModal", () => ({
    LoaderModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="modal-loader-card" /> : null,
}));

jest.mock("../../modals/ErrorCard", () => ({
    ErrorCard: ({ isOpen, onClose, onRetry, isRetrying, title, description, testId }: any) => {
        if (!isOpen) return null;
        const isRetryable = !!onRetry;
        const button = isRetryable
            ? <button onClick={onRetry} disabled={isRetrying}>Retry</button>
            : (onClose ? <button onClick={onClose}>Close</button> : null);

        return (
            <div data-testid={testId}>
                {title}: {description}
                {button}
            </div>
        );
    }
}));

jest.mock("../../modals/CredentialShareSuccessModal", () => ({
    CredentialShareSuccessModal: ({ isOpen, returnUrl, onClose }: { isOpen: boolean; returnUrl?: string; onClose?: () => void }) =>
        isOpen ? (
            <div data-testid="success-modal">
                <div data-testid="modal-return-url">{returnUrl || 'no-url'}</div>
                {onClose && <button data-testid="modal-close-btn" onClick={onClose}>Close</button>}
            </div>
        ) : null,
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key === 'message' ? 'Sharing credentials...' : key,
    }),
}));

describe("CredentialShareHandler", () => {
    const defaultProps = {
        verifierName: "TestVerifier",
        returnUrl: "https://verifier.example.com/callback",
        selectedCredentials: [
            {
                credentialId: "cred-1",
                credentialTypeDisplayName: "Test Credential",
                credentialTypeLogo: "https://example.com/logo.png",
                format: "jwt",
            },
        ],
        presentationId: "pres-123",
        onClose: jest.fn(),
    };

    const mockHandleApiError = jest.fn();
    const mockHandleCloseErrorCard = jest.fn();
    const mockOnRetry = jest.fn();
    let mockErrorHandlerReturnValue: ReturnType<typeof useApiErrorHandler>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockErrorHandlerReturnValue = {
            showError: false,
            isRetrying: false,
            errorTitle: undefined,
            errorDescription: undefined,
            onRetry: mockOnRetry,
            onClose: mockHandleCloseErrorCard,
            handleApiError: mockHandleApiError,
            clearError: jest.fn(),
        };
        mockUseApiErrorHandler.mockReturnValue(mockErrorHandlerReturnValue);
    });

    it("shows loading modal initially", () => {
        mockFetchData.mockResolvedValueOnce({ ok: () => true });
        render(<CredentialShareHandler {...defaultProps} />);
        expect(screen.getByTestId("modal-loader-card")).toBeInTheDocument();
    });

    it("shows success modal when API call succeeds", async () => {
        mockFetchData.mockResolvedValueOnce({ ok: () => true });
        render(<CredentialShareHandler {...defaultProps} />);
        await waitFor(() =>
            expect(screen.getByTestId("success-modal")).toBeInTheDocument()
        );
        expect(screen.queryByTestId("modal-loader-card")).not.toBeInTheDocument();
    });

    it("shows error card when API call fails (response error)", async () => {
        const errorResponse = {
            ok: () => false,
            error: { message: "Failed to submit presentation" },
        };
        mockFetchData.mockResolvedValueOnce(errorResponse);

        mockUseApiErrorHandler.mockImplementation(() => {
            if (mockHandleApiError.mock.calls.length > 0) {
                return {
                    ...mockErrorHandlerReturnValue,
                    showError: true,
                    errorTitle: 'API Error',
                    errorDescription: 'Failed to submit presentation',
                    onRetry: undefined,
                };
            }
            return mockErrorHandlerReturnValue;
        });

        const { rerender } = render(<CredentialShareHandler {...defaultProps} />);
        await waitFor(() => expect(mockHandleApiError).toHaveBeenCalled());
        rerender(<CredentialShareHandler {...defaultProps} />);
        await waitFor(() =>
            expect(screen.getByTestId("modal-error-card")).toHaveTextContent(
                "Failed to submit presentation"
            )
        );
        expect(screen.getByText("Close")).toBeInTheDocument();
    });

    it("shows error card when fetch throws (network/unexpected error)", async () => {
        const networkError = new Error("Network error");
        mockFetchData.mockRejectedValueOnce(networkError);

        mockUseApiErrorHandler.mockImplementation(() => {
            if (mockHandleApiError.mock.calls.length > 0) {
                return {
                    ...mockErrorHandlerReturnValue,
                    showError: true,
                    errorTitle: 'Network Error',
                    errorDescription: 'Network error',
                    onRetry: undefined,
                };
            }
            return mockErrorHandlerReturnValue;
        });

        const { rerender } = render(<CredentialShareHandler {...defaultProps} />);
        await waitFor(() => expect(mockHandleApiError).toHaveBeenCalled());
        rerender(<CredentialShareHandler {...defaultProps} />);
        await waitFor(() =>
            expect(screen.getByTestId("modal-error-card")).toHaveTextContent(
                "Network error"
            )
        );
        expect(screen.getByText("Close")).toBeInTheDocument();
    });

    it("shows ErrorCard with Retry button when API fails with a retryable error", async () => {
        const retryableErrorResponse = {
            ok: () => false,
            error: { message: "Server busy, please retry" },
        };
        mockFetchData.mockResolvedValueOnce(retryableErrorResponse);

        mockUseApiErrorHandler.mockImplementation(() => {
            if (mockHandleApiError.mock.calls.length > 0) {
                return {
                    ...mockErrorHandlerReturnValue,
                    showError: true,
                    errorTitle: 'Temporary Issue',
                    errorDescription: 'Server busy, please retry',
                    onRetry: mockOnRetry,
                    onClose: undefined,
                };
            }
            return mockErrorHandlerReturnValue;
        });

        const { rerender } = render(<CredentialShareHandler {...defaultProps} />);
        await waitFor(() => expect(mockHandleApiError).toHaveBeenCalled());
        rerender(<CredentialShareHandler {...defaultProps} />);
        await waitFor(() => {
            const retryCard = screen.getByTestId("modal-error-card");
            expect(retryCard).toBeInTheDocument();
            expect(retryCard).toHaveTextContent("Temporary Issue: Server busy, please retry");
            expect(screen.getByText("Retry")).toBeInTheDocument();
        });
        expect(screen.queryByTestId("success-modal")).not.toBeInTheDocument();
    });

    it("calls onRetry from hook when Retry button is clicked", async () => {
        const retryableErrorResponse = { ok: () => false, error: { message: "Retry me" } };
        mockFetchData.mockResolvedValueOnce(retryableErrorResponse);

        mockUseApiErrorHandler.mockImplementation(() => {
            if (mockHandleApiError.mock.calls.length > 0) {
                return {
                    ...mockErrorHandlerReturnValue,
                    showError: true,
                    onRetry: mockOnRetry,
                    onClose: undefined
                };
            }
            return mockErrorHandlerReturnValue;
        });

        const { rerender } = render(<CredentialShareHandler {...defaultProps} />);
        await waitFor(() => expect(mockHandleApiError).toHaveBeenCalled());
        rerender(<CredentialShareHandler {...defaultProps} />);
        await waitFor(() => {
            const retryButton = screen.getByRole('button', { name: 'Retry' });
            expect(retryButton).toBeInTheDocument();
            fireEvent.click(retryButton);
        });
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it("shows LoaderModal when isRetrying is true", async () => {
        mockErrorHandlerReturnValue = {
            ...mockErrorHandlerReturnValue,
            isRetrying: true,
        };
        mockUseApiErrorHandler.mockReturnValue(mockErrorHandlerReturnValue);
        render(<CredentialShareHandler {...defaultProps} />);
        expect(screen.getByTestId("modal-loader-card")).toBeInTheDocument();
        expect(screen.queryByTestId("success-modal")).not.toBeInTheDocument();
        expect(screen.queryByTestId("modal-error-card")).not.toBeInTheDocument();
    });

    describe("redirectUri handling", () => {
        beforeEach(() => {
            // Mock window.location.href
            delete (window as any).location;
            (window as any).location = { href: '' };
        });

        it("uses redirectUri from API response when available", async () => {
            const apiRedirectUri = "https://api-response.com/redirect";
            mockFetchData.mockResolvedValueOnce({
                ok: () => true,
                data: { redirectUri: apiRedirectUri },
            });

            render(<CredentialShareHandler {...defaultProps} />);

            await waitFor(() =>
                expect(screen.getByTestId("success-modal")).toBeInTheDocument()
            );

            const modalReturnUrl = screen.getByTestId("modal-return-url");
            expect(modalReturnUrl).toHaveTextContent(apiRedirectUri);
        });

        it("falls back to returnUrl prop when redirectUri is not in API response", async () => {
            mockFetchData.mockResolvedValueOnce({
                ok: () => true,
                data: {}, // No redirectUri in response
            });

            render(<CredentialShareHandler {...defaultProps} />);

            await waitFor(() =>
                expect(screen.getByTestId("success-modal")).toBeInTheDocument()
            );

            const modalReturnUrl = screen.getByTestId("modal-return-url");
            expect(modalReturnUrl).toHaveTextContent(defaultProps.returnUrl);
        });

        it("falls back to returnUrl prop when redirectUri is null in API response", async () => {
            mockFetchData.mockResolvedValueOnce({
                ok: () => true,
                data: { redirectUri: null },
            });

            render(<CredentialShareHandler {...defaultProps} />);

            await waitFor(() =>
                expect(screen.getByTestId("success-modal")).toBeInTheDocument()
            );

            const modalReturnUrl = screen.getByTestId("modal-return-url");
            expect(modalReturnUrl).toHaveTextContent(defaultProps.returnUrl);
        });

        it("calls onClose when both redirectUri and returnUrl are empty", async () => {
            const onCloseMock = jest.fn();
            const propsWithoutReturnUrl = {
                ...defaultProps,
                returnUrl: "",
                onClose: onCloseMock,
            };

            mockFetchData.mockResolvedValueOnce({
                ok: () => true,
                data: {}, // No redirectUri
            });

            render(<CredentialShareHandler {...propsWithoutReturnUrl} />);

            await waitFor(() =>
                expect(screen.getByTestId("success-modal")).toBeInTheDocument()
            );

            const closeButton = screen.getByTestId("modal-close-btn");
            fireEvent.click(closeButton);

            expect(onCloseMock).toHaveBeenCalledTimes(1);
        });

        it("redirects to redirectUri from API response when modal close is clicked", async () => {
            const apiRedirectUri = "https://api-response.com/redirect";
            mockFetchData.mockResolvedValueOnce({
                ok: () => true,
                data: { redirectUri: apiRedirectUri },
            });

            render(<CredentialShareHandler {...defaultProps} />);

            await waitFor(() =>
                expect(screen.getByTestId("success-modal")).toBeInTheDocument()
            );

            const closeButton = screen.getByTestId("modal-close-btn");
            fireEvent.click(closeButton);

            expect(window.location.href).toBe(apiRedirectUri);
        });

        it("redirects to returnUrl prop when redirectUri is not available and modal close is clicked", async () => {
            mockFetchData.mockResolvedValueOnce({
                ok: () => true,
                data: {}, // No redirectUri
            });

            render(<CredentialShareHandler {...defaultProps} />);

            await waitFor(() =>
                expect(screen.getByTestId("success-modal")).toBeInTheDocument()
            );

            const closeButton = screen.getByTestId("modal-close-btn");
            fireEvent.click(closeButton);

            expect(window.location.href).toBe(defaultProps.returnUrl);
        });

        it("extracts redirectUri from API response on retry success", async () => {
            const retryableErrorResponse = {
                ok: () => false,
                error: { message: "Retry me" },
            };
            const successResponseWithRedirectUri = {
                ok: () => true,
                data: { redirectUri: "https://retry-success.com/redirect" },
            };

            // First call fails
            mockFetchData.mockResolvedValueOnce(retryableErrorResponse);

            // Store the retry callback and success callback
            let storedRetryCallback: (() => Promise<any>) | null = null;
            let storedRetrySuccessCallback: ((response: any) => void) | null = null;

            mockUseApiErrorHandler.mockImplementation(() => {
                if (mockHandleApiError.mock.calls.length > 0) {
                    // Extract the retry callback and success callback from handleApiError call
                    const lastCall = mockHandleApiError.mock.calls[mockHandleApiError.mock.calls.length - 1];
                    if (lastCall && lastCall.length >= 3) {
                        storedRetryCallback = lastCall[2]; // retryFn is the 3rd argument
                        storedRetrySuccessCallback = lastCall[3]; // onRetrySuccess is the 4th argument
                    }

                    return {
                        ...mockErrorHandlerReturnValue,
                        showError: true,
                        onRetry: async () => {
                            // Simulate retry: call the retry function which triggers API call
                            if (storedRetryCallback) {
                                // Mock the retry API call to succeed
                                mockFetchData.mockResolvedValueOnce(successResponseWithRedirectUri);
                                const response = await storedRetryCallback();
                                // Call the success callback if retry succeeded
                                if (response && response.ok() && storedRetrySuccessCallback) {
                                    storedRetrySuccessCallback(response);
                                }
                            }
                        },
                        onClose: undefined,
                    };
                }
                return mockErrorHandlerReturnValue;
            });

            render(<CredentialShareHandler {...defaultProps} />);
            await waitFor(() => expect(mockHandleApiError).toHaveBeenCalled());

            // Wait for error card to appear
            await waitFor(() =>
                expect(screen.getByTestId("modal-error-card")).toBeInTheDocument()
            );

            // Trigger retry
            const retryButton = screen.getByRole('button', { name: 'Retry' });
            fireEvent.click(retryButton);

            // Wait for success modal with redirectUri from retry
            await waitFor(() =>
                expect(screen.getByTestId("success-modal")).toBeInTheDocument(),
                { timeout: 3000 }
            );

            const modalReturnUrl = screen.getByTestId("modal-return-url");
            expect(modalReturnUrl).toHaveTextContent("https://retry-success.com/redirect");
        });

        it("prioritizes redirectUri from API response over returnUrl prop", async () => {
            const apiRedirectUri = "https://api-response.com/redirect";
            const propReturnUrl = "https://prop-url.com/callback";

            mockFetchData.mockResolvedValueOnce({
                ok: () => true,
                data: { redirectUri: apiRedirectUri },
            });

            const propsWithDifferentReturnUrl = {
                ...defaultProps,
                returnUrl: propReturnUrl,
            };

            render(<CredentialShareHandler {...propsWithDifferentReturnUrl} />);

            await waitFor(() =>
                expect(screen.getByTestId("success-modal")).toBeInTheDocument()
            );

            const modalReturnUrl = screen.getByTestId("modal-return-url");
            expect(modalReturnUrl).toHaveTextContent(apiRedirectUri);
            expect(modalReturnUrl).not.toHaveTextContent(propReturnUrl);
        });

        it("passes onClose handler to success modal", async () => {
            const onCloseMock = jest.fn();
            const propsWithOnClose = {
                ...defaultProps,
                onClose: onCloseMock,
            };

            mockFetchData.mockResolvedValueOnce({
                ok: () => true,
                data: {},
            });

            render(<CredentialShareHandler {...propsWithOnClose} />);

            await waitFor(() =>
                expect(screen.getByTestId("success-modal")).toBeInTheDocument()
            );

            const closeButton = screen.getByTestId("modal-close-btn");
            expect(closeButton).toBeInTheDocument();
        });
    });
});
