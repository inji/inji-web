import React from 'react';
import {act, fireEvent, screen, waitFor, within} from '@testing-library/react';
import {WalletCredential} from '../../../types/data';
import {VCCardView} from '../../../components/VC/VCCardView';
import {
    mockLocalStorage,
    mockusei18n,
    mockUseTranslation,
    renderWithProvider,
    setupShowToastMock
} from "../../../test-utils/mockUtils";
import {setMockUseSelectorState} from '../../../test-utils/mockReactRedux';
import {KEYS, RequestStatus} from "../../../utils/constants";
import {mockVerifiableCredentials} from "../../../test-utils/mockObjects";
import {mockApiResponse, mockUseApi} from "../../../test-utils/setupUseApiMock";
import {api} from "../../../utils/api";
import {formatLastCheckedAt} from "../../../utils/dateUtils";
import {CredentialCardActionsProvider} from "../../../components/VC/CredentialCardActionsLock";
import {reduxStore} from "../../../redux/reduxStore";
import {storeLanguage} from "../../../redux/reducers/commonReducer";

jest.mock('react-toastify', () => {
    return {
        toast: {
            warning: jest.fn(),
            error: jest.fn(),
        },
        ToastContainer: () => <div data-testid="toast-wrapper"/>
    };
});

jest.mock('../../../hooks/useApi', () => ({
    useApi: () => mockUseApi
}))

jest.mock('../../../components/Common/toast/ToastWrapper', () => ({
    showToast: jest.fn()
}));

jest.mock("../../../components/VC/VCDetailView", () => ({
    VCDetailView: ({previewContent, onDownload, onClose, credential}: {
        previewContent: Blob,
        onClose: () => void,
        onDownload: () => Promise<void>,
        credential: WalletCredential
    }) => {
        if (!previewContent) {
            return null;
        }
        const content = "Name:Simon";
        return (<div data-testid="vc-detail-view">
            <title>{credential.credentialTypeDisplayName}</title>
            <div>{content}</div>
            <button onClick={onClose}>Close</button>
            <button onClick={onDownload}>download</button>
        </div>)
    }
}));

