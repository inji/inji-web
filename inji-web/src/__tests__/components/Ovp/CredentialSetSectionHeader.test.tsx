import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CredentialSetSectionHeader } from '../../../components/Ovp/CredentialSetSectionHeader';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('../../../assets/InfoRequired.svg', () => 'info-required-mock.svg');
jest.mock('../../../assets/InfoOptional.svg', () => 'info-optional-mock.svg');
jest.mock('../../../assets/SelectedTickIcon.svg', () => 'selected-tick-mock.svg');

jest.mock('../../../modals/CredentialRequirementInfoModal', () => ({
    __esModule: true,
    default: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="mock-requirement-info-modal">
            <button data-testid="mock-close-info" onClick={onClose}>Close</button>
        </div>
    ),
}));

describe('CredentialSetSectionHeader', () => {
    const defaultRequiredProps = {
        required: true,
        sectionSatisfied: false,
        testId: 'credential-set-0',
    };

    const defaultOptionalProps = {
        required: false,
        sectionSatisfied: false,
        optionalCount: 2,
        testId: 'credential-set-1',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Required section', () => {
        it('renders the header container', () => {
            render(<CredentialSetSectionHeader {...defaultRequiredProps} />);
            expect(screen.getByTestId('credential-set-0-header')).toBeInTheDocument();
        });

        it('renders mandatory cards translation key', () => {
            render(<CredentialSetSectionHeader {...defaultRequiredProps} />);
            expect(screen.getByText('dcql.mandatoryCards')).toBeInTheDocument();
        });

        it('renders required badge', () => {
            render(<CredentialSetSectionHeader {...defaultRequiredProps} />);
            expect(screen.getByTestId('credential-set-0-required-badge')).toBeInTheDocument();
        });

        it('renders required badge label', () => {
            render(<CredentialSetSectionHeader {...defaultRequiredProps} />);
            expect(screen.getByTestId('credential-set-0-required-badge')).toHaveTextContent('dcql.required');
        });

        it('does not render optional badge for required section', () => {
            render(<CredentialSetSectionHeader {...defaultRequiredProps} />);
            expect(screen.queryByTestId('credential-set-0-optional-badge')).not.toBeInTheDocument();
        });

        it('does not render clearAll button when showClearAll is false', () => {
            render(<CredentialSetSectionHeader {...defaultRequiredProps} showClearAll={false} />);
            expect(screen.queryByTestId('credential-set-0-clear-all')).not.toBeInTheDocument();
        });

        it('opens info modal when required badge is clicked', () => {
            render(<CredentialSetSectionHeader {...defaultRequiredProps} />);
            fireEvent.click(screen.getByTestId('credential-set-0-required-badge'));
            expect(screen.getByTestId('mock-requirement-info-modal')).toBeInTheDocument();
        });

        it('closes info modal when close is called', () => {
            render(<CredentialSetSectionHeader {...defaultRequiredProps} />);
            fireEvent.click(screen.getByTestId('credential-set-0-required-badge'));
            expect(screen.getByTestId('mock-requirement-info-modal')).toBeInTheDocument();
            fireEvent.click(screen.getByTestId('mock-close-info'));
            expect(screen.queryByTestId('mock-requirement-info-modal')).not.toBeInTheDocument();
        });
    });

    describe('Optional section', () => {
        it('renders optional add-ons translation key', () => {
            render(<CredentialSetSectionHeader {...defaultOptionalProps} />);
            expect(screen.getByText('dcql.optionalAddOns')).toBeInTheDocument();
        });

        it('renders optional badge', () => {
            render(<CredentialSetSectionHeader {...defaultOptionalProps} />);
            expect(screen.getByTestId('credential-set-1-optional-badge')).toBeInTheDocument();
        });

        it('renders optional badge label', () => {
            render(<CredentialSetSectionHeader {...defaultOptionalProps} />);
            expect(screen.getByTestId('credential-set-1-optional-badge')).toHaveTextContent('dcql.optionalSection');
        });

        it('does not render required badge for optional section', () => {
            render(<CredentialSetSectionHeader {...defaultOptionalProps} />);
            expect(screen.queryByTestId('credential-set-1-required-badge')).not.toBeInTheDocument();
        });

        it('does not render clearAll when showClearAll is false', () => {
            render(<CredentialSetSectionHeader {...defaultOptionalProps} showClearAll={false} />);
            expect(screen.queryByTestId('credential-set-1-clear-all')).not.toBeInTheDocument();
        });

        it('opens info modal when optional badge is clicked', () => {
            render(<CredentialSetSectionHeader {...defaultOptionalProps} />);
            fireEvent.click(screen.getByTestId('credential-set-1-optional-badge'));
            expect(screen.getByTestId('mock-requirement-info-modal')).toBeInTheDocument();
        });
    });

    describe('Clear All button', () => {
        const mockOnClearAll = jest.fn();

        it('renders clearAll button when showClearAll is true', () => {
            render(
                <CredentialSetSectionHeader
                    {...defaultOptionalProps}
                    showClearAll={true}
                    onClearAll={mockOnClearAll}
                />
            );
            expect(screen.getByTestId('credential-set-1-clear-all')).toBeInTheDocument();
        });

        it('calls onClearAll when clearAll button is clicked', () => {
            render(
                <CredentialSetSectionHeader
                    {...defaultOptionalProps}
                    showClearAll={true}
                    onClearAll={mockOnClearAll}
                />
            );
            fireEvent.click(screen.getByTestId('credential-set-1-clear-all'));
            expect(mockOnClearAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('Verifier prop', () => {
        it('passes verifier to CredentialRequirementInfoModal', () => {
            const verifier = { name: 'Test Bank', trusted: true };
            render(
                <CredentialSetSectionHeader
                    {...defaultRequiredProps}
                    verifier={verifier}
                />
            );
            fireEvent.click(screen.getByTestId('credential-set-0-required-badge'));
            expect(screen.getByTestId('mock-requirement-info-modal')).toBeInTheDocument();
        });
    });
});
