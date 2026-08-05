import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DcqlQueryCredentials } from '../../../../components/Ovp/Dcql/DcqlQueryCredentials';
import { WalletCredential } from '../../../../types/data';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, vars?: Record<string, unknown>) => {
            if (vars?.count !== undefined) return `${key}:${vars.count}`;
            return key;
        },
    }),
}));

const mockDcqlCredentialOptionCard = jest.fn();
jest.mock('../../../../components/Ovp/Dcql/DcqlCredentialOptionCard', () => ({
    DcqlCredentialOptionCard: (props: any) => {
        mockDcqlCredentialOptionCard(props);
        return (
            <div data-testid={props.testId}>
                <button data-testid={`${props.testId}-select`} onClick={props.onSelect}>select</button>
                <button data-testid={`${props.testId}-action`} onClick={props.onActionClick}>action</button>
            </div>
        );
    },
}));

jest.mock('../../../../modals/SDClaimsSelectionModal', () => ({
    __esModule: true,
    default: ({ closeModal, onConfirm }: any) => (
        <div data-testid="mock-sd-claims-modal">
            <button data-testid="close-sd-claims" onClick={() => closeModal(false)}>close</button>
            <button data-testid="confirm-sd-claims" onClick={() => onConfirm('cred-1', ['$.name'])}>confirm</button>
        </div>
    ),
}));

jest.mock('../../../../modals/CredentialPreviewModal', () => ({
    __esModule: true,
    default: ({ onClose }: any) => (
        <div data-testid="mock-preview-modal">
            <button data-testid="close-preview" onClick={onClose}>close</button>
        </div>
    ),
}));

jest.mock('../../../../components/Ovp/Dcql/credentialCardUtils', () => {
    const actual = jest.requireActual(
        '../../../../components/Ovp/Dcql/credentialCardUtils'
    );
    return {
        ...actual,
        getCredentialActionVariant: jest.fn(actual.getCredentialActionVariant),
    };
});

const makeCredential = (id: string, format = 'ldp_vc'): WalletCredential => ({
    credentialId: id,
    credentialTypeDisplayName: `Credential ${id}`,
    credentialTypeLogo: '/logo.png',
    issuerDisplayName: 'Issuer',
    issuerLogo: '/issuer-logo.png',
    format,
});

