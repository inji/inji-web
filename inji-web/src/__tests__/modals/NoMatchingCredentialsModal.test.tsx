import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NoMatchingCredentialsModal } from '../../modals/NoMatchingCredentialsModal';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../hooks/useApi';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';

// Mock dependencies
jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

jest.mock('../../hooks/useApi', () => ({
    useApi: jest.fn(),
}));

// Mock the error handler hook
jest.mock('../../hooks/useApiErrorHandler', () => ({
    useApiErrorHandler: jest.fn(),
}));

// Mock the new "smart" ErrorCard
jest.mock('../../modals/ErrorCard', () => ({
    ErrorCard: ({ isOpen, onClose, onRetry, isRetrying, title, description, testId }: any) => {
        if (!isOpen) return null;

        const isRetryable = !!onRetry;
        const button = isRetryable
            ? <button onClick={onRetry} disabled={isRetrying}>Retry</button>
            : (onClose ? <button onClick={onClose}>Close</button> : null);

        return (
            <div data-testid={testId}>
                ErrorCard Mock: {title} - {description}
                {button}
            </div>
        );
    }
}));
// Removed RetryCard mock

jest.mock('../../modals/ModalWrapper', () => ({
    ModalWrapper: ({ header, footer, content, zIndex, size }: any) => (
        <div data-testid="ModalWrapper-Mock" data-z-index={zIndex} data-size={size}>
            {header}
            {content}
            {footer}
        </div>
    ),
}));

jest.mock('../../components/Common/Buttons/SolidButton', () => ({
    SolidButton: ({ onClick, title, testId, fullWidth, className, disabled }: any) => (
        <button
            data-testid={testId}
            onClick={onClick}
            data-full-width={fullWidth}
            className={className}
            type="button"
            disabled={disabled}
        >
            {title}
        </button>
    ),
}));

jest.mock('../../assets/RedShield.svg', () => 'red-shield-mock.svg');
jest.mock('../../assets/FullRedShield.svg', () => 'red-shield-mock.svg');
jest.mock('../../assets/TrustedIcon.svg', () => 'trusted-icon-mock.svg');
jest.mock('../../assets/unknown_verifier_logo.png', () => 'unknown-verifier-logo-mock.png');
jest.mock('../../components/Common/Buttons/CloseIconButton', () => ({
    CloseIconButton: ({ onClick, btnTestId }: { onClick: () => void; btnTestId?: string }) => (
        <button type="button" data-testid={btnTestId} onClick={onClick}>
            Close
        </button>
    ),
}));

jest.mock('../../components/Common/Buttons/BackArrowButton', () => ({
    BackArrowButton: ({ onClick, btnTestId }: { onClick: () => void; btnTestId?: string }) => (
        <button type="button" data-testid={btnTestId} onClick={onClick}>
            Back
        </button>
    ),
}));

jest.mock('../../assets/error_message.svg', () => 'error-message-icon-mock.svg');

