import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DcqlCredentialSets from '../../../components/Ovp/DcqlCredentialSets';
import { DcqlCredentialSet, DcqlQueryGroup } from '../../../types/dcql';
import { WalletCredential } from '../../../types/data';

jest.mock('../../../components/Ovp/CredentialSetSection', () => ({
    CredentialSetSection: ({ setIndex, showSectionHeader }: any) => (
        <div
            data-testid={`mock-credential-set-section-${setIndex}`}
            data-show-header={String(showSectionHeader)}
        />
    ),
}));

jest.mock('../../../components/Ovp/CredentialSetSectionHeader', () => ({
    CredentialSetSectionHeader: ({ required, testId }: any) => (
        <div
            data-testid={`mock-section-header-${testId}`}
            data-required={String(required)}
        />
    ),
}));

jest.mock('../../../components/Ovp/Dcql/DcqlInstructionBanner', () => ({
    DcqlInstructionBanner: () => <div data-testid="mock-instruction-banner" />,
}));

jest.mock('../../../utils/dcqlCredentialSetUtils', () => ({
    isCredentialSetSatisfied: jest.fn(() => false),
    updateCredentialSetSelectionForSet: jest.fn((setIndex: number, optionSelection: any, state: any) => ({
        ...state,
        [setIndex]: optionSelection,
    })),
}));

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

const makeCredentialSet = (required: boolean, queryIds: string[]): DcqlCredentialSet => ({
    required,
    options: queryIds.map((qid) => [qid]),
});

describe('DcqlCredentialSets', () => {
    const mockOnSelectionStateChange = jest.fn();

    const queryGroups = [makeQueryGroup('national-id'), makeQueryGroup('insurance')];

    const defaultProps = {
        credentialSets: [
            makeCredentialSet(true, ['national-id']),
            makeCredentialSet(false, ['insurance']),
        ],
        queryGroups,
        selectionState: {},
        onSelectionStateChange: mockOnSelectionStateChange,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the main container', () => {
        render(<DcqlCredentialSets {...defaultProps} />);
        expect(screen.getByTestId('dcql-credential-sets')).toBeInTheDocument();
    });

    it('renders the mandatory section when there are required sets', () => {
        render(<DcqlCredentialSets {...defaultProps} />);
        expect(screen.getByTestId('mandatory-credential-sets')).toBeInTheDocument();
    });

    it('renders mandatory section header', () => {
        render(<DcqlCredentialSets {...defaultProps} />);
        expect(screen.getByTestId('mock-section-header-mandatory-credential-sets')).toBeInTheDocument();
    });

    it('renders the instruction banner inside mandatory section', () => {
        render(<DcqlCredentialSets {...defaultProps} />);
        expect(screen.getByTestId('mock-instruction-banner')).toBeInTheDocument();
    });

    it('renders required credential set sections (embedded)', () => {
        render(<DcqlCredentialSets {...defaultProps} />);
        expect(screen.getByTestId('mock-credential-set-section-0')).toBeInTheDocument();
    });

    it('renders optional credential set sections', () => {
        render(<DcqlCredentialSets {...defaultProps} />);
        expect(screen.getByTestId('mock-credential-set-section-1')).toBeInTheDocument();
    });

    it('passes showSectionHeader=false to required sets (they share a parent header)', () => {
        render(<DcqlCredentialSets {...defaultProps} />);
        expect(screen.getByTestId('mock-credential-set-section-0')).toHaveAttribute('data-show-header', 'false');
    });

    it('passes showSectionHeader=true to optional sets', () => {
        render(<DcqlCredentialSets {...defaultProps} />);
        expect(screen.getByTestId('mock-credential-set-section-1')).toHaveAttribute('data-show-header', 'true');
    });

    it('does not render mandatory section when no required sets', () => {
        render(
            <DcqlCredentialSets
                {...defaultProps}
                credentialSets={[makeCredentialSet(false, ['insurance'])]}
            />
        );
        expect(screen.queryByTestId('mandatory-credential-sets')).not.toBeInTheDocument();
    });

    it('renders only optional sets when no required sets', () => {
        render(
            <DcqlCredentialSets
                {...defaultProps}
                credentialSets={[makeCredentialSet(false, ['insurance'])]}
            />
        );
        expect(screen.getByTestId('mock-credential-set-section-0')).toBeInTheDocument();
    });

    it('renders nothing when credentialSets is empty', () => {
        render(<DcqlCredentialSets {...defaultProps} credentialSets={[]} />);
        expect(screen.queryByTestId('mandatory-credential-sets')).not.toBeInTheDocument();
        expect(screen.queryByTestId(/mock-credential-set-section/)).not.toBeInTheDocument();
    });
});
