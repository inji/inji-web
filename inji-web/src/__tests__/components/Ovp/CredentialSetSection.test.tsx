import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CredentialSetSection } from '../../../components/Ovp/CredentialSetSection';
import { DcqlCredentialSet, DcqlQueryGroup } from '../../../types/dcql';
import { WalletCredential } from '../../../types/data';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

jest.mock('../../../components/Ovp/CredentialSetSectionHeader', () => ({
    CredentialSetSectionHeader: ({ required, testId }: any) => (
        <div data-testid={`mock-header-${testId}`} data-required={String(required)} />
    ),
}));

jest.mock('../../../components/Ovp/Dcql/DcqlQueryCredentials', () => ({
    DcqlQueryCredentials: ({ queryId }: any) => (
        <div data-testid={`mock-dcql-credentials-${queryId}`} />
    ),
}));

jest.mock('../../../components/Ovp/MultipleCardsSection', () => ({
    MultipleCardsSection: ({ children, testId, optionIndex }: any) => (
        <div data-testid={`mock-multiple-cards-${testId}-${optionIndex}`}>{children}</div>
    ),
}));

jest.mock('../../../modals/NoMatchingCredentialsModal', () => ({
    NoMatchingCredentialsModal: ({ isVisible }: any) =>
        isVisible ? <div data-testid="mock-no-matching-modal" /> : null,
}));

// Use the real utility functions (they are pure and have no side effects)


const makeCredential = (id: string): WalletCredential => ({
    credentialId: id,
    credentialTypeDisplayName: `Credential ${id}`,
    credentialTypeLogo: '/logo.png',
    issuerDisplayName: 'Issuer',
    issuerLogo: '/issuer-logo.png',
    format: 'ldp_vc',
});

const makeQueryGroup = (queryId: string): DcqlQueryGroup => ({
    queryId,
    required: true,
    multiple: false,
    availableCredentials: [makeCredential(`${queryId}-cred`)],
    missingClaims: [],
});

const credentialSet: DcqlCredentialSet = {
    required: true,
    options: [['national-id']],
};

describe('CredentialSetSection', () => {
    const mockOnOptionSelectionChange = jest.fn();

    const defaultProps = {
        credentialSet,
        setIndex: 0,
        queryGroups: [makeQueryGroup('national-id')],
        optionSelection: {},
        onOptionSelectionChange: mockOnOptionSelectionChange,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the section with correct testId', () => {
        render(<CredentialSetSection {...defaultProps} />);
        expect(screen.getByTestId('credential-set-0')).toBeInTheDocument();
    });

    it('renders the section header by default', () => {
        render(<CredentialSetSection {...defaultProps} />);
        expect(screen.getByTestId('mock-header-credential-set-0')).toBeInTheDocument();
    });

    it('does not render section header when showSectionHeader=false', () => {
        render(<CredentialSetSection {...defaultProps} showSectionHeader={false} />);
        expect(screen.queryByTestId('mock-header-credential-set-0')).not.toBeInTheDocument();
    });

    it('renders credential list for available credentials', () => {
        render(<CredentialSetSection {...defaultProps} />);
        expect(screen.getByTestId('mock-dcql-credentials-national-id')).toBeInTheDocument();
    });

    it('renders nothing when credentialSet has no satisfiable options', () => {
        render(
            <CredentialSetSection
                {...defaultProps}
                credentialSet={{ required: true, options: [] }}
            />
        );
        expect(screen.queryByText('dcql.noSatisfiableOptions')).not.toBeInTheDocument();
        expect(screen.queryByTestId('mock-dcql-credentials-national-id')).not.toBeInTheDocument();
    });

    it('renders embedded without section wrapper when embedInParentGrid=true', () => {
        render(<CredentialSetSection {...defaultProps} embedInParentGrid={true} />);
        expect(screen.queryByTestId('credential-set-0')).not.toBeInTheDocument();
        expect(screen.getByTestId('mock-dcql-credentials-national-id')).toBeInTheDocument();
    });

    describe('Multiple cards option', () => {
        it('renders MultipleCardsSection for options with >1 queryId', () => {
            const multiQueryGroups = [makeQueryGroup('national-id'), makeQueryGroup('insurance')];
            render(
                <CredentialSetSection
                    {...defaultProps}
                    queryGroups={multiQueryGroups}
                    credentialSet={{ required: true, options: [['national-id', 'insurance']] }}
                />
            );
            expect(screen.getByTestId('mock-multiple-cards-credential-set-0-0')).toBeInTheDocument();
        });
    });
});
