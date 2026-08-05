import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CredentialPreviewModal from '../../modals/CredentialPreviewModal';
import { WalletCredential } from '../../types/data';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en' },
    }),
}));

jest.mock('react-redux', () => ({
    useSelector: jest.fn(() => 'en'),
}));

jest.mock('../../utils/i18n', () => ({
    getDirCurrentLanguage: jest.fn(() => 'ltr'),
}));

const mockFetchData = jest.fn();
jest.mock('../../hooks/useApi', () => ({
    useApi: () => ({
        fetchData: mockFetchData,
    }),
}));

jest.mock('../../modals/ModalWrapper', () => ({
    ModalWrapper: ({ content }: any) => <div data-testid="mock-modal-wrapper">{content}</div>,
}));

jest.mock('../../components/Common/Buttons/CloseIconButton', () => ({
    CloseIconButton: ({ onClick, btnTestId }: any) => (
        <button data-testid={btnTestId} onClick={onClick}>close</button>
    ),
}));

jest.mock('../../components/Common/SpinningLoader', () => ({
    SpinningLoader: () => <div data-testid="mock-spinning-loader" />,
}));

jest.mock('../../components/Preview/PDFViewer', () => ({
    PDFViewer: () => <div data-testid="mock-pdf-viewer" />,
}));

jest.mock('../../utils/api', () => ({
    api: {
        fetchWalletCredentialPreview: {
            url: jest.fn((id: string) => `/preview/${id}`),
            headers: jest.fn((lang: string) => ({ 'Accept-Language': lang })),
        },
    },
}));

const makeCredential = (id = 'cred-1'): WalletCredential => ({
    credentialId: id,
    credentialTypeDisplayName: 'National ID',
    credentialTypeLogo: '/logo.png',
    issuerDisplayName: 'Issuer',
    issuerLogo: '/issuer-logo.png',
    format: 'ldp_vc',
});

describe('CredentialPreviewModal', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders the modal wrapper', () => {
            mockFetchData.mockResolvedValue({ ok: () => false });
            render(<CredentialPreviewModal credential={makeCredential()} onClose={mockOnClose} />);
            expect(screen.getByTestId('mock-modal-wrapper')).toBeInTheDocument();
        });

        it('renders modal content', async () => {
            mockFetchData.mockResolvedValue({ ok: () => false });
            await act(async () => {
                render(<CredentialPreviewModal credential={makeCredential()} onClose={mockOnClose} />);
            });
            expect(screen.getByTestId('credential-preview-modal')).toBeInTheDocument();
        });

        it('renders the credential display name as title', async () => {
            mockFetchData.mockResolvedValue({ ok: () => false });
            await act(async () => {
                render(<CredentialPreviewModal credential={makeCredential()} onClose={mockOnClose} />);
            });
            expect(screen.getByText('National ID')).toBeInTheDocument();
        });

        it('renders the close button', async () => {
            mockFetchData.mockResolvedValue({ ok: () => false });
            await act(async () => {
                render(<CredentialPreviewModal credential={makeCredential()} onClose={mockOnClose} />);
            });
            expect(screen.getByTestId('btn-close-credential-preview-modal')).toBeInTheDocument();
        });
    });

    describe('Loading state', () => {
        it('shows spinner while loading', async () => {
            let resolvePromise!: (value: any) => void;
            mockFetchData.mockReturnValue(
                new Promise((resolve) => {
                    resolvePromise = resolve;
                })
            );
            await act(async () => {
                render(<CredentialPreviewModal credential={makeCredential()} onClose={mockOnClose} />);
            });
            expect(screen.getByTestId('credential-preview-loading')).toBeInTheDocument();
            expect(screen.getByTestId('mock-spinning-loader')).toBeInTheDocument();

            await act(async () => {
                resolvePromise({ ok: () => false });
            });
        });
    });

    describe('Preview content', () => {
        it('renders PDF viewer when fetch succeeds', async () => {
            const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });
            mockFetchData.mockResolvedValue({ ok: () => true, data: mockBlob });
            await act(async () => {
                render(<CredentialPreviewModal credential={makeCredential()} onClose={mockOnClose} />);
            });
            expect(screen.getByTestId('mock-pdf-viewer')).toBeInTheDocument();
        });

        it('does not render previewUnavailable text when fetch returns non-ok response', async () => {
            mockFetchData.mockResolvedValue({ ok: () => false });
            await act(async () => {
                render(<CredentialPreviewModal credential={makeCredential()} onClose={mockOnClose} />);
            });
            expect(screen.queryByText('previewUnavailable')).not.toBeInTheDocument();
            expect(screen.getByTestId('credential-preview-panel')).toBeInTheDocument();
        });

        it('does not render previewUnavailable text when fetch throws', async () => {
            mockFetchData.mockRejectedValue(new Error('Network error'));
            await act(async () => {
                render(<CredentialPreviewModal credential={makeCredential()} onClose={mockOnClose} />);
            });
            expect(screen.queryByText('previewUnavailable')).not.toBeInTheDocument();
            expect(screen.getByTestId('credential-preview-panel')).toBeInTheDocument();
        });

    });

    describe('Close behaviour', () => {
        it('calls onClose when close button is clicked', async () => {
            mockFetchData.mockResolvedValue({ ok: () => false });
            await act(async () => {
                render(<CredentialPreviewModal credential={makeCredential()} onClose={mockOnClose} />);
            });
            fireEvent.click(screen.getByTestId('btn-close-credential-preview-modal'));
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    describe('Null credential', () => {
        it('renders without crashing when credential is null', async () => {
            await act(async () => {
                render(<CredentialPreviewModal credential={null} onClose={mockOnClose} />);
            });
            expect(screen.getByTestId('credential-preview-modal')).toBeInTheDocument();
        });

        it('does not call fetchData when credential is null', async () => {
            await act(async () => {
                render(<CredentialPreviewModal credential={null} onClose={mockOnClose} />);
            });
            expect(mockFetchData).not.toHaveBeenCalled();
        });
    });
});