describe('NoMatchingCredentialsModal', () => {
    const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
    const mockUseApi = useApi as jest.MockedFunction<typeof useApi>;
    const mockUseApiErrorHandler = useApiErrorHandler as jest.MockedFunction<typeof useApiErrorHandler>;

    const defaultProps = {
        isVisible: true,
        missingClaims: ['claim1', 'claim2'],
        onGoToHome: jest.fn(),
        redirectUri: 'https://example.com/redirect',
        presentationId: 'test-presentation-id',
    };

    /** API must return redirectUri for full-page navigation; the prop alone is not applied by handleExit() when no presentationId. */
    const mockApiRejectSuccessWithRedirect = {
        data: { success: true, redirectUri: 'https://example.com/redirect' },
        error: null,
        status: 200,
        ok: () => true,
    };

    const mockFetchData = jest.fn();
    let mockErrorHandlerReturnValue: ReturnType<typeof useApiErrorHandler>;

    let originalLocation: Location;

    beforeEach(() => {
        jest.clearAllMocks();

        originalLocation = window.location;

        mockUseTranslation.mockImplementation((namespace?: string) => ({
            t: (key: string, vars?: Record<string, unknown>) => {
                if (namespace === "MissingClaimsListModal") {
                    if (key === "requiredCount" && vars?.count !== undefined) {
                        return `${vars.count} required`;
                    }
                    if (key === "title") {
                        return "Missing Information";
                    }
                }

                const translations: Record<string, string> = {
                    title: "No Matching Cards Found",
                    claimsIntro:
                        "The verifier has requested cards based on the following claims:",
                    showMore: "Show more (+ {{count}})",
                    whatYouCanDo: "WHAT YOU CAN DO",
                    verifierHelp:
                        "Reach out to this verifier for more information on which Cards are required to proceed.",
                    matchingCards: "MATCHING CARDS",
                    goToHomeButton: "Go to Home",
                    continueWithAvailableButton: "Continue with available cards",
                    trustedLabel: "Trusted",
                    unknownVerifier: "Unknown Verifier",
                    "ErrorCard.defaultTitle": "Default Error Title",
                    "ErrorCard.defaultDescription": "Default Error Description",
                    "ErrorCard.closeButton": "Close",
                    "RetryCard.defaultDescription": "Default Retry Description",
                    "RetryCard.retryButton": "Retry",
                };
                if (key === "showMore" && vars?.count !== undefined) {
                    return `Show more (+ ${vars.count})`;
                }
                return translations[key] || key;
            },
        }));

        mockUseApi.mockReturnValue({
            fetchData: mockFetchData,
            data: null,
            error: null,
            state: 'idle' as any,
            status: null,
            ok: () => true,
        });

        // Default mock return value for the new error handler
        mockErrorHandlerReturnValue = {
            showError: false,
            isRetrying: false,
            errorTitle: undefined,
            errorDescription: undefined,
            onRetry: undefined, // Default to non-retryable
            onClose: jest.fn(), // Default to having a close function
            handleApiError: jest.fn(),
            clearError: jest.fn(),
        };
        mockUseApiErrorHandler.mockReturnValue(mockErrorHandlerReturnValue);
    });

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            value: originalLocation,
            writable: true,
            configurable: true,
        });
    });

    const setupWindowLocationMock = (initialHref: string = '') => {
        let href = initialHref;
        delete (window as any).location;
        const mockLocation = {
            assign: jest.fn(),
            replace: jest.fn(),
            reload: jest.fn(),
        };
        Object.defineProperty(mockLocation, 'href', {
            configurable: true,
            get() {
                return href;
            },
            set(next: string) {
                href = next;
            },
        });
        Object.defineProperty(window, 'location', {
            configurable: true,
            writable: true,
            value: mockLocation,
        });
    };

    describe('Rendering', () => {
        it('renders nothing when not visible', () => {
            render(<NoMatchingCredentialsModal {...defaultProps} isVisible={false} />);
            expect(screen.queryByTestId('ModalWrapper-Mock')).not.toBeInTheDocument();
        });

        it('renders modal when visible and no error', () => {
            render(<NoMatchingCredentialsModal {...defaultProps} />);
            expect(screen.getByTestId('ModalWrapper-Mock')).toBeInTheDocument();
            expect(screen.getByTestId('img-no-matching-credentials-icon')).toBeInTheDocument();
            expect(screen.queryByTestId('modal-error-handler-no-matching')).not.toBeInTheDocument();
        });

        it('renders error icon', () => {
            render(<NoMatchingCredentialsModal {...defaultProps} />);
            const errorIcon = screen.getByTestId('img-no-matching-credentials-icon');
            expect(errorIcon).toBeInTheDocument();
            expect(errorIcon).toHaveAttribute('src', 'red-shield-mock.svg');
            expect(errorIcon).toHaveAttribute('alt', '');
        });

        it('renders title and claims intro from translations', () => {
            render(<NoMatchingCredentialsModal {...defaultProps} />);
            expect(screen.getByText('No Matching Cards Found')).toBeInTheDocument();
            expect(screen.getByText('The verifier has requested cards based on the following claims:')).toBeInTheDocument();
        });

        it('renders go to home button', () => {
            render(<NoMatchingCredentialsModal {...defaultProps} />);
            const goToHomeButton = screen.getByTestId('btn-go-to-home');
            expect(goToHomeButton).toBeInTheDocument();
            expect(goToHomeButton).toHaveTextContent('Go to Home');
        });

        it('opens full missing claims modal when show more is clicked', () => {
            const manyClaims = Array.from({ length: 5 }, (_, i) => `claim-${i + 1}`);
            render(
                <NoMatchingCredentialsModal
                    {...defaultProps}
                    missingClaims={manyClaims}
                />
            );

            fireEvent.click(screen.getByTestId('btn-show-more-claims'));

            expect(
                screen.getByTestId('card-missing-claims-list-modal')
            ).toBeInTheDocument();
            expect(screen.getByText('Missing Information')).toBeInTheDocument();
            expect(screen.getByText('5 required')).toBeInTheDocument();
            expect(screen.getByTestId('missing-claims-list')).toHaveTextContent(
                'Claim 4'
            );
            expect(screen.getByTestId('missing-claims-list')).toHaveTextContent(
                'Claim 5'
            );

            fireEvent.click(screen.getByTestId('button-missing-claims-list-back'));

            expect(
                screen.queryByTestId('card-missing-claims-list-modal')
            ).not.toBeInTheDocument();
            expect(screen.getByText('No Matching Cards Found')).toBeInTheDocument();
        });
    });

    describe('User Interactions', () => {
        it('calls onGoToHome when go to home button is clicked without presentationId', async () => {
            const propsWithoutPresentationId = {
                ...defaultProps,
                presentationId: undefined,
                redirectUri: undefined,
            };
            render(<NoMatchingCredentialsModal {...propsWithoutPresentationId} />);
            const goToHomeButton = screen.getByTestId('btn-go-to-home');
            fireEvent.click(goToHomeButton);
            await waitFor(() => {
                expect(defaultProps.onGoToHome).toHaveBeenCalledTimes(1);
            });
            expect(mockFetchData).not.toHaveBeenCalled();
        });

        it('calls onGoToHome when go to home is clicked without presentationId (redirectUri prop does not set location)', () => {
            const onGoToHome = jest.fn();
            const propsWithoutPresentationId = {
                ...defaultProps,
                presentationId: undefined,
                onGoToHome,
            };
            setupWindowLocationMock();
            render(<NoMatchingCredentialsModal {...propsWithoutPresentationId} />);
            fireEvent.click(screen.getByTestId('btn-go-to-home'));
            expect(onGoToHome).toHaveBeenCalledTimes(1);
            expect(window.location.href).toBe('');
        });

        it('calls API to reject verifier when presentationId is provided', async () => {
            mockFetchData.mockResolvedValue(mockApiRejectSuccessWithRedirect);
            setupWindowLocationMock();
            render(<NoMatchingCredentialsModal {...defaultProps} />);
            const goToHomeButton = screen.getByTestId('btn-go-to-home');
            fireEvent.click(goToHomeButton);
            await waitFor(() => {
                expect(mockFetchData).toHaveBeenCalledWith({
                    url: expect.stringContaining('/presentations/test-presentation-id'),
                    apiConfig: expect.any(Object),
                    body: { errorCode: 'invalid_transaction_data', errorMessage: 'No matching credentials found to fulfill the request'},
                });
            });
            expect(window.location.href).toBe('https://example.com/redirect');
        });

        it('does not reject verifier when matching credentials are available', async () => {
            const onClose = jest.fn();
            const matchingCredentials = [
                {
                    credentialId: 'cred-1',
                    credentialTypeDisplayName: 'Govt Id',
                    credentialTypeLogo: 'https://example.com/logo.png',
                    format: 'dc+sd-jwt',
                },
            ];

            render(
                <NoMatchingCredentialsModal
                    {...defaultProps}
                    matchingCredentials={matchingCredentials}
                    onClose={onClose}
                />
            );

            expect(screen.getByTestId('btn-go-to-home')).toHaveTextContent(
                'Continue with available cards'
            );

            fireEvent.click(screen.getByTestId('btn-go-to-home'));

            await waitFor(() => {
                expect(onClose).toHaveBeenCalledTimes(1);
            });
            expect(mockFetchData).not.toHaveBeenCalled();
            expect(defaultProps.onGoToHome).not.toHaveBeenCalled();
        });

        it('calls onGoToHome when no redirectUri is provided after successful API call', async () => {
            const propsWithoutRedirectUri = { ...defaultProps, redirectUri: undefined };
            mockFetchData.mockResolvedValue({ data: { success: true }, error: null, status: 200, ok: () => true });
            render(<NoMatchingCredentialsModal {...propsWithoutRedirectUri} />);
            const goToHomeButton = screen.getByTestId('btn-go-to-home');
            fireEvent.click(goToHomeButton);
            await waitFor(() => { expect(mockFetchData).toHaveBeenCalled(); });
            expect(defaultProps.onGoToHome).toHaveBeenCalledTimes(1);
        });
    });

    describe('API Integration', () => {
        it('handles API success correctly and redirects', async () => {
            mockFetchData.mockResolvedValue(mockApiRejectSuccessWithRedirect);
            setupWindowLocationMock();
            render(<NoMatchingCredentialsModal {...defaultProps} />);
            const goToHomeButton = screen.getByTestId('btn-go-to-home');
            fireEvent.click(goToHomeButton);
            await waitFor(() => {
                expect(mockFetchData).toHaveBeenCalledWith({
                    url: expect.stringContaining('/presentations/test-presentation-id'),
                    apiConfig: expect.any(Object),
                    body: { errorCode: 'invalid_transaction_data', errorMessage: 'No matching credentials found to fulfill the request' },
                });
            });
            expect(window.location.href).toBe('https://example.com/redirect');
        });

        it('calls handleApiError when API throws error', async () => {
            const error = new Error('API Error');
            mockFetchData.mockRejectedValue(error);
            setupWindowLocationMock('');
            render(<NoMatchingCredentialsModal {...defaultProps} />);
            const goToHomeButton = screen.getByTestId('btn-go-to-home');

            fireEvent.click(goToHomeButton);

            await waitFor(() => {
                expect(mockErrorHandlerReturnValue.handleApiError).toHaveBeenCalledWith(
                    error,
                    "rejectVerifier",
                    expect.any(Function), // rejectVerifierCore
                    expect.any(Function)  // handleExit
                );
            });

            expect(mockErrorHandlerReturnValue.handleApiError).toHaveBeenCalledWith(
                error,
                "rejectVerifier",
                expect.any(Function), // rejectVerifierCore
                expect.any(Function)  // handleExit
            );
            expect(window.location.href).toBe('');
            expect(goToHomeButton).not.toBeDisabled();
        });
    });

    describe('Error/Retry Handling', () => {
        it('shows ErrorCard with "Close" button for non-retryable error', async () => {
            mockErrorHandlerReturnValue = {
                ...mockErrorHandlerReturnValue,
                showError: true,
                errorTitle: 'Final Error',
                errorDescription: 'This is a final error.',
                onRetry: undefined,
                onClose: jest.fn(),
            };
            mockUseApiErrorHandler.mockReturnValue(mockErrorHandlerReturnValue);

            render(<NoMatchingCredentialsModal {...defaultProps} />);

            const errorCard = screen.getByTestId('modal-error-handler-no-matching');
            expect(errorCard).toBeInTheDocument();
            expect(errorCard).toHaveTextContent('ErrorCard Mock: Final Error - This is a final error.');

            expect(screen.getByText('Close')).toBeInTheDocument();
            expect(screen.queryByText('Retry')).not.toBeInTheDocument();

            expect(screen.queryByTestId('card-no-matching-credentials-modal')).not.toBeInTheDocument();
        });

        it('shows ErrorCard with "Retry" button for retryable error', async () => {
            mockErrorHandlerReturnValue = {
                ...mockErrorHandlerReturnValue,
                showError: true,
                errorTitle: 'Retryable Error',
                errorDescription: 'Please try again.',
                onRetry: jest.fn(),
                onClose: undefined,
            };
            mockUseApiErrorHandler.mockReturnValue(mockErrorHandlerReturnValue);

            render(<NoMatchingCredentialsModal {...defaultProps} />);

            const errorCard = screen.getByTestId('modal-error-handler-no-matching');
            expect(errorCard).toBeInTheDocument();
            expect(errorCard).toHaveTextContent('ErrorCard Mock: Retryable Error - Please try again.');

            expect(screen.getByText('Retry')).toBeInTheDocument();
            expect(screen.queryByText('Close')).not.toBeInTheDocument();

            expect(screen.queryByTestId('card-no-matching-credentials-modal')).not.toBeInTheDocument();
        });

        it('calls onClose from hook when ErrorCard close button is clicked', () => {
            const mockOnClose = jest.fn();
            mockErrorHandlerReturnValue = {
                ...mockErrorHandlerReturnValue,
                showError: true,
                onClose: mockOnClose
            };
            mockUseApiErrorHandler.mockReturnValue(mockErrorHandlerReturnValue);

            render(<NoMatchingCredentialsModal {...defaultProps} />);

            const closeButton = screen.getByText('Close');
            fireEvent.click(closeButton);
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('calls onRetry from hook when ErrorCard retry button is clicked', () => {
            const mockOnRetry = jest.fn();
            mockErrorHandlerReturnValue = {
                ...mockErrorHandlerReturnValue,
                showError: true,
                onRetry: mockOnRetry
            };
            mockUseApiErrorHandler.mockReturnValue(mockErrorHandlerReturnValue);

            render(<NoMatchingCredentialsModal {...defaultProps} />);

            const retryButton = screen.getByText('Retry');
            fireEvent.click(retryButton);
            expect(mockOnRetry).toHaveBeenCalledTimes(1);
        });

        it('disables Go To Home button when isRetrying is true', () => {
            mockErrorHandlerReturnValue = { ...mockErrorHandlerReturnValue, isRetrying: true };
            mockUseApiErrorHandler.mockReturnValue(mockErrorHandlerReturnValue);

            render(<NoMatchingCredentialsModal {...defaultProps} />);

            const goToHomeButton = screen.getByTestId('btn-go-to-home');
            expect(goToHomeButton).toBeDisabled();
        });

        it('disables Go To Home button when isSubmitting is true', async () => {
            mockFetchData.mockImplementation(() => new Promise(() => {}));

            render(<NoMatchingCredentialsModal {...defaultProps} />);

            const goToHomeButton = screen.getByTestId('btn-go-to-home');
            expect(goToHomeButton).not.toBeDisabled(); // Enabled before click

            fireEvent.click(goToHomeButton);

            await waitFor(() => {
                expect(goToHomeButton).toBeDisabled(); // Disabled after click
            });
        });

        it('prevents multiple API calls on rapid clicks', async () => {
            mockFetchData.mockResolvedValueOnce(mockApiRejectSuccessWithRedirect);
            setupWindowLocationMock('');

            render(<NoMatchingCredentialsModal {...defaultProps} />);

            const goToHomeButton = screen.getByTestId('btn-go-to-home');
            fireEvent.click(goToHomeButton);
            fireEvent.click(goToHomeButton);
            fireEvent.click(goToHomeButton);

            await waitFor(() => { expect(mockFetchData).toHaveBeenCalledTimes(1); });
            expect(window.location.href).toBe(defaultProps.redirectUri);
        });
    });

    describe('Component Structure', () => {
        it('renders all required elements', () => {
            render(<NoMatchingCredentialsModal {...defaultProps} />);
            expect(screen.getByTestId('ModalWrapper-Mock')).toBeInTheDocument();
            expect(screen.getByTestId('img-no-matching-credentials-icon')).toBeInTheDocument();
            expect(screen.getByTestId('text-no-matching-credentials-description')).toBeInTheDocument();
            expect(screen.getByTestId('btn-go-to-home')).toBeInTheDocument();
        });

        it('has correct CSS classes for responsive design', () => {
            render(<NoMatchingCredentialsModal {...defaultProps} />);
            const modalContainer = screen.getByTestId('card-no-matching-credentials-modal');
            expect(modalContainer).toHaveClass('w-full');
        });

        it('passes correct props to ModalWrapper', () => {
            render(<NoMatchingCredentialsModal {...defaultProps} />);
            const modalWrapper = screen.getByTestId('ModalWrapper-Mock');
            expect(modalWrapper).toHaveAttribute('data-z-index', '50');
            expect(modalWrapper).toHaveAttribute('data-size', '3xl');
        });
    });

    describe('Props Handling', () => {
        it('handles missing claims prop', () => {
            const propsWithoutMissingClaims = { ...defaultProps, missingClaims: undefined };
            render(<NoMatchingCredentialsModal {...propsWithoutMissingClaims} />);
            expect(screen.getByTestId('ModalWrapper-Mock')).toBeInTheDocument();
        });

        it('handles empty missing claims array', () => {
            const propsWithEmptyMissingClaims = { ...defaultProps, missingClaims: [] };
            render(<NoMatchingCredentialsModal {...propsWithEmptyMissingClaims} />);
            expect(screen.getByTestId('ModalWrapper-Mock')).toBeInTheDocument();
        });

        it('handles undefined redirectUri', async () => {
            const propsWithoutRedirectUri = { ...defaultProps, redirectUri: undefined };
            mockFetchData.mockResolvedValue({ data: { success: true }, error: null, status: 200, ok: () => true });
            render(<NoMatchingCredentialsModal {...propsWithoutRedirectUri} />);
            const goToHomeButton = screen.getByTestId('btn-go-to-home');
            fireEvent.click(goToHomeButton);
            await waitFor(() => { expect(mockFetchData).toHaveBeenCalled(); });
            expect(defaultProps.onGoToHome).toHaveBeenCalledTimes(1);
        });

        it('handles undefined presentationId', async () => {
            const propsWithoutPresentationId = { ...defaultProps, presentationId: undefined, redirectUri: undefined };
            render(<NoMatchingCredentialsModal {...propsWithoutPresentationId} />);
            const goToHomeButton = screen.getByTestId('btn-go-to-home');
            fireEvent.click(goToHomeButton);
            await waitFor(() => { expect(defaultProps.onGoToHome).toHaveBeenCalledTimes(1); });
            expect(mockFetchData).not.toHaveBeenCalled();
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA attributes', () => {
            render(<NoMatchingCredentialsModal {...defaultProps} />);
            const title = screen.getByText('No Matching Cards Found');
            expect(title).toHaveAttribute('id', 'title-no-matching-credentials');
            const description = screen.getByTestId('text-no-matching-credentials-description');
            expect(description).toBeInTheDocument();
        });

        it('has proper button attributes', () => {
            render(<NoMatchingCredentialsModal {...defaultProps} />);
            const goToHomeButton = screen.getByTestId('btn-go-to-home');
            expect(goToHomeButton).toBeInTheDocument();
            expect(goToHomeButton.tagName).toBe('BUTTON');
            expect(goToHomeButton).toHaveAttribute('type', 'button');
        });
    });

    describe('Edge Cases', () => {
        it('handles undefined onGoToHome callback', () => {
            const propsWithoutCallback = { ...defaultProps, onGoToHome: undefined as any, presentationId: undefined, redirectUri: undefined };
            render(<NoMatchingCredentialsModal {...propsWithoutCallback} />);
            const goToHomeButton = screen.getByTestId('btn-go-to-home');
            expect(() => { fireEvent.click(goToHomeButton); }).not.toThrow();
        });

        it('handles special characters in missing claims', () => {
            const propsWithSpecialClaims = { ...defaultProps, missingClaims: ['claim@#$%', 'claim with spaces', 'claim-with-dashes'] };
            render(<NoMatchingCredentialsModal {...propsWithSpecialClaims} />);
            const claimsList = screen.getByTestId('no-matching-claims-list');
            expect(claimsList).toHaveTextContent('Claim@#$%');
            expect(claimsList).toHaveTextContent('Claim With Spaces');
            expect(claimsList).toHaveTextContent('Claim With Dashes');
        });
    });

    describe('Internationalization', () => {
        it('uses correct translation namespace', () => {
            render(<NoMatchingCredentialsModal {...defaultProps} />);
            expect(mockUseTranslation).toHaveBeenCalledWith('NoMatchingCredentialsModal');
        });

        it('handles missing translation keys gracefully', () => {
            mockUseTranslation.mockReturnValue({ t: (key: string) => key } as any);
            render(<NoMatchingCredentialsModal {...defaultProps} />);
            expect(screen.getByText('title')).toBeInTheDocument();
            expect(screen.getByText('claimsIntro')).toBeInTheDocument();
            expect(screen.getByText('goToHomeButton')).toBeInTheDocument();
        });
    });

    describe('Performance', () => {
        it('does not re-render unnecessarily when props are the same', () => {
            const { rerender } = render(<NoMatchingCredentialsModal {...defaultProps} />);
            const initialModal = screen.getByTestId('ModalWrapper-Mock');
            rerender(<NoMatchingCredentialsModal {...defaultProps} />);
            const afterRerender = screen.getByTestId('ModalWrapper-Mock');
            expect(initialModal).toBe(afterRerender);
        });

        it('re-renders when isVisible prop changes', () => {
            const { rerender } = render(<NoMatchingCredentialsModal {...defaultProps} />);
            expect(screen.getByTestId('ModalWrapper-Mock')).toBeInTheDocument();
            rerender(<NoMatchingCredentialsModal {...defaultProps} isVisible={false} />);
            expect(screen.queryByTestId('ModalWrapper-Mock')).not.toBeInTheDocument();
        });

        it('re-renders when callback props change', () => {
            const newOnGoToHome = jest.fn();
            const { rerender } = render(<NoMatchingCredentialsModal {...defaultProps} />);
            const initialModal = screen.getByTestId('ModalWrapper-Mock');
            rerender(<NoMatchingCredentialsModal {...defaultProps} onGoToHome={newOnGoToHome} />);
            const afterRerender = screen.getByTestId('ModalWrapper-Mock');
            expect(afterRerender).toBeInTheDocument();
        });
    });

    describe('Responsive Design', () => {
        it('applies mobile-first responsive classes', () => {
            render(<NoMatchingCredentialsModal {...defaultProps} />);
            const modalContainer = screen.getByTestId('card-no-matching-credentials-modal');
            expect(modalContainer).toHaveClass('w-full');
        });

        it('applies mobile breakpoint classes', () => {
            render(<NoMatchingCredentialsModal {...defaultProps} />);
            const modalContainer = screen.getByTestId('card-no-matching-credentials-modal');
            expect(modalContainer).toHaveClass('transition-all', 'duration-300', 'ease-in-out');
        });
    });
});