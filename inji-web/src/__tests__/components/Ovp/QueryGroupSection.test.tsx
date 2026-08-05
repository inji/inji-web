import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryGroupSection } from '../../../components/Ovp/QueryGroupSection';
import { DcqlQueryGroup } from '../../../types/dcql';
import { WalletCredential } from '../../../types/data';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

jest.mock('../../../components/Ovp/QueryGroupCredentialList', () => ({
    QueryGroupCredentialList: (props: any) => (
        <div data-testid={`mock-credential-list-${props.queryId}`}>
            {props.credentials.map((c: WalletCredential) => (
                <button
                    key={c.credentialId}
                    data-testid={`select-${c.credentialId}`}
                    onClick={() => props.onCredentialSelect(props.queryId, c.credentialId, true)}
                >
                    {c.credentialTypeDisplayName}
                </button>
            ))}
        </div>
    ),
}));

const makeCredential = (id: string): WalletCredential => ({
    credentialId: id,
    credentialTypeDisplayName: `Credential ${id}`,
    credentialTypeLogo: '/logo.png',
    issuerDisplayName: 'Issuer',
    issuerLogo: '/issuer-logo.png',
    format: 'ldp_vc',
});

const makeGroup = (overrides: Partial<DcqlQueryGroup> = {}): DcqlQueryGroup => ({
    queryId: 'driver-license',
    required: true,
    multiple: false,
    availableCredentials: [makeCredential('cred-1')],
    missingClaims: [],
    ...overrides,
});

describe('QueryGroupSection', () => {
    const mockOnCredentialSelect = jest.fn();

    const defaultProps = {
        group: makeGroup(),
        selectedCredentialIds: [],
        onCredentialSelect: mockOnCredentialSelect,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the section container', () => {
        render(<QueryGroupSection {...defaultProps} />);
        expect(screen.getByTestId('query-group-section-driver-license')).toBeInTheDocument();
    });

    it('renders the header button', () => {
        render(<QueryGroupSection {...defaultProps} />);
        expect(screen.getByTestId('query-group-header-driver-license')).toBeInTheDocument();
    });

    it('renders formatted queryId label in header', () => {
        render(<QueryGroupSection {...defaultProps} />);
        expect(screen.getByText('Driver License')).toBeInTheDocument();
    });

    it('renders mandatory section badge for required group', () => {
        render(<QueryGroupSection {...defaultProps} />);
        expect(screen.getByText('dcql.mandatorySection')).toBeInTheDocument();
    });

    it('renders optional section badge for optional group', () => {
        render(<QueryGroupSection {...defaultProps} group={makeGroup({ required: false })} />);
        expect(screen.getByText('dcql.optionalSection')).toBeInTheDocument();
    });

    describe('Required group (always expanded)', () => {
        it('renders credential list by default', () => {
            render(<QueryGroupSection {...defaultProps} />);
            expect(screen.getByTestId('mock-credential-list-driver-license')).toBeInTheDocument();
        });

        it('does not show expand/collapse arrow for required groups', () => {
            render(<QueryGroupSection {...defaultProps} />);
            expect(screen.queryByRole('img', { name: /arrow/i })).not.toBeInTheDocument();
        });
    });

    describe('Optional group (collapsible)', () => {
        const optionalGroup = makeGroup({ required: false, queryId: 'insurance' });

        it('collapses by default when defaultExpanded=false', () => {
            render(
                <QueryGroupSection
                    {...defaultProps}
                    group={optionalGroup}
                    defaultExpanded={false}
                />
            );
            expect(screen.queryByTestId('mock-credential-list-insurance')).not.toBeInTheDocument();
        });

        it('expands when defaultExpanded=true', () => {
            render(
                <QueryGroupSection
                    {...defaultProps}
                    group={optionalGroup}
                    defaultExpanded={true}
                />
            );
            expect(screen.getByTestId('mock-credential-list-insurance')).toBeInTheDocument();
        });

        it('toggles expand when header is clicked', () => {
            render(
                <QueryGroupSection
                    {...defaultProps}
                    group={optionalGroup}
                    defaultExpanded={false}
                />
            );
            expect(screen.queryByTestId('mock-credential-list-insurance')).not.toBeInTheDocument();
            fireEvent.click(screen.getByTestId('query-group-header-insurance'));
            expect(screen.getByTestId('mock-credential-list-insurance')).toBeInTheDocument();
        });

        it('collapses again when header is clicked while expanded', () => {
            render(
                <QueryGroupSection
                    {...defaultProps}
                    group={optionalGroup}
                    defaultExpanded={true}
                />
            );
            fireEvent.click(screen.getByTestId('query-group-header-insurance'));
            expect(screen.queryByTestId('mock-credential-list-insurance')).not.toBeInTheDocument();
        });
    });

    describe('No matching credentials', () => {
        it('does not render inline notice when no credentials available', () => {
            render(
                <QueryGroupSection
                    {...defaultProps}
                    group={makeGroup({ availableCredentials: [] })}
                />
            );
            expect(screen.queryByTestId('query-group-no-credentials-driver-license')).not.toBeInTheDocument();
            expect(screen.queryByText('dcql.noSatisfiableOptions')).not.toBeInTheDocument();
        });

        it('does not render credential list when no credentials', () => {
            render(
                <QueryGroupSection
                    {...defaultProps}
                    group={makeGroup({ availableCredentials: [] })}
                />
            );
            expect(screen.queryByTestId('mock-credential-list-driver-license')).not.toBeInTheDocument();
        });

        it('does not render the NoMatchingCredentialsModal itself', () => {
            render(
                <QueryGroupSection
                    {...defaultProps}
                    group={makeGroup({ availableCredentials: [] })}
                />
            );
            expect(screen.queryByTestId('mock-no-matching-modal')).not.toBeInTheDocument();
        });
    });
});
