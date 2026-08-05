import React from 'react';
import {fireEvent, screen, waitFor, within} from '@testing-library/react';
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

        // Assert that menu has only 3 menu items
        const menu = screen.getByRole('menu');
        expect(within(menu).getAllByRole("menuitem")).toHaveLength(3);
        expect(screen.getByTestId("menu-mini-view-card")).toBeInTheDocument()
        assertMenuItem("View", "view");
        assertMenuItem("Download", "download");
        assertMenuItem("Delete", "delete");
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