import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CredentialRequirementInfoModal from '../../modals/CredentialRequirementInfoModal';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('../../assets/TrustedIcon.svg', () => 'trusted-icon-mock.svg');
jest.mock('../../assets/unknown_verifier_logo.png', () => 'unknown-verifier-logo-mock.png');
jest.mock('../../assets/RedShield.svg', () => 'red-shield-mock.svg');
jest.mock('../../assets/GrayShield.svg', () => 'gray-shield-mock.svg');
jest.mock('../../assets/Shield-gray.svg', () => 'shield-gray-mock.svg');
jest.mock('../../assets/InfoLightIcon.svg', () => 'info-light-mock.svg');

jest.mock('../../modals/ModalWrapper', () => ({
    ModalWrapper: ({ content }: any) => <div data-testid="mock-modal-wrapper">{content}</div>,
}));

jest.mock('../../components/Common/Buttons/CloseIconButton', () => ({
    CloseIconButton: ({ onClick, btnTestId }: any) => (
        <button data-testid={btnTestId} onClick={onClick}>close</button>
    ),
}));

describe('CredentialRequirementInfoModal', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders the modal content', () => {
            render(<CredentialRequirementInfoModal onClose={mockOnClose} />);
            expect(screen.getByTestId('credential-requirement-info-modal')).toBeInTheDocument();
        });

        it('renders the close button', () => {
            render(<CredentialRequirementInfoModal onClose={mockOnClose} />);
            expect(screen.getByTestId('requirement-info-close-button')).toBeInTheDocument();
        });

        it('calls onClose when close button is clicked', () => {
            render(<CredentialRequirementInfoModal onClose={mockOnClose} />);
            fireEvent.click(screen.getByTestId('requirement-info-close-button'));
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('renders required section title', () => {
            render(<CredentialRequirementInfoModal onClose={mockOnClose} />);
            expect(screen.getByText('dcql.requirementInfo.requiredTitle')).toBeInTheDocument();
        });

        it('renders optional section title', () => {
            render(<CredentialRequirementInfoModal onClose={mockOnClose} />);
            expect(screen.getByText('dcql.requirementInfo.optionalTitle')).toBeInTheDocument();
        });

        it('renders required description', () => {
            render(<CredentialRequirementInfoModal onClose={mockOnClose} />);
            expect(screen.getByText('dcql.requirementInfo.requiredDescription')).toBeInTheDocument();
        });

        it('renders optional description', () => {
            render(<CredentialRequirementInfoModal onClose={mockOnClose} />);
            expect(screen.getByText('dcql.requirementInfo.optionalDescription')).toBeInTheDocument();
        });

        it('renders footer note', () => {
            render(<CredentialRequirementInfoModal onClose={mockOnClose} />);
            expect(screen.getByText('dcql.requirementInfo.footerNote')).toBeInTheDocument();
        });
    });

    describe('Verifier info', () => {
        it('renders unknown verifier name when verifier has no name', () => {
            render(<CredentialRequirementInfoModal onClose={mockOnClose} />);
            expect(screen.getByTestId('requirement-info-verifier-name')).toHaveTextContent('mainPage.unknownVerifier');
        });

        it('renders verifier name when provided', () => {
            render(
                <CredentialRequirementInfoModal
                    verifier={{ name: 'Test Bank', trusted: false }}
                    onClose={mockOnClose}
                />
            );
            expect(screen.getByTestId('requirement-info-verifier-name')).toHaveTextContent('Test Bank');
        });

        it('renders verifier logo when provided', () => {
            render(
                <CredentialRequirementInfoModal
                    verifier={{ logo: 'https://bank.com/logo.png' }}
                    onClose={mockOnClose}
                />
            );
            expect(screen.getByTestId('requirement-info-verifier-logo')).toHaveAttribute('src', 'https://bank.com/logo.png');
        });

        it('renders fallback logo when verifier has no logo', () => {
            render(<CredentialRequirementInfoModal onClose={mockOnClose} />);
            expect(screen.getByTestId('requirement-info-verifier-logo')).toHaveAttribute('src', 'unknown-verifier-logo-mock.png');
        });

        it('does not render trusted badge when verifier is not trusted', () => {
            render(
                <CredentialRequirementInfoModal
                    verifier={{ name: 'Test Bank', trusted: false }}
                    onClose={mockOnClose}
                />
            );
            expect(screen.queryByTestId('requirement-info-trusted-badge')).not.toBeInTheDocument();
        });

        it('renders trusted badge when verifier is trusted', () => {
            render(
                <CredentialRequirementInfoModal
                    verifier={{ name: 'Trusted Bank', trusted: true }}
                    onClose={mockOnClose}
                />
            );
            expect(screen.getByTestId('requirement-info-trusted-badge')).toBeInTheDocument();
        });

        it('renders trusted label text in badge', () => {
            render(
                <CredentialRequirementInfoModal
                    verifier={{ name: 'Trusted Bank', trusted: true }}
                    onClose={mockOnClose}
                />
            );
            expect(screen.getByTestId('requirement-info-trusted-badge')).toHaveTextContent('mainPage.trustedLabel');
        });
    });
});
