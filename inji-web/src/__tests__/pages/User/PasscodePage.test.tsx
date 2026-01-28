import React from 'react';
import {render, screen, waitFor, within} from '@testing-library/react';
import {MemoryRouter, useNavigate} from 'react-router-dom';
import {CookiesProvider} from 'react-cookie';
import {PasscodePage} from '../../../pages/User/Passcode/PasscodePage';
import {UserProvider} from "../../../context/User/UserContext";
import {DownloadSessionProvider} from "../../../context/User/DownloadSessionContext";
import {mockApiResponse, mockApiResponseSequence, mockUseApi} from "../../../test-utils/setupUseApiMock";
import {setMockUseSelectorState} from "../../../test-utils/mockReactRedux";
import {AppStorage} from "../../../utils/AppStorage";
import userEvent from "@testing-library/user-event";
import {useUser} from "../../../hooks/User/useUser";
import {successWalletResponse} from "../../../test-utils/mockObjects";

// Mocking the useTranslation hook from react-i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                "setPasscode": "Set Passcode",
                "enterPasscode": "Enter Passcode",
                "enterPasscodeLabel": "Enter Passcode",
                "confirmPasscodeLabel": "Confirm Passcode",
                "forgotPasscode": "Forgot Passcode",
                "setPasscodeDescription": "Set your passcode to get started",
                "enterPasscodeDescription": "Enter your 6 digit passcode",
                "passcodeWarning": "Make sure you remember the password for future login",
                "error.walletStatus.temporarily_locked": "You’ve reached the maximum number of attempts. Your wallet is now temporarily locked for sometime",
                "error.walletStatus.permanently_locked": "Your wallet has been permanently locked due to multiple failed attempts. Please click on forgot password to reset your wallet to continue",
                "error.walletStatus.last_attempt_before_lockout": "Incorrect passcode. Last attempt remaining before your wallet is permanently locked",
                "error.incorrectPasscodeError": "The passcode doesn't seem right. Please try again, or tap 'Forgot Passcode' if you need help resetting it",
                "error.passcodeMismatchError": "Passcodes do not match. Please ensure both passcode fields match exactly. Re-enter and try again.",
            };
            return translations[key] || key;
        }
    })
}));

jest.mock("../../../hooks/useApi.ts", () => {
    return {
        useApi: () => mockUseApi
    };
});

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
    useLocation: jest.fn()
}));

jest.mock("../../../utils/AppStorage.ts", () => ({
    AppStorage: {
        getItem: jest.fn(),
        removeItem: jest.fn(),
        setItem: jest.fn(),
    },
}))

jest.mock("../../../hooks/User/useUser.tsx", () => ({
    useUser: jest.fn(),
}))