describe('VCCardView Component', () => {
    const mockCredential: WalletCredential = mockVerifiableCredentials[0]
    let localStorageMock
    let refreshCredentialsMock: jest.Mock
    let toastMock: { assertShowToastCalled: any; };

    const mockObjectUrl = 'Name:Simon';

    // Save the original implementation
    const originalCreateObjectURL = URL.createObjectURL;

    afterAll(() => {
        // Restore the original implementation
        URL.createObjectURL = originalCreateObjectURL;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseTranslation()
        mockusei18n();

        URL.createObjectURL = jest.fn(() => mockObjectUrl);

        setMockUseSelectorState({
            common: {
                language: 'en',
            },
        });
        reduxStore.dispatch(storeLanguage('en'));

        localStorageMock = mockLocalStorage();
        localStorageMock.setItem(KEYS.WALLET_ID, "faa0e18f-0935-4fab-8ab3-0c546c0ca714")

        refreshCredentialsMock = jest.fn();
        toastMock = setupShowToastMock()
    });

    it('should match snapshot', () => {
        const {asFragment} = renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it('should render with correct credential information', () => {
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        expect(screen.getByTestId("vc-card-view")).toBeInTheDocument();
        const logo = screen.getByTestId('issuer-logo');
        const name = screen.getByTestId('credential-type-display-name');
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute('src', 'logo1.png');
        expect(logo).toHaveAttribute('alt', 'Credential Type Logo');
        expect(name).toBeInTheDocument();
        expect(name).toHaveTextContent('Drivers License');
    });

    //Preview of Card

    it('should call download api when clicked on card for previewing VC', () => {
        mockApiResponse({
            data: new Blob(),
            headers: {"Content-Disposition": 'attachment; filename="credential.pdf"'},
        })
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        // Simulate clicking on the card
        const card = screen.getByRole('menuitem');
        fireEvent.click(card);

        expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
    });

    it('should call download api when pressing enter key for previewing VC', () => {
        mockApiResponse({
            data: new Blob(),
            headers: {"Content-Disposition": 'attachment; filename="credential.pdf"'},
        })
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        const card = screen.getByRole('menuitem');
        fireEvent.keyDown(card, {key: 'Enter'});

        expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
        expect(mockUseApi.fetchData).toHaveBeenCalledWith(
            {
                apiConfig: api.fetchWalletCredentialPreview,
                url: expect.stringContaining("wallets/faa0e18f-0935-4fab-8ab3-0c546c0ca714/credentials/cred-1?action=inline"),
                headers: expect.objectContaining({
                    "Accept": "application/pdf",
                    "Accept-Language": "en",
                    "Content-Type": "application/json",
                })
            }
        );
    });

    it('should not call download api when pressing key other than enter key', () => {
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        const card = screen.getByRole('menuitem');
        fireEvent.keyDown(card, {key: '1'});

        expect(mockUseApi.fetchData).not.toBeCalled()
    });

    it('should call download api when download icon is clicked', () => {
        mockApiResponse({
            data: new Blob(),
            headers: {"Content-Disposition": 'attachment; filename="credential.pdf"'}
        });
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        const downloadIcon = screen.getByTestId('icon-download');
        fireEvent.click(downloadIcon);

        expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
        expect(mockUseApi.fetchData).toHaveBeenCalledWith(
            {
                apiConfig: api.downloadWalletCredentialPdf,
                url: expect.stringContaining("wallets/faa0e18f-0935-4fab-8ab3-0c546c0ca714/credentials/cred-1?action=download"),
                headers: expect.objectContaining({
                    "Accept": "application/pdf",
                    "Accept-Language": "en",
                    "Content-Type": "application/json",
                })
            }
        );
    })

    it("should show error when preview fails", async () => {
        mockApiResponse({
            error: {response: {data: {"errorMessage": "Internal Server Error"}}},
            status: 500,
            state: RequestStatus.ERROR
        })

        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        const threeDotsMenu = screen.getByTestId('icon-three-dots-menu');
        fireEvent.click(threeDotsMenu);

        const viewOption = screen.getByTestId('menu-item-view');
        fireEvent.click(viewOption);

        await waitFor(() => toastMock.assertShowToastCalled({
            message: 'Download failed. Please retry.',
            type: 'error',
            testId: 'download-failure'
        }))
    });

    it('should redirect to root page when user clicks on preview an unauthorized access is detetected', () => {
        mockApiResponse({state: RequestStatus.ERROR, status: 401})

        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        const card = screen.getByTestId("vc-card-view");
        fireEvent.click(card);

        expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
        expect(window.location.href).toBe("http://localhost/");
    });

    it("should show the content given by the preview API when clicked on the card", async () => {
        mockApiResponse({
            data: new Blob(['{"Name": "John"}'], {type: "application/pdf"}),
            headers: {"Content-Disposition": 'attachment; filename="credential.pdf"'}
        })

        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        const card = screen.getByTestId("vc-card-view");
        fireEvent.click(card);
        expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);

        await screen.findByTestId("vc-detail-view")
        await waitFor(() => {
            expect(screen.getByText("Name:Simon")).toBeInTheDocument()
        })
    })

    it('should refetch preview with updated Accept-Language when language changes while preview is open', async () => {
        const actualRedux = jest.requireActual('react-redux');
        const {useSelector} = require('react-redux') as {useSelector: jest.Mock};
        useSelector.mockImplementation(actualRedux.useSelector);

        mockApiResponse({
            data: new Blob(['pdf-en'], {type: "application/pdf"}),
            headers: {"Content-Disposition": 'attachment; filename="credential.pdf"'}
        });
        mockApiResponse({
            data: new Blob(['pdf-fr'], {type: "application/pdf"}),
            headers: {"Content-Disposition": 'attachment; filename="credential.pdf"'}
        });

        reduxStore.dispatch(storeLanguage('en'));

        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        fireEvent.click(screen.getByTestId("vc-card-view"));
        await screen.findByTestId("vc-detail-view");
        expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);

        reduxStore.dispatch(storeLanguage('fr'));

        await waitFor(() => {
            expect(mockUseApi.fetchData).toHaveBeenCalledTimes(2);
        });
        expect(mockUseApi.fetchData).toHaveBeenLastCalledWith(
            expect.objectContaining({
                apiConfig: api.fetchWalletCredentialPreview,
                headers: expect.objectContaining({
                    "Accept-Language": "fr",
                }),
            })
        );
    });

    it('should not refetch preview when language changes if preview is closed', () => {
        const actualRedux = jest.requireActual('react-redux');
        const {useSelector} = require('react-redux') as {useSelector: jest.Mock};
        useSelector.mockImplementation(actualRedux.useSelector);

        reduxStore.dispatch(storeLanguage('en'));

        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        reduxStore.dispatch(storeLanguage('fr'));

        expect(mockUseApi.fetchData).not.toHaveBeenCalled();
    });

    it('should ignore in-flight preview response after preview is closed', async () => {
        const actualRedux = jest.requireActual('react-redux');
        const {useSelector} = require('react-redux') as {useSelector: jest.Mock};
        useSelector.mockImplementation(actualRedux.useSelector);

        mockApiResponse({
            data: new Blob(['pdf-en'], {type: "application/pdf"}),
            headers: {"Content-Disposition": 'attachment; filename="credential.pdf"'}
        });

        let resolveLanguagePreview: (value: unknown) => void;
        const languagePreviewPromise = new Promise((resolve) => {
            resolveLanguagePreview = resolve;
        });

        reduxStore.dispatch(storeLanguage('en'));
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        fireEvent.click(screen.getByTestId("vc-card-view"));
        await screen.findByTestId("vc-detail-view");

        mockUseApi.fetchData.mockReturnValueOnce(languagePreviewPromise);
        reduxStore.dispatch(storeLanguage('fr'));

        await waitFor(() => {
            expect(mockUseApi.fetchData).toHaveBeenCalledTimes(2);
        });

        fireEvent.click(screen.getByRole('button', {name: 'Close'}));
        expect(screen.queryByTestId("vc-detail-view")).not.toBeInTheDocument();

        resolveLanguagePreview!({
            ok: () => true,
            data: new Blob(['pdf-fr'], {type: "application/pdf"}),
            status: 200,
            error: null,
            headers: {},
            state: RequestStatus.DONE
        });

        await waitFor(() => {
            expect(screen.queryByTestId("vc-detail-view")).not.toBeInTheDocument();
        });
    });

    it("should show error when download fails", async () => {
        mockApiResponse({state: RequestStatus.ERROR, status: 500})

        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        const downloadIcon = screen.getByTestId('icon-download');
        fireEvent.click(downloadIcon);

        await waitFor(() => toastMock.assertShowToastCalled({
            message: 'Download failed. Please retry.',
            type: 'error',
            testId: 'download-failure'
        }))
    })

    it('should redirect to root page when user downloads card but response is unauthorized', () => {
        mockApiResponse({state: RequestStatus.ERROR, status: 401})

        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        const downloadIcon = screen.getByTestId('icon-download');
        fireEvent.click(downloadIcon);

        expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
        expect(window.location.href).toBe("http://localhost/");
    });

    // Tests for menu interactions

    it('should open three dots menu with the relevant option when clicked on 3 dots menu', () => {
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        const threeDotsMenu = screen.getByTestId('icon-three-dots-menu');
        fireEvent.click(threeDotsMenu);

        const menu = screen.getByRole('menu');
        expect(within(menu).getAllByRole("menuitem")).toHaveLength(4);
        expect(screen.getByTestId("menu-mini-view-card")).toBeInTheDocument()
        assertMenuItem("View", "view");
        assertMenuItem("Download", "download");
        assertMenuItem("Check Card Status", "check-status");
        assertMenuItem("Delete", "delete");
    });

    it('should show valid status and check status when there is no status list', () => {
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={{
                    ...mockCredential,
                    statusChecks: [],
                    lastCheckedAt: "2026-11-25T05:09:11.190114Z",
                    isExpired: false,
                }}
            />
        );

        expect(screen.getByTestId("credential-status-label")).toHaveTextContent("Valid");
        expect(screen.getByTestId("credential-last-checked")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("icon-three-dots-menu"));
        const menu = screen.getByRole("menu");
        expect(within(menu).getAllByRole("menuitem")).toHaveLength(4);
        assertMenuItem("Check Card Status", "check-status");
    });

    it('should show revoked status without an info icon', () => {
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={{
                    ...mockCredential,
                    statusChecks: [{purpose: "revocation", valid: false}],
                    lastCheckedAt: "2025-10-12T17:00:00.000Z",
                }}
            />
        );

        expect(screen.getByTestId("credential-status-label")).toHaveTextContent("Revoked");
        expect(screen.getByTestId("credential-status-icon")).toHaveStyle({backgroundColor: "#DC2626"});
        expect(screen.getByTestId("credential-status-icon").querySelector("img")).toHaveAttribute("src", "revoked.svg");
        expect(screen.getByTestId("credential-status-info")).toBeInTheDocument();
        expect(screen.getByTestId("credential-last-checked")).toHaveTextContent(
            `Last Checked: ${formatLastCheckedAt("2025-10-12T17:00:00.000Z")}`
        );
    });

    it('should show pending status when lastCheckedAt is null', () => {
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={{
                    ...mockCredential,
                    statusChecks: [],
                    lastCheckedAt: null,
                    isExpired: false,
                }}
            />
        );

        expect(screen.getByTestId("credential-status-label")).toHaveTextContent("Pending");
        expect(screen.getByTestId("credential-status-icon")).toHaveStyle({backgroundColor: "#EAB308"});
        expect(screen.getByTestId("credential-status-icon").querySelector("img")).toHaveAttribute("src", "pending.svg");
        expect(screen.queryByTestId("credential-last-checked")).not.toBeInTheDocument();
        fireEvent.click(screen.getByTestId("icon-three-dots-menu"));
        expect(screen.getByTestId("menu-item-check-status")).toBeInTheDocument();
    });

    it('should show suspended status when a suspension check failed', () => {
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={{
                    ...mockCredential,
                    statusChecks: [{purpose: "suspension", valid: false}],
                    lastCheckedAt: "2025-10-12T17:00:00.000Z",
                }}
            />
        );

        expect(screen.getByTestId("credential-status-label")).toHaveTextContent("Suspended");
        expect(screen.getByTestId("credential-status-icon")).toHaveStyle({backgroundColor: "#EAB308"});
        expect(screen.getByTestId("credential-status-icon").querySelector("img")).toHaveAttribute("src", "pending.svg");
    });

    it('should show expired status when isExpired is true and the credential is not revoked or suspended', () => {
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={{
                    ...mockCredential,
                    statusChecks: [{purpose: "revocation", valid: true}],
                    isExpired: true,
                    lastCheckedAt: "2025-10-12T17:00:00.000Z",
                }}
            />
        );

        expect(screen.getByTestId("credential-status-label")).toHaveTextContent("Expired");
        expect(screen.getByTestId("credential-status-icon")).toHaveStyle({backgroundColor: "#EA580C"});
        expect(screen.getByTestId("credential-status-icon").querySelector("img")).toHaveAttribute("src", "close.svg");
    });

    it('should show valid status with an info icon', () => {
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={{
                    ...mockCredential,
                    statusChecks: [{purpose: "valid", valid: true}],
                    lastCheckedAt: "2025-10-20T13:00:00.908173200Z",
                }}
            />
        );

        expect(screen.getByTestId("credential-status-label")).toHaveTextContent("Valid");
        expect(screen.getByTestId("credential-status-icon")).toHaveStyle({backgroundColor: "#16A34A"});
        expect(screen.getByTestId("credential-status-icon").querySelector("img")).toHaveAttribute("src", "SelectedTickIcon.svg");
        expect(screen.getByTestId("credential-status").firstElementChild).toHaveClass("min-w-[108px]");
        fireEvent.mouseEnter(screen.getByTestId("credential-status-info"));
        expect(screen.queryByTestId("credential-status-information")).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId("credential-status-info"));
        expect(screen.getByTestId("credential-status-information")).toHaveTextContent("Status Information");
        expect(screen.getByTestId("credential-status-information-arrow")).toBeInTheDocument();
        const popup = screen.getByTestId("credential-status-information");
        expect(popup).toHaveTextContent("The card is active and can be used or shared.");
        expect(popup).toHaveTextContent("Pending");
        expect(popup).toHaveTextContent("The card status cannot be verified right now.");
        expect(popup).toHaveTextContent("The card is no longer valid because its validity period has ended.");
        expect(popup).toHaveTextContent("The card has been temporarily suspended by the issuer. It can still be shared, but services from the verifier cannot be accessed using this card.");
        expect(popup).toHaveTextContent("The card has been permanently revoked by the issuer. It can still be shared, but services from the verifier cannot be accessed using this card.");
        expect(screen.getByTestId("credential-status-popup-icon-valid").querySelector("img")).toHaveAttribute("src", "SelectedTickIcon.svg");
        expect(screen.getByTestId("credential-status-popup-icon-pending").querySelector("img")).toHaveAttribute("src", "pending.svg");
        expect(screen.getByTestId("credential-status-popup-icon-expired").querySelector("img")).toHaveAttribute("src", "close.svg");
        expect(screen.getByTestId("credential-status-popup-icon-suspended").querySelector("img")).toHaveAttribute("src", "pending.svg");
        expect(screen.getByTestId("credential-status-popup-icon-revoked").querySelector("img")).toHaveAttribute("src", "revoked.svg");

        fireEvent.mouseLeave(screen.getByTestId("credential-status-info"));
        expect(screen.getByTestId("credential-status-information")).toBeInTheDocument();

        fireEvent.mouseDown(document.body);
        expect(screen.queryByTestId("credential-status-information")).not.toBeInTheDocument();
    });

    it('should close the open status popup when another card info icon is clicked', () => {
        const credential = {
            ...mockCredential,
            statusChecks: [{purpose: "valid", valid: true}],
            lastCheckedAt: "2025-10-20T13:00:00.000Z",
        };
        renderWithProvider(
            <>
                <VCCardView refreshCredentials={refreshCredentialsMock} credential={credential}/>
                <VCCardView
                    refreshCredentials={refreshCredentialsMock}
                    credential={{...credential, credentialId: "cred-2"}}
                />
            </>
        );

        const infoButtons = screen.getAllByTestId("credential-status-info");
        fireEvent.click(infoButtons[0]);
        expect(screen.getAllByTestId("credential-status-information")).toHaveLength(1);

        fireEvent.click(infoButtons[1]);
        expect(screen.getAllByTestId("credential-status-information")).toHaveLength(1);

        fireEvent.click(infoButtons[1]);
        expect(screen.queryByTestId("credential-status-information")).not.toBeInTheDocument();
    });

    it('should not open the card preview when the status info icon is clicked', () => {
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={{
                    ...mockCredential,
                    statusChecks: [{purpose: "status", valid: true}],
                    lastCheckedAt: "2025-10-20T13:00:00.000Z",
                }}
            />
        );

        fireEvent.click(screen.getByTestId("credential-status-info"));

        expect(mockUseApi.fetchData).not.toHaveBeenCalled();
    });

    it('should check card status and update the badge', async () => {
        const onStatusUpdated = jest.fn();
        const updatedStatus = {
            credentialId: mockCredential.credentialId,
            statusChecks: [{purpose: "valid", valid: true}],
            lastCheckedAt: "2025-10-20T13:00:00.000Z",
        };
        mockApiResponse({data: updatedStatus, status: 200});

        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                onStatusUpdated={onStatusUpdated}
                credential={{
                    ...mockCredential,
                    statusChecks: [{purpose: "revocation", valid: false}],
                    lastCheckedAt: "2025-10-12T17:00:00.000Z",
                }}
            />
        );

        fireEvent.click(screen.getByTestId("icon-three-dots-menu"));
        fireEvent.click(screen.getByTestId("menu-item-check-status"));

        await waitFor(() => {
            expect(screen.getByTestId("credential-status-label")).toHaveTextContent("Valid");
        });
        expect(mockUseApi.fetchData).toHaveBeenCalledWith({
            apiConfig: api.fetchWalletCredentialStatus,
            url: expect.stringContaining("wallets/faa0e18f-0935-4fab-8ab3-0c546c0ca714/credentials/cred-1/status"),
            headers: expect.objectContaining({
                "Accept-Language": "en",
                "Content-Type": "application/json",
            }),
        });
        expect(onStatusUpdated).toHaveBeenCalledWith(mockCredential.credentialId, updatedStatus);
        expect(screen.getByTestId("credential-last-checked")).toHaveTextContent(
            `Last Checked: ${formatLastCheckedAt(updatedStatus.lastCheckedAt)}`
        );
    });

    it('should show the spinning loader in place of the status while a check is in progress', async () => {
        let resolveStatus: (value: unknown) => void = () => undefined;
        mockUseApi.fetchData.mockImplementationOnce(() => new Promise((resolve) => {
            resolveStatus = resolve;
        }));

        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={{
                    ...mockCredential,
                    statusChecks: [{purpose: "revocation", valid: false}],
                    lastCheckedAt: "2025-10-12T17:00:00.000Z",
                }}
            />
        );

        fireEvent.click(screen.getByTestId("icon-three-dots-menu"));
        fireEvent.click(screen.getByTestId("menu-item-check-status"));

        expect(screen.getByTestId("credential-status-loader")).toHaveTextContent("Loading Status");
        expect(screen.getByTestId("credential-status-loader").querySelector("svg")).toHaveClass("animate-spin");
        expect(screen.queryByTestId("credential-status-label")).not.toBeInTheDocument();
        expect(screen.getByTestId("credential-last-checked")).toBeInTheDocument();
        expect(screen.getByTestId("icon-mini-view-card-menu")).toBeDisabled();
        expect(screen.getByTestId("icon-download")).toHaveStyle({color: "var(--iw-color-grayLight)"});

        await act(async () => {
            resolveStatus({
                ok: () => true,
                data: {
                    credentialId: mockCredential.credentialId,
                    statusChecks: [{purpose: "valid", valid: true}],
                    lastCheckedAt: "2025-10-20T13:00:00.000Z",
                },
                status: 200,
                error: null,
                headers: {},
                state: RequestStatus.DONE,
            });
        });

        await waitFor(() => {
            expect(screen.getByTestId("credential-status-label")).toHaveTextContent("Valid");
        });
        expect(screen.queryByTestId("credential-status-loader")).not.toBeInTheDocument();
        expect(screen.getByTestId("icon-mini-view-card-menu")).toBeEnabled();
        expect(screen.getByTestId("icon-download")).toHaveStyle({color: "var(--iw-color-grayMedium)"});
    });

    it('should disable action buttons on every card while one card action is in progress', async () => {
        let resolveStatus: (value: unknown) => void = () => undefined;
        mockUseApi.fetchData.mockImplementationOnce(() => new Promise((resolve) => {
            resolveStatus = resolve;
        }));

        const otherCredential = {
            ...mockCredential,
            credentialId: "cred-2",
            credentialTypeDisplayName: "Health Insurance",
        };

        renderWithProvider(
            <CredentialCardActionsProvider>
                <VCCardView
                    refreshCredentials={refreshCredentialsMock}
                    credential={{
                        ...mockCredential,
                        statusChecks: [{purpose: "revocation", valid: true}],
                        lastCheckedAt: "2025-10-12T17:00:00.000Z",
                    }}
                />
                <VCCardView
                    refreshCredentials={refreshCredentialsMock}
                    credential={otherCredential}
                />
            </CredentialCardActionsProvider>
        );

        fireEvent.click(screen.getAllByTestId("icon-three-dots-menu")[0]);
        fireEvent.click(screen.getByTestId("menu-item-check-status"));

        const menuButtons = screen.getAllByTestId("icon-mini-view-card-menu");
        const downloadButtons = screen.getAllByTestId("icon-download");
        expect(menuButtons).toHaveLength(2);
        menuButtons.forEach((button) => expect(button).toBeDisabled());
        downloadButtons.forEach((button) => expect(button).toHaveStyle({color: "var(--iw-color-grayLight)"}));

        await act(async () => {
            resolveStatus({
                ok: () => true,
                data: {
                    credentialId: mockCredential.credentialId,
                    statusChecks: [{purpose: "revocation", valid: true}],
                    lastCheckedAt: "2025-10-20T13:00:00.000Z",
                },
                status: 200,
                error: null,
                headers: {},
                state: RequestStatus.DONE,
            });
        });

        await waitFor(() => {
            screen.getAllByTestId("icon-mini-view-card-menu").forEach((button) => expect(button).toBeEnabled());
        });
        screen.getAllByTestId("icon-download").forEach((button) => {
            expect(button).toHaveStyle({color: "var(--iw-color-grayMedium)"});
        });
    });

    it('should show an error when checking card status fails', async () => {
        mockApiResponse({state: RequestStatus.ERROR, status: 500});

        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={{
                    ...mockCredential,
                    statusChecks: [{purpose: "valid", valid: true}],
                    lastCheckedAt: "2025-10-20T13:00:00.000Z",
                }}
            />
        );

        fireEvent.click(screen.getByTestId("icon-three-dots-menu"));
        fireEvent.click(screen.getByTestId("menu-item-check-status"));

        await waitFor(() => toastMock.assertShowToastCalled({
            message: "Failed to check card status. Please retry.",
            type: "error",
            testId: "status-failure",
        }));
    });

    it('should call delete API when clicked on delete option in delete menu and confirmed it', () => {
        mockApiResponse()
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        const threeDotsMenu = screen.getByTestId('icon-three-dots-menu');
        fireEvent.click(threeDotsMenu);

        const deleteOption = screen.getByTestId('menu-item-delete');
        fireEvent.click(deleteOption);
        const confirmButton = screen.getByRole('button', {name: 'Confirm'});
        fireEvent.click(confirmButton);

        expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
        expect(mockUseApi.fetchData).toHaveBeenCalledWith(
            {
                url: expect.stringContaining("wallets/faa0e18f-0935-4fab-8ab3-0c546c0ca714/credentials/cred-1"),
                headers: {"Content-Type": "application/json"},
                apiConfig: api.deleteWalletCredential,
            }
        );
    });

    it('should call refresh credentials method from prop post deletion of VC', async () => {
        mockApiResponse({data: {}, status: 200,});
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        const threeDotsMenu = screen.getByTestId('icon-three-dots-menu');
        fireEvent.click(threeDotsMenu);

        const deleteOption = screen.getByTestId('menu-item-delete');
        fireEvent.click(deleteOption);
        const confirmButton = screen.getByRole('button', {name: 'Confirm'});
        fireEvent.click(confirmButton);
        expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);

        await waitFor(() =>
            expect(refreshCredentialsMock).toHaveBeenCalledTimes(1)
        )
    });

    it('should not call delete API when clicked on delete option in delete menu and cancelled it', () => {
        mockApiResponse()
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        const threeDotsMenu = screen.getByTestId('icon-three-dots-menu');
        fireEvent.click(threeDotsMenu);

        const deleteOption = screen.getByTestId('menu-item-delete');
        fireEvent.click(deleteOption);
        const cancelButton = screen.getByRole('button', {name: 'Cancel'});
        fireEvent.click(cancelButton);

        expect(mockUseApi.fetchData).not.toBeCalled()
    });

    it("should show error when delete fails", async () => {
        mockApiResponse({state: RequestStatus.ERROR, status: 500})
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        const threeDotsMenu = screen.getByTestId('icon-three-dots-menu');
        fireEvent.click(threeDotsMenu);

        const deleteOption = screen.getByTestId('menu-item-delete');
        fireEvent.click(deleteOption);
        const confirmButton = screen.getByRole('button', {name: 'Confirm'});
        fireEvent.click(confirmButton);

        await waitFor(() => toastMock.assertShowToastCalled({
            message: 'Failed to delete. Try again.',
            type: 'error',
            testId: 'delete-failure'
        }))
    });

    it('should redirect to root page when user deletes card but response is unauthorized access', () => {
        mockApiResponse({state: RequestStatus.ERROR, status: 401})
        renderWithProvider(
            <VCCardView
                refreshCredentials={refreshCredentialsMock}
                credential={mockCredential}
            />
        );

        const threeDotsMenu = screen.getByTestId('icon-three-dots-menu');
        fireEvent.click(threeDotsMenu);

        const deleteOption = screen.getByTestId('menu-item-delete');
        fireEvent.click(deleteOption);
        const confirmButton = screen.getByRole('button', {name: 'Confirm'});
        fireEvent.click(confirmButton);

        expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1);
        expect(window.location.href).toBe("http://localhost/");
    });

    function assertMenuItem(text: string, testId: string) {
        expect(screen.getByText(text)).toBeInTheDocument();
        let menuOption = screen.getByTestId(`menu-item-${testId}`);
        expect(within(menuOption).getByTestId(`label-${testId}`)).toBeInTheDocument();
        expect(menuOption).toBeInTheDocument();
        expect(menuOption).toHaveRole("menuitem")
    }
});