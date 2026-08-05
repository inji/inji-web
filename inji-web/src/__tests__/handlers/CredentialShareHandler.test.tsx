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

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key === 'message' ? 'Sharing credentials...' : key,
    }),
}));

describe("CredentialShareHandler", () => {
    const mockOnShareSuccess = jest.fn();
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
        onShareSuccess: mockOnShareSuccess,
    };

    const mockHandleApiError = jest.fn();
    const mockHandleCloseErrorCard = jest.fn();
    const mockOnRetry = jest.fn();
    let mockErrorHandlerReturnValue: ReturnType<typeof useApiErrorHandler>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnShareSuccess.mockReset();
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

    it("calls onShareSuccess when API call succeeds", async () => {
        mockFetchData.mockResolvedValueOnce({ ok: () => true });
        render(<CredentialShareHandler {...defaultProps} />);
        await waitFor(() => expect(mockOnShareSuccess).toHaveBeenCalledWith({
            verifierName: "TestVerifier",
            verifierLogo: undefined,
            verifierTrusted: undefined,
            credentials: defaultProps.selectedCredentials,
            returnUrl: defaultProps.returnUrl,
        }));
        expect(screen.queryByTestId("modal-loader-card")).not.toBeInTheDocument();
    });

    it("submits selectedSdClaims with empty array for sd-jwt credential", async () => {
        mockFetchData.mockResolvedValueOnce({ ok: () => true });
        render(
            <CredentialShareHandler
                {...defaultProps}
                selectedCredentials={[
                    {
                        credentialId: "f392fa77-2b24-4bc1-9203-7162fcdaff02",
                        credentialTypeDisplayName: "SD-JWT VC",
                        credentialTypeLogo: "https://example.com/logo.png",
                        format: "dc+sd-jwt",
                    },
                ]}
                selectedSdClaims={{
                    "f392fa77-2b24-4bc1-9203-7162fcdaff02": [],
                }}
            />
        );

        await waitFor(() => expect(mockOnShareSuccess).toHaveBeenCalled());

        expect(mockFetchData).toHaveBeenCalledWith(
            expect.objectContaining({
                body: {
                    selectedCredentials: ["f392fa77-2b24-4bc1-9203-7162fcdaff02"],
                    selectedSdClaims: {
                        "f392fa77-2b24-4bc1-9203-7162fcdaff02": [],
                    },
                },
            })
        );
    });

    it("submits selectedSdClaims in presentation body when provided", async () => {
        mockFetchData.mockResolvedValueOnce({ ok: () => true });
        render(
            <CredentialShareHandler
                {...defaultProps}
                selectedCredentials={[
                    {
                        credentialId: "cred-123",
                        credentialTypeDisplayName: "SD-JWT VC",
                        credentialTypeLogo: "https://example.com/logo.png",
                        format: "dc+sd-jwt",
                    },
                ]}
                selectedSdClaims={{
                    "cred-123": ["$.name", "$.age"],
                }}
            />
        );

        await waitFor(() => expect(mockOnShareSuccess).toHaveBeenCalled());

        expect(mockFetchData).toHaveBeenCalledWith(
            expect.objectContaining({
                body: {
                    selectedCredentials: ["cred-123"],
                    selectedSdClaims: {
                        "cred-123": ["$.name", "$.age"],
                    },
                },
            })
        );
    });

    describe("DCQL submission", () => {
        it("sends selectedCredentials as objects (queryId+selectedCredentialIds) for DCQL presentations", async () => {
            mockFetchData.mockResolvedValueOnce({ ok: () => true });
            render(
                <CredentialShareHandler
                    {...defaultProps}
                    isDcqlPresentation={true}
                    dcqlSelection={{
                        "government-identity": ["vc-pan-uuid"],
                        "age-proof": ["vc-mdl-uuid"],
                    }}
                />
            );

            await waitFor(() => expect(mockOnShareSuccess).toHaveBeenCalled());

            expect(mockFetchData).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: {
                        selectedCredentials: [
                            { queryId: "government-identity", selectedCredentialIds: ["vc-pan-uuid"] },
                            { queryId: "age-proof", selectedCredentialIds: ["vc-mdl-uuid"] },
                        ],
                    },
                })
            );
        });

        it("excludes query slots with no selected credential from DCQL selectedCredentials", async () => {
            mockFetchData.mockResolvedValueOnce({ ok: () => true });
            render(
                <CredentialShareHandler
                    {...defaultProps}
                    isDcqlPresentation={true}
                    dcqlSelection={{
                        "government-identity": ["vc-pan-uuid"],
                        "optional-query": [],
                    }}
                />
            );

            await waitFor(() => expect(mockOnShareSuccess).toHaveBeenCalled());

            expect(mockFetchData).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: {
                        selectedCredentials: [
                            { queryId: "government-identity", selectedCredentialIds: ["vc-pan-uuid"] },
                        ],
                    },
                })
            );
        });

        it("sends multiple selectedCredentialIds in one object for a multiple:true query", async () => {
            mockFetchData.mockResolvedValueOnce({ ok: () => true });
            render(
                <CredentialShareHandler
                    {...defaultProps}
                    isDcqlPresentation={true}
                    dcqlSelection={{
                        "documents": ["vc-1", "vc-2"],
                    }}
                />
            );

            await waitFor(() => expect(mockOnShareSuccess).toHaveBeenCalled());

            expect(mockFetchData).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: {
                        selectedCredentials: [
                            { queryId: "documents", selectedCredentialIds: ["vc-1", "vc-2"] },
                        ],
                    },
                })
            );
        });

        it("includes selectedSdClaims alongside DCQL selectedCredentials for SD-JWT credentials", async () => {
            mockFetchData.mockResolvedValueOnce({ ok: () => true });
            render(
                <CredentialShareHandler
                    {...defaultProps}
                    isDcqlPresentation={true}
                    dcqlSelection={{
                        "government-identity": ["cred-sdjwt-uuid"],
                        "age-proof": ["cred-ldp-uuid"],
                    }}
                    selectedSdClaims={{
                        "cred-sdjwt-uuid": ["$.given_name", "$.birth_date"],
                    }}
                />
            );

            await waitFor(() => expect(mockOnShareSuccess).toHaveBeenCalled());

            expect(mockFetchData).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: {
                        selectedCredentials: [
                            { queryId: "government-identity", selectedCredentialIds: ["cred-sdjwt-uuid"] },
                            { queryId: "age-proof", selectedCredentialIds: ["cred-ldp-uuid"] },
                        ],
                        selectedSdClaims: {
                            "cred-sdjwt-uuid": ["$.given_name", "$.birth_date"],
                        },
                    },
                })
            );
        });

        it("falls back to selectedCredentials when isDcqlPresentation is false", async () => {
            mockFetchData.mockResolvedValueOnce({ ok: () => true });
            render(
                <CredentialShareHandler
                    {...defaultProps}
                    isDcqlPresentation={false}
                    dcqlSelection={{ "some-query": ["vc-uuid"] }}
                />
            );

            await waitFor(() => expect(mockOnShareSuccess).toHaveBeenCalled());

            expect(mockFetchData).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: {
                        selectedCredentials: ["cred-1"],
                    },
                })
            );
        });
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
        expect(mockOnShareSuccess).not.toHaveBeenCalled();
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
        expect(mockOnShareSuccess).not.toHaveBeenCalled();
        expect(screen.queryByTestId("modal-error-card")).not.toBeInTheDocument();
    });

    describe("redirectUri handling", () => {
        it("uses redirectUri from API response when available", async () => {
            const apiRedirectUri = "https://api-response.com/redirect";
            mockFetchData.mockResolvedValueOnce({
                ok: () => true,
                data: { redirectUri: apiRedirectUri },
            });

            render(<CredentialShareHandler {...defaultProps} />);

            await waitFor(() =>
                expect(mockOnShareSuccess).toHaveBeenCalledWith(
                    expect.objectContaining({ returnUrl: apiRedirectUri })
                )
            );
        });

        it("falls back to returnUrl prop when redirectUri is not in API response", async () => {
            mockFetchData.mockResolvedValueOnce({
                ok: () => true,
                data: {},
            });

            render(<CredentialShareHandler {...defaultProps} />);

            await waitFor(() =>
                expect(mockOnShareSuccess).toHaveBeenCalledWith(
                    expect.objectContaining({ returnUrl: defaultProps.returnUrl })
                )
            );
        });

        it("falls back to returnUrl prop when redirectUri is null in API response", async () => {
            mockFetchData.mockResolvedValueOnce({
                ok: () => true,
                data: { redirectUri: null },
            });

            render(<CredentialShareHandler {...defaultProps} />);

            await waitFor(() =>
                expect(mockOnShareSuccess).toHaveBeenCalledWith(
                    expect.objectContaining({ returnUrl: defaultProps.returnUrl })
                )
            );
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

            mockFetchData.mockResolvedValueOnce(retryableErrorResponse);

            let storedRetryCallback: (() => Promise<any>) | null = null;
            let storedRetrySuccessCallback: ((response: any) => void) | null = null;

            mockUseApiErrorHandler.mockImplementation(() => {
                if (mockHandleApiError.mock.calls.length > 0) {
                    const lastCall = mockHandleApiError.mock.calls[mockHandleApiError.mock.calls.length - 1];
                    if (lastCall && lastCall.length >= 3) {
                        storedRetryCallback = lastCall[2];
                        storedRetrySuccessCallback = lastCall[3];
                    }

                    return {
                        ...mockErrorHandlerReturnValue,
                        showError: true,
                        onRetry: async () => {
                            if (storedRetryCallback) {
                                mockFetchData.mockResolvedValueOnce(successResponseWithRedirectUri);
                                const response = await storedRetryCallback();
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

            await waitFor(() =>
                expect(screen.getByTestId("modal-error-card")).toBeInTheDocument()
            );

            const retryButton = screen.getByRole('button', { name: 'Retry' });
            fireEvent.click(retryButton);

            await waitFor(() =>
                expect(mockOnShareSuccess).toHaveBeenCalledWith(
                    expect.objectContaining({
                        returnUrl: "https://retry-success.com/redirect",
                    })
                ),
                { timeout: 3000 }
            );
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
                expect(mockOnShareSuccess).toHaveBeenCalledWith(
                    expect.objectContaining({ returnUrl: apiRedirectUri })
                )
            );
        });
    });
});