describe('Passcode', () => {
    const mockNavigate = jest.fn();

    const renderWithProviders = (ui: React.ReactElement) => {
        return render(
            <CookiesProvider>
                <UserProvider>
                    <DownloadSessionProvider>
                        <MemoryRouter>{ui}</MemoryRouter>
                    </DownloadSessionProvider>
                </UserProvider>
            </CookiesProvider>
        );
    };

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

        setMockUseSelectorState({
            common: {
                language: 'en',
            },
        });

        (useUser as jest.Mock).mockReturnValue({
            removeWallet: jest.fn(),
            walletId: null,
            saveWalletId: jest.fn(),
            fetchUserProfile: jest.fn()
        });
    })

    test("check if layout is matching with snapshot when Wallet exists", async () => {
        mockApiResponse({data: successWalletResponse});
        const {container} = renderWithProviders(<PasscodePage/>);

        await waitFor(() => {
            expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
        });

        expect(container).toMatchSnapshot();
    });

    test("check if layout is matching with snapshot when Wallet doesn't exist", async () => {
        mockApiResponse({data: []});
        const {container} = renderWithProviders(<PasscodePage/>);

        await waitFor(() => {
            expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
        });

        expect(container).toMatchSnapshot();
    });

    test('renders passcode page, logo and title', async () => {
        mockApiResponse({data: successWalletResponse})
        renderWithProviders(<PasscodePage/>);

        await waitFor(() => {
            expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
        })

        const page = screen.getByTestId('passcode-page');
        expect(page).toBeInTheDocument();

        const logo = screen.getByTestId('logo-inji-web-container');
        expect(logo).toBeInTheDocument();

        const title = screen.getByTestId('title-passcode');
        expect(title).toHaveTextContent(/Set Passcode|Enter Passcode/);
    });

    test("should render enter passcode container along with forgot passcode and submit buttons when a Wallet exists", async () => {
        mockApiResponse({data: successWalletResponse});
        renderWithProviders(<PasscodePage/>);

        const passcodeInput = await screen.findByTestId("passcode-container");
        expect(passcodeInput).toBeInTheDocument();
        expect(within(passcodeInput).getByTestId("label-passcode")).toHaveTextContent("Enter Passcode");

        const forgotPasscodeButton = await screen.findByTestId("btn-forgot-passcode");
        expect(forgotPasscodeButton).toBeInTheDocument();
        expect(forgotPasscodeButton).toHaveTextContent("Forgot Passcode?");

        const submitButton = await screen.findByTestId("btn-submit-passcode");
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
    });

    test("should render enter passcode and confirm passcode containers along with submit button when Wallet doesn't exist", async () => {
        mockApiResponse({data: []});
        renderWithProviders(<PasscodePage/>);

        const passcodeInput = await screen.findByTestId("passcode-container");
        expect(passcodeInput).toBeInTheDocument();
        expect(within(passcodeInput).getByTestId("label-passcode")).toHaveTextContent("Enter Passcode");

        const confirmPasscodeInput = await screen.findByTestId("confirm-passcode-container");
        expect(confirmPasscodeInput).toBeInTheDocument();
        expect(within(confirmPasscodeInput).getByTestId("label-confirm-passcode")).toHaveTextContent("Confirm Passcode");

        const submitButton = await screen.findByTestId("btn-submit-passcode");
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
    });

    test("should redirect to forgot passcode page when forgot passcode button is clicked", async () => {
        mockApiResponse({data: successWalletResponse})
        renderWithProviders(<PasscodePage/>);

        const forgotPasscodeButton = await screen.findByTestId("btn-forgot-passcode");
        expect(forgotPasscodeButton).toBeInTheDocument();
        forgotPasscodeButton.click();

        expect(mockNavigate).toBeCalledWith("/user/reset-passcode", {"state": {"walletId": "2c2e1810-19c8-4c85-910d-aa1622412413"}}
        );
    })

    test("should redirect to home when successfully unlocked wallet", async () => {
        mockApiResponseSequence([{data: successWalletResponse}, {data: successWalletResponse}])
        renderWithProviders(<PasscodePage/>);

        await enterPasscode()
        userEvent.click(screen.getByTestId("btn-submit-passcode"));

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1))
        expect(mockNavigate).toHaveBeenCalledWith("/user/home");
    })

    const walletLockErrorMessages = [
        {
            walletStatus: "temporarily_locked",
            expectedError: "You’ve reached the maximum number of attempts. Your wallet is now temporarily locked for sometime",
            testId: "error-msg-passcode-temporarily-locked"
        },
        {
            walletStatus: "permanently_locked",
            expectedError: "Your wallet has been permanently locked due to multiple failed attempts. Please click on forgot password to reset your wallet to continue",
            testId: "error-msg-passcode-permanently-locked"
        }
    ];

    test.each(walletLockErrorMessages)(
        "should display $walletStatus error and disable input boxes and submit button when landing on the passcode page for a already $walletStatus Wallet",
        async ({walletStatus, expectedError, testId}) => {
            mockApiResponseSequence([{
                data: [{
                    walletId: "2c2e1810-19c8-4c85-910d-aa1622412413",
                    walletName: null,
                    walletStatus: walletStatus
                }]
            }])

            renderWithProviders(<PasscodePage/>);

            await verifyPasscodeErrorAndInteractiveElementStatus(expectedError, true, null, true, testId);
        }
    );

    test.each(walletLockErrorMessages)(
        "should display $walletStatus error and disable input boxes and submit button when unlock wallet endpoint returns $walletStatus error code",
        async ({walletStatus, expectedError, testId}) => {
            mockApiResponseSequence([{data: successWalletResponse}, {
                error: {response: {data: {errorCode: walletStatus}}},
                status: 400
            }])

            renderWithProviders(<PasscodePage/>);

            await waitFor(() => {
                expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
            })

            await enterPasscode();
            userEvent.click(screen.getByTestId("btn-submit-passcode"));

            await verifyPasscodeErrorAndInteractiveElementStatus(expectedError, true, "", true, testId);
        }
    );

    test("should display one attempt left before lockout error and enable input boxes when landing on the passcode page for a wallet with one attempt left before permanent lockout", async () => {
        const expectedErrorMsg = "Incorrect passcode. Last attempt remaining before your wallet is permanently locked";
        mockApiResponseSequence([{
            data: [{
                walletId: "2c2e1810-19c8-4c85-910d-aa1622412413",
                walletName: null,
                walletStatus: "last_attempt_before_lockout"
            }]
        }])

        renderWithProviders(<PasscodePage/>);

        await verifyPasscodeErrorAndInteractiveElementStatus(expectedErrorMsg, false, null, true, "error-msg-passcode-last-attempt-before-lockout");
    });

    test("should display one attempt left before lockout error and enable input boxes when unlock wallet endpoint returns last_attempt_before_lockout error code", async () => {
        const expectedErrorMsg = "Incorrect passcode. Last attempt remaining before your wallet is permanently locked";
        mockApiResponseSequence([{data: successWalletResponse}, {
            error: {response: {data: {errorCode: "last_attempt_before_lockout"}}},
            status: 400
        }])

        renderWithProviders(<PasscodePage/>);

        await waitFor(() => {
            expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
        })

        await enterPasscode();
        userEvent.click(screen.getByTestId("btn-submit-passcode"));

        await verifyPasscodeErrorAndInteractiveElementStatus(expectedErrorMsg, false, "", true, "error-msg-passcode-last-attempt-before-lockout");
    });