describe('DcqlQueryCredentials', () => {
    const mockOnCredentialSelect = jest.fn();
    const mockOnSdClaimsConfirm = jest.fn();

    const defaultProps = {
        queryId: 'query-1',
        credentials: [makeCredential('cred-1'), makeCredential('cred-2')],
        selectedCredentialIds: [],
        multiple: false,
        deselectionDisabled: false,
        onCredentialSelect: mockOnCredentialSelect,
        onSdClaimsConfirm: mockOnSdClaimsConfirm,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the credentials container', () => {
        render(<DcqlQueryCredentials {...defaultProps} />);
        expect(screen.getByTestId('dcql-query-credentials-query-1')).toBeInTheDocument();
    });

    it('renders a card for each credential', () => {
        render(<DcqlQueryCredentials {...defaultProps} />);
        expect(screen.getByTestId('dcql-credential-cred-1')).toBeInTheDocument();
        expect(screen.getByTestId('dcql-credential-cred-2')).toBeInTheDocument();
    });

    it('calls onCredentialSelect when a credential is selected (single-select mode)', () => {
        render(<DcqlQueryCredentials {...defaultProps} />);
        fireEvent.click(screen.getByTestId('dcql-credential-cred-1-select'));
        expect(mockOnCredentialSelect).toHaveBeenCalledWith('query-1', 'cred-1', true);
    });

    it('calls onCredentialSelect with toggled value in multiple mode', () => {
        render(<DcqlQueryCredentials {...defaultProps} multiple={true} />);
        fireEvent.click(screen.getByTestId('dcql-credential-cred-1-select'));
        expect(mockOnCredentialSelect).toHaveBeenCalledWith('query-1', 'cred-1', true);
    });

    it('deselects credential in multiple mode', () => {
        render(
            <DcqlQueryCredentials
                {...defaultProps}
                multiple={true}
                selectedCredentialIds={['cred-1']}
            />
        );
        fireEvent.click(screen.getByTestId('dcql-credential-cred-1-select'));
        expect(mockOnCredentialSelect).toHaveBeenCalledWith('query-1', 'cred-1', false);
    });

    it('does not deselect when deselectionDisabled and only one selected', () => {
        render(
            <DcqlQueryCredentials
                {...defaultProps}
                multiple={false}
                deselectionDisabled={true}
                selectedCredentialIds={['cred-1']}
            />
        );
        fireEvent.click(screen.getByTestId('dcql-credential-cred-1-select'));
        expect(mockOnCredentialSelect).not.toHaveBeenCalled();
    });

    it('opens SD claims modal when action clicked on sd-jwt credential', () => {
        const sdJwtCred = makeCredential('sd-cred-1', 'vc+sd-jwt');
        render(
            <DcqlQueryCredentials
                {...defaultProps}
                credentials={[sdJwtCred]}
            />
        );
        fireEvent.click(screen.getByTestId('dcql-credential-sd-cred-1-action'));
        expect(screen.getByTestId('mock-sd-claims-modal')).toBeInTheDocument();
    });

    it('closes SD claims modal when close button clicked', () => {
        const sdJwtCred = makeCredential('sd-cred-1', 'vc+sd-jwt');
        render(
            <DcqlQueryCredentials
                {...defaultProps}
                credentials={[sdJwtCred]}
            />
        );
        fireEvent.click(screen.getByTestId('dcql-credential-sd-cred-1-action'));
        fireEvent.click(screen.getByTestId('close-sd-claims'));
        expect(screen.queryByTestId('mock-sd-claims-modal')).not.toBeInTheDocument();
    });

    it('opens preview modal when action clicked on non-sd-jwt credential', () => {
        render(<DcqlQueryCredentials {...defaultProps} />);
        fireEvent.click(screen.getByTestId('dcql-credential-cred-1-action'));
        expect(screen.getByTestId('mock-preview-modal')).toBeInTheDocument();
    });

    it('closes preview modal when close button clicked', () => {
        render(<DcqlQueryCredentials {...defaultProps} />);
        fireEvent.click(screen.getByTestId('dcql-credential-cred-1-action'));
        fireEvent.click(screen.getByTestId('close-preview'));
        expect(screen.queryByTestId('mock-preview-modal')).not.toBeInTheDocument();
    });

    describe('Show more / collapse extras', () => {
        const manyCredentials = [
            makeCredential('c1'), makeCredential('c2'), makeCredential('c3'),
        ];

        it('collapses to 1 visible credential when multiple=true, optional=false, and >1 credential', () => {
            render(
                <DcqlQueryCredentials
                    {...defaultProps}
                    credentials={manyCredentials}
                    multiple={true}
                    optional={false}
                />
            );
            expect(screen.getByTestId('dcql-credential-c1')).toBeInTheDocument();
            expect(screen.queryByTestId('dcql-credential-c2')).not.toBeInTheDocument();
            expect(screen.getByTestId('dcql-query-credentials-query-1-show-more')).toBeInTheDocument();
        });

        it('shows all credentials after clicking show more', () => {
            render(
                <DcqlQueryCredentials
                    {...defaultProps}
                    credentials={manyCredentials}
                    multiple={true}
                    optional={false}
                />
            );
            fireEvent.click(screen.getByTestId('dcql-query-credentials-query-1-show-more'));
            expect(screen.getByTestId('dcql-credential-c2')).toBeInTheDocument();
            expect(screen.getByTestId('dcql-credential-c3')).toBeInTheDocument();
        });

        it('does not collapse when optional=true', () => {
            render(
                <DcqlQueryCredentials
                    {...defaultProps}
                    credentials={manyCredentials}
                    multiple={true}
                    optional={true}
                />
            );
            expect(screen.getByTestId('dcql-credential-c2')).toBeInTheDocument();
            expect(screen.queryByTestId('dcql-query-credentials-query-1-show-more')).not.toBeInTheDocument();
        });
    });
});
