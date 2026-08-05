import {StoredCardsPage} from '../../../pages/User/StoredCards/StoredCardsPage';
import {fireEvent, screen, waitFor, within} from '@testing-library/react';
import {
    mockApiObject,
    mockLocalStorage,
    mockNavigatorOnline,
    mockusei18n,
    mockUseTranslation,
    renderWithRouter
} from '../../../test-utils/mockUtils';
import {KEYS, RequestStatus} from "../../../utils/constants";
import React from "react";
import {mockApiResponse, mockApiResponseSequence, mockUseApi} from "../../../test-utils/setupUseApiMock";
import {api} from "../../../utils/api";

mockUseTranslation()
mockApiObject()

jest.mock("../../../components/Preview/PDFViewer", () => ({
    PDFViewer: () => <div data-testid="pdf-viewer">Mock PDF Viewer</div>
}));

jest.mock("../../../hooks/useApi.ts", () => {
    return {
        useApi: () => mockUseApi,
    };
})

describe('Testing of StoredCardsPage ->', () => {
    let localStorageMock: {
        getItem: jest.Mock<string | null, [key: string]>;
        setItem: jest.Mock<void, [key: string, value: string]>
    };
    beforeEach(() => {
        jest.clearAllMocks();
        mockusei18n();
        localStorageMock = mockLocalStorage();

        localStorageMock.setItem('selectedLanguage', 'en');
        localStorageMock.setItem(KEYS.WALLET_ID, "faa0e18f-0935-4fab-8ab3-0c546c0ca714")
    });


    const mockCredentials = [
        {
            credentialId: 'cred-1',
            credentialTypeDisplayName: 'Drivers License',
            issuerDisplayName: 'DMV',
            credentialTypeLogo: 'logo1.png',
        },
        {
            credentialId: 'cred-2',
            credentialTypeDisplayName: 'Health Card',
            issuerDisplayName: 'Ministry of Health',
            credentialTypeLogo: 'logo2.png',
        },
    ];

    describe("Layout of StoredCardsPage", () => {
        it('check if the loading layout is matching with snapshot', () => {
            const {asFragment} = renderWithRouter(<StoredCardsPage/>);

            expect(asFragment()).toMatchSnapshot();
        });

        it('check if the "No credentials found" layout is matching with snapshot', async () => {
            mockApiResponse({data: []})

            const {asFragment} = renderWithRouter(<StoredCardsPage/>);
            await waitForLoaderDisappearance()

            expect(asFragment()).toMatchSnapshot();
        });

        it('should check if listing of credentials is matching snapshot', async () => {
            mockApiResponse({data: mockCredentials})

            const {asFragment} = renderWithRouter(<StoredCardsPage/>);
            await waitForLoaderDisappearance();

            expect(asFragment()).toMatchSnapshot();
        });

        it('should check if error while fetching credentials is matching snapshot', async () => {
            mockApiResponse({
                error: new Error('Network error'),
                status: null
            });

            const {asFragment} = renderWithRouter(<StoredCardsPage/>);
            await waitForLoaderDisappearance()

            expect(asFragment()).toMatchSnapshot();
        });
    })

    it('should navigate to home on nav back button click', () => {
        renderWithRouter(<StoredCardsPage/>);

        fireEvent.click(screen.getByTestId('back-arrow-icon'));

        expect(window.location.pathname).toBe('/user/home');
    });

    it('should navigate to home on Home text click', () => {
        renderWithRouter(<StoredCardsPage/>);

        fireEvent.click(screen.getByTestId('btn-home'));

        expect(window.location.pathname).toBe('/user/home');
    });

    it('should navigate to dashboard home when Add credential button is clicked in larger screens', () => {
        renderWithRouter(<StoredCardsPage/>);
        // In case of larger screens, the add cards button is inside the page title container
        const container = screen.getByTestId('page-title-container');
        const addCredentialButton = within(container).getByRole('button', {name: "Add Cards"});
        fireEvent.click(addCredentialButton);

        expect(window.location.pathname).toBe('/user/home');
    });

    it('should navigate to dashboard home when Add credential button in blank document is clicked in smaller screens', async () => {
        mockApiResponse({data: mockCredentials})

        renderWithRouter(<StoredCardsPage/>);
        await waitForLoaderDisappearance();
        // In case of smaller screens , the add cards button is inside the content and action container
        const container = screen.getByTestId('content-and-action-container');
        const addCardsButton = within(container).getByRole('button', {name: "Add Cards"});
        fireEvent.click(addCardsButton);

        expect(window.location.pathname).toBe('/user/home');
    });

    it('should show loading state initially', async () => {
        mockApiResponse({data: mockCredentials});

        renderWithRouter(<StoredCardsPage/>);

        expect(screen.getByTestId('loader-credentials')).toBeInTheDocument();
    });

    it('should display credentials when fetch is successful', async () => {
        mockApiResponse({data: mockCredentials})

        renderWithRouter(<StoredCardsPage/>);

        await waitForLoaderDisappearance();

        expect(screen.getByText('Drivers License')).toBeInTheDocument();
        expect(screen.getByText('Health Card')).toBeInTheDocument();
    });

    it('should display "No Cards Stored!" when no credentials are returned', async () => {
        mockApiResponse({data: []})

        renderWithRouter(<StoredCardsPage/>);
        await waitForLoaderDisappearance()

        expect(screen.getByText('No Cards Stored!')).toBeInTheDocument();
        expect(screen.getByText("You haven't downloaded any cards yet. Tap \"Add Cards\" to get started.")).toBeInTheDocument();
    });

    const errorScenarios = [
        {
            name: 'internal server error',
            fetchResponse: {
                status: 500,
                error: {response: {data: {errorMessage: 'Internal Server Error', errorCode: "internal_server_error"}}}
            },
            expectedTitle: 'Server Error',
            expectedMessage: 'Something went wrong on our end. Please try again later.'
        },
        {
            name: 'service unavailable',
            fetchResponse: {
                status: 503,
                error: {
                    response: {
                        data: {
                            errorMessage: 'service_unavailable',
                            errorCode: "Unavailable to connect to service"
                        }
                    }
                }
            },
            expectedTitle: 'Service Unavailable',
            expectedMessage: 'We\'re currently experiencing some issues processing your request. Please try again later'
        },
        {
            name: 'invalid wallet request - Wallet key not found in session',
            fetchResponse: {
                status: 400,
                error: {
                    response: {
                        data: {
                            errorMessage: 'Wallet key not found in session',
                            errorCode: "invalid_request"
                        }
                    }
                }
            },
            expectedTitle: "Something Went Wrong",
            expectedMessage: "We couldn’t verify your wallet information. Please try again later."
        },
        {
            name: 'invalid wallet request - Wallet is locked',
            fetchResponse: {
                status: 400,
                error: {response: {data: {errorMessage: 'Wallet is locked', errorCode: "invalid_request"}}}
            },
            expectedTitle: "Something Went Wrong",
            expectedMessage: "We couldn’t verify your wallet information. Please try again later."
        },
        {
            name: 'invalid wallet request - Invalid Wallet ID',
            fetchResponse: {
                status: 400,
                error: {
                    response: {
                        data: {
                            errorMessage: 'Invalid Wallet ID. Session and request Wallet ID do not match',
                            errorCode: "invalid_request"
                        }
                    }
                }
            },
            expectedTitle: "Something Went Wrong",
            expectedMessage: "We couldn’t verify your wallet information. Please try again later."
        },
        {
            name: 'invalid request',
            fetchResponse: {
                status: 400,
                error: {
                    response: {data: {errorMessage: 'Invalid request', errorCode: "invalid_request"}}
                }
            },
            expectedTitle: "Request Error",
            expectedMessage: "Your request contains invalid information. Please try again later."
        },
        {
            name: 'unknown error',
            fetchResponse: {
                status: 418,
                error: {errorMessage: 'I am a teapot'}
            },
            expectedTitle: "Something Went Wrong",
            expectedMessage: "An unexpected error occurred. Please refresh the page or try again shortly."
        }
    ];
    it.each(errorScenarios)('should display error message for $name', async ({
                                                                                 fetchResponse,
                                                                                 expectedTitle,
                                                                                 expectedMessage
                                                                             }) => {
        mockApiResponse({
            ...fetchResponse,
            state: RequestStatus.ERROR
        })

        renderWithRouter(<StoredCardsPage/>);
        await waitForLoaderDisappearance();

        await waitFor(() => {
            expect(screen.getByText(expectedTitle)).toBeInTheDocument()
        })
        expect(screen.getByTestId('error-helpText-stored-credentials')).toBeInTheDocument();
    });

    it('should redirect to root page when response is unAuthorized', () => {
        mockApiResponse({error: {isAxiosError: true, response: {data: {errorMessage: "Unauthorized"}}}, status: 401});

        renderWithRouter(<StoredCardsPage/>);

        expect(window.location.pathname).toBe('/');
    });

    it('should display network error message when network error occurs', async () => {
        const onlineMock = mockNavigatorOnline(false);
        mockApiResponse({error: {isAxiosError: true, message: 'Network Error', code: 'ERR_NETWORK'}, status: null});

        renderWithRouter(<StoredCardsPage/>);
        await waitForLoaderDisappearance();

        expect(screen.getByText("No Internet Connection")).toBeInTheDocument();
        expect(screen.getByText('Please check your internet connection and try again.')).toBeInTheDocument();

        // reset to original online status
        onlineMock.reset();
    });

    it('should display generic error message when any unknown error occurs', async () => {
        mockApiResponse({error: {isAxiosError: true, message: 'Network Error', code: 'ERR_NETWORK'}, status: null});

        renderWithRouter(<StoredCardsPage/>);
        await waitForLoaderDisappearance()

        expect(screen.getByText("Something Went Wrong")).toBeInTheDocument();
        expect(screen.getByText('An unexpected error occurred. Please refresh the page or try again shortly.')).toBeInTheDocument();
    });

    it('should filter credentials when using search bar', async () => {
        mockApiResponse({data: mockCredentials})

        renderWithRouter(<StoredCardsPage/>);
        await waitForLoaderDisappearance()

        const searchInput = screen.getByPlaceholderText('Search your cards by Name');
        fireEvent.change(searchInput, {target: {value: 'Health'}});

        expect(screen.getByText('Health Card')).toBeInTheDocument();
        expect(screen.queryByText('Drivers License')).not.toBeInTheDocument();
    });

    it('should display "No cards match your search" when search has no matches', async () => {
        mockApiResponse({data: mockCredentials})

        renderWithRouter(<StoredCardsPage/>);
        await waitForLoaderDisappearance()

        const searchInput = screen.getByPlaceholderText('Search your cards by Name');
        fireEvent.change(searchInput, {target: {value: 'Passport'}});

        expect(screen.getByText('No cards match your search.')).toBeInTheDocument();
    });

    it('should reset filtered credentials when search is cleared', async () => {
        mockApiResponse({data: mockCredentials})

        renderWithRouter(<StoredCardsPage/>);

        await waitForLoaderDisappearance()
        const searchInput = screen.getByPlaceholderText('Search your cards by Name');

        // Filter to just Health Card
        fireEvent.change(searchInput, {target: {value: 'Health'}});
        expect(screen.getByText('Health Card')).toBeInTheDocument();
        expect(screen.queryByText('Drivers License')).not.toBeInTheDocument();

        // Clear the filter
        fireEvent.change(searchInput, {target: {value: ''}});

        // Should show all credentials again
        expect(screen.getByText('Health Card')).toBeInTheDocument();
        expect(screen.getByText('Drivers License')).toBeInTheDocument();
    });

    it('should call download api when clicked on download icon in card', async () => {
        mockApiResponseSequence([{data: mockCredentials}, {
            data: new Blob(),
            headers: {get: () => 'attachment; filename="credential.pdf"'}
        }]);

        renderWithRouter(<StoredCardsPage/>);
        await waitForLoaderDisappearance()

        const downloadButton = screen.getAllByTestId('icon-download')[0];
        fireEvent.click(downloadButton);

        expect(mockUseApi.fetchData).toHaveBeenCalledWith(
            {
                apiConfig: api.downloadWalletCredentialPdf,
                url: expect.stringContaining("wallets/faa0e18f-0935-4fab-8ab3-0c546c0ca714/credentials/cred-1?action=download"),
                headers: {"Accept": "application/pdf", "Accept-Language": "en", "Content-Type": "application/json"}
            }
        );
    });

    it('should delete credential and call fetch all credentials api again when user deletes a card', async () => {
        mockApiResponseSequence([
            {data: mockCredentials},
            {
                data: {message: 'Credential deleted successfully'},
            },
            {data: [mockCredentials[1]]}
        ])

        renderWithRouter(<StoredCardsPage/>);
        await waitForLoaderDisappearance();

        let menu = screen.getAllByTestId("icon-three-dots-menu")[0];
        fireEvent.click(menu);
        expect(screen.getByRole("menu")).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('menu-item-delete'));
        fireEvent.click(screen.getByRole('button', {name: "Confirm"}));
        expect(mockUseApi.fetchData).toHaveBeenCalledWith(
            {
                url: expect.stringContaining("wallets/faa0e18f-0935-4fab-8ab3-0c546c0ca714/credentials/cred-1"),
                "headers": {"Content-Type": "application/json"},
                apiConfig: api.deleteWalletCredential,
            }
        );

        // Check if fetch for all credentials is called again
        expect(mockUseApi.fetchData).toHaveBeenCalledWith(
            expect.objectContaining({
                "headers": {"Content-Type": "application/json", "Accept-Language": "en"},
                apiConfig: api.fetchWalletVCs
            })
        );
        await waitFor(() =>
            expect(screen.queryByText('Drivers License')).not.toBeInTheDocument()
        )
        expect(screen.getByText('Health Card')).toBeInTheDocument();
    });

    async function waitForLoaderDisappearance() {
        await waitFor(() => {
            expect(screen.queryByTestId('loader-credentials')).not.toBeInTheDocument();
        });
    }
})
;