// Testing for re-login scenario in case of session expiry
    test("should redirect to previous url post unlock if available", async () => {
        (AppStorage.getItem as jest.Mock).mockReturnValue("/previous-url");
        mockApiResponseSequence([{data: successWalletResponse}, {data: successWalletResponse}])

        renderWithProviders(<PasscodePage/>);

        await enterPasscode();
        userEvent.click(screen.getByTestId("btn-submit-passcode"));

        await waitFor(() =>
            expect(AppStorage.removeItem).toHaveBeenCalledWith("redirectTo", true)
        )
        expect(mockNavigate).toHaveBeenCalledTimes(1)
        expect(mockNavigate).toHaveBeenCalledWith("/previous-url");
    })

    test("should clear passcode input fields when wrong passcode is entered during unlock wallet", async () => {
        const expectedErrorMsg = "The passcode doesn't seem right. Please try again, or tap 'Forgot Passcode' if you need help resetting it";
        // Mock wallet exists
        mockApiResponseSequence([
            { data: successWalletResponse }, // fetchWallets
            { error: { response: { data: { errorCode: "incorrect_passcode" } } }, status: 400 } // unlockWallet
        ]);

        renderWithProviders(<PasscodePage />);

        await waitFor(() => {
            expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
        });

        // Enter passcode
        await enterPasscode();
        const inputs = screen.getAllByTestId('input-passcode');
        inputs.forEach(input => expect(input).toHaveValue('1'));

        // Submit
        userEvent.click(screen.getByTestId("btn-submit-passcode"));

        // Wait for error and check inputs are cleared
        await waitFor(() => {
            inputs.forEach(input => expect(input).toHaveValue(''));
        });

        await verifyPasscodeErrorAndInteractiveElementStatus(expectedErrorMsg, false, "", true, "error-msg-passcode");
    });

    const enterPasscode = async () => {
        await screen.findByTestId("passcode-container");
        const inputs = screen.getAllByTestId('input-passcode');
        inputs.map((input) => userEvent.type(input, '1'));
    }

    const verifyPasscodeErrorAndInteractiveElementStatus = async (expectedError: string, inputsDisabled: boolean, expectedInputValue: string | null, submitButtonDisabled: boolean, testId: string) => {
        const errorSpan = await screen.findByTestId(testId);
        expect(errorSpan).toHaveTextContent(expectedError);

        const inputs = screen.getAllByTestId("input-passcode");
        inputs.forEach((input) => {
            if (inputsDisabled) {
                expect(input).toBeDisabled();
            } else {
                expect(input).not.toBeDisabled();
            }

            if (expectedInputValue) {
                expect(input).toHaveValue(expectedInputValue);
            }
        });

        const submitButton = screen.getByTestId("btn-submit-passcode");
        if (submitButtonDisabled) {
            expect(submitButton).toBeDisabled();
        } else {
            expect(submitButton).not.toBeDisabled();
        }

        const forgotPasscodeButton = screen.getByTestId("btn-forgot-passcode");
        expect(forgotPasscodeButton).toBeInTheDocument();
    }

    test("should clear passcode input fields when wrong passcode is entered during unlock wallet", async () => {
        const expectedErrorMsg = "The passcode doesn't seem right. Please try again, or tap 'Forgot Passcode' if you need help resetting it";
        // Mock wallet exists
        mockApiResponseSequence([
            { data: successWalletResponse }, // fetchWallets
            { error: { response: { data: { errorCode: "incorrect_passcode" } } }, status: 400 } // unlockWallet
        ]);

        renderWithProviders(<PasscodePage />);

        await waitFor(() => {
            expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
        });

        // Enter passcode
        await enterPasscode();
        const inputs = screen.getAllByTestId('input-passcode');
        inputs.forEach(input => expect(input).toHaveValue('1'));

        // Submit
        userEvent.click(screen.getByTestId("btn-submit-passcode"));

        // Wait for error and check inputs are cleared
        await waitFor(() => {
            inputs.forEach(input => expect(input).toHaveValue(''));
        });

        await verifyPasscodeErrorAndInteractiveElementStatus(expectedErrorMsg, false, "", true, "error-msg-passcode");
    });

    describe('Passcode mismatch validation', () => {
        test('should show error when both passcodes are complete but do not match', async () => {
            mockApiResponse({data: []}); // No wallet exists - creating wallet mode
            renderWithProviders(<PasscodePage/>);

            await waitFor(() => {
                expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
            });

            // Enter passcode: 111111
            const passcodeInputs = await screen.findAllByTestId('input-passcode');
            for (const input of passcodeInputs) {
                await userEvent.type(input, '1');
            }

            // Enter confirm passcode: 222222 (different)
            const confirmPasscodeInputs = await screen.findAllByTestId('input-confirm-passcode');
            for (const input of confirmPasscodeInputs) {
                await userEvent.type(input, '2');
            }

            // Error should appear when both are complete and don't match
            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-msg-passcode');
                expect(errorMessage).toHaveTextContent('Passcodes do not match. Please ensure both passcode fields match exactly. Re-enter and try again.');
            });

            // Button should be disabled when passcodes don't match
            const submitButton = screen.getByTestId('btn-submit-passcode');
            expect(submitButton).toBeDisabled();
        });

        test('should clear error when user deletes a character (field becomes incomplete)', async () => {
            mockApiResponse({data: []});
            renderWithProviders(<PasscodePage/>);

            await waitFor(() => {
                expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
            });

            // Enter mismatched passcodes
            const passcodeInputs = await screen.findAllByTestId('input-passcode');
            for (const input of passcodeInputs) {
                await userEvent.type(input, '1');
            }
            const confirmPasscodeInputs = await screen.findAllByTestId('input-confirm-passcode');
            for (const input of confirmPasscodeInputs) {
                await userEvent.type(input, '2');
            }

            // Wait for error to appear
            await waitFor(() => {
                expect(screen.getByTestId('error-msg-passcode')).toHaveTextContent('Passcodes do not match. Please ensure both passcode fields match exactly. Re-enter and try again.');
            });

            // Delete one character from confirm passcode
            const lastConfirmInput = confirmPasscodeInputs[5];
            await userEvent.clear(lastConfirmInput);

            // Error should be cleared when field becomes incomplete
            await waitFor(() => {
                const errorMessage = screen.queryByTestId('error-msg-passcode');
                expect(errorMessage).not.toBeInTheDocument();
            });
        });

        test('should clear error when passcodes match', async () => {
            mockApiResponse({data: []});
            renderWithProviders(<PasscodePage/>);

            await waitFor(() => {
                expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
            });

            // Enter mismatched passcodes
            const passcodeInputs = await screen.findAllByTestId('input-passcode');
            for (const input of passcodeInputs) {
                await userEvent.type(input, '1');
            }
            const confirmPasscodeInputs = await screen.findAllByTestId('input-confirm-passcode');
            for (const input of confirmPasscodeInputs) {
                await userEvent.type(input, '2');
            }

            // Wait for error to appear
            await waitFor(() => {
                expect(screen.getByTestId('error-msg-passcode')).toHaveTextContent('Passcodes do not match. Please ensure both passcode fields match exactly. Re-enter and try again.');
            });

            // Change confirm passcode to match
            for (const input of confirmPasscodeInputs) {
                await userEvent.clear(input);
                await userEvent.type(input, '1');
            }

            // Error should be cleared when they match
            await waitFor(() => {
                const errorMessage = screen.queryByTestId('error-msg-passcode');
                expect(errorMessage).not.toBeInTheDocument();
            });

            // Button should be enabled when passcodes match and are complete
            await waitFor(() => {
                const submitButton = screen.getByTestId('btn-submit-passcode');
                expect(submitButton).not.toBeDisabled();
            });
        });

        test('should keep button disabled when passcodes do not match', async () => {
            mockApiResponse({data: []});
            renderWithProviders(<PasscodePage/>);

            await waitFor(() => {
                expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
            });

            // Enter complete but mismatched passcodes
            const passcodeInputs = await screen.findAllByTestId('input-passcode');
            for (const input of passcodeInputs) {
                await userEvent.type(input, '1');
            }
            const confirmPasscodeInputs = await screen.findAllByTestId('input-confirm-passcode');
            for (const input of confirmPasscodeInputs) {
                await userEvent.type(input, '2');
            }

            // Button should remain disabled
            await waitFor(() => {
                const submitButton = screen.getByTestId('btn-submit-passcode');
                expect(submitButton).toBeDisabled();
            });
        });

        test('should enable button when passcodes match and are complete', async () => {
            mockApiResponse({data: []});
            renderWithProviders(<PasscodePage/>);

            await waitFor(() => {
                expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
            });

            // Enter matching passcodes
            const passcodeInputs = await screen.findAllByTestId('input-passcode');
            for (const input of passcodeInputs) {
                await userEvent.type(input, '1');
            }
            
            const confirmPasscodeInputs = await screen.findAllByTestId('input-confirm-passcode');
            for (const input of confirmPasscodeInputs) {
                await userEvent.type(input, '1');
            }

            // Button should be enabled when passcodes match and are complete
            await waitFor(() => {
                const submitButton = screen.getByTestId('btn-submit-passcode');
                expect(submitButton).not.toBeDisabled();
            }, { timeout: 3000 });
        });

        test('should not show mismatch error when unlocking wallet (only when creating)', async () => {
            mockApiResponse({data: successWalletResponse}); // Wallet exists - unlock mode
            renderWithProviders(<PasscodePage/>);

            await waitFor(() => {
                expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
            });

            // Enter passcode (no confirm passcode field in unlock mode)
            await enterPasscode();

            // No mismatch error should appear (only one field)
            const errorMessage = screen.queryByTestId('error-msg-passcode');
            expect(errorMessage).not.toBeInTheDocument();
        });
    });
});