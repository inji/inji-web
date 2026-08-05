import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryGroupCredentialList } from '../../../components/Ovp/QueryGroupCredentialList';
import { WalletCredential } from '../../../types/data';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('../../../assets/checkCircleTwo.svg', () => 'check-circle-mock.svg');

jest.mock('../../../components/VC/VCCardView', () => ({
    VCCardView: ({ credential }: any) => (
        <div data-testid={`mock-vc-card-${credential.credentialId}`}>{credential.credentialTypeDisplayName}</div>
    ),
}));

jest.mock('../../../modals/SDClaimsSelectionModal', () => ({
    __esModule: true,
    default: ({ closeModal }: any) => (
        <div data-testid="mock-sd-claims-modal">
            <button data-testid="close-sd-claims" onClick={() => closeModal(false)}>close</button>
        </div>
    ),
}));

const makeCredential = (id: string, format = 'ldp_vc'): WalletCredential => ({
    credentialId: id,
    credentialTypeDisplayName: `Credential ${id}`,
    credentialTypeLogo: '/logo.png',
    issuerDisplayName: 'Issuer',
    issuerLogo: '/issuer-logo.png',
    format,
});

describe('QueryGroupCredentialList', () => {
    const mockOnCredentialSelect = jest.fn();
    const mockOnSdClaimsConfirm = jest.fn();

    const cred1 = makeCredential('cred-1');
    const cred2 = makeCredential('cred-2');

    const defaultProps = {
        queryId: 'query-1',
        credentials: [cred1, cred2],
        selectedCredentialIds: [],
        multiple: false,
        deselectionDisabled: false,
        onCredentialSelect: mockOnCredentialSelect,
        onSdClaimsConfirm: mockOnSdClaimsConfirm,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the container', () => {
        render(<QueryGroupCredentialList {...defaultProps} />);
        expect(screen.getByTestId('query-group-credentials-query-1')).toBeInTheDocument();
    });

    it('renders a tile for each credential', () => {
        render(<QueryGroupCredentialList {...defaultProps} />);
        expect(screen.getByTestId('query-group-credential-tile-cred-1')).toBeInTheDocument();
        expect(screen.getByTestId('query-group-credential-tile-cred-2')).toBeInTheDocument();
    });

    it('renders VC cards for each credential', () => {
        render(<QueryGroupCredentialList {...defaultProps} />);
        expect(screen.getByTestId('mock-vc-card-cred-1')).toBeInTheDocument();
        expect(screen.getByTestId('mock-vc-card-cred-2')).toBeInTheDocument();
    });

    it('shows unselected state by default', () => {
        render(<QueryGroupCredentialList {...defaultProps} />);
        // header shows unselected title
        expect(screen.getByTestId('query-group-credential-header-cred-1')).toHaveTextContent('credentialTile.unselectedTitle');
    });

    it('shows selected state when credential is in selectedCredentialIds', () => {
        render(<QueryGroupCredentialList {...defaultProps} selectedCredentialIds={['cred-1']} />);
        expect(screen.getByTestId('query-group-credential-header-cred-1')).toHaveTextContent('credentialTile.selectedTitle');
    });

    it('renders selected icon when credential is selected', () => {
        render(<QueryGroupCredentialList {...defaultProps} selectedCredentialIds={['cred-1']} />);
        expect(screen.getByTestId('query-group-credential-selected-icon-cred-1')).toBeInTheDocument();
    });

    it('credential header is a focusable button element', () => {
        render(<QueryGroupCredentialList {...defaultProps} />);
        const header = screen.getByTestId('query-group-credential-header-cred-1');
        expect(header.tagName).toBe('BUTTON');
        expect(header).toHaveAttribute('type', 'button');
    });

    describe('Single-select mode', () => {
        it('calls onCredentialSelect with isSelected=true when credential is clicked', () => {
            render(<QueryGroupCredentialList {...defaultProps} multiple={false} />);
            fireEvent.click(screen.getByTestId('query-group-credential-header-cred-1'));
            expect(mockOnCredentialSelect).toHaveBeenCalledWith('query-1', 'cred-1', true);
        });
    });

    describe('Multiple-select mode', () => {
        it('calls onCredentialSelect toggling selection', () => {
            render(<QueryGroupCredentialList {...defaultProps} multiple={true} />);
            fireEvent.click(screen.getByTestId('query-group-credential-header-cred-1'));
            expect(mockOnCredentialSelect).toHaveBeenCalledWith('query-1', 'cred-1', true);
        });

        it('deselects when already selected', () => {
            render(
                <QueryGroupCredentialList
                    {...defaultProps}
                    multiple={true}
                    selectedCredentialIds={['cred-1']}
                />
            );
            fireEvent.click(screen.getByTestId('query-group-credential-header-cred-1'));
            expect(mockOnCredentialSelect).toHaveBeenCalledWith('query-1', 'cred-1', false);
        });

        it('does not deselect when deselectionDisabled and only one selected', () => {
            render(
                <QueryGroupCredentialList
                    {...defaultProps}
                    multiple={false}
                    deselectionDisabled={true}
                    selectedCredentialIds={['cred-1']}
                />
            );
            fireEvent.click(screen.getByTestId('query-group-credential-header-cred-1'));
            expect(mockOnCredentialSelect).not.toHaveBeenCalled();
        });
    });

    describe('SD-JWT credential', () => {
        it('opens SD claims modal when sd-jwt credential is selected', () => {
            const sdCred = makeCredential('sd-cred', 'vc+sd-jwt');
            render(
                <QueryGroupCredentialList
                    {...defaultProps}
                    credentials={[sdCred]}
                />
            );
            fireEvent.click(screen.getByTestId('query-group-credential-header-sd-cred'));
            expect(screen.getByTestId('mock-sd-claims-modal')).toBeInTheDocument();
        });

        it('closes SD claims modal when close button is clicked', () => {
            const sdCred = makeCredential('sd-cred', 'vc+sd-jwt');
            render(
                <QueryGroupCredentialList
                    {...defaultProps}
                    credentials={[sdCred]}
                />
            );
            fireEvent.click(screen.getByTestId('query-group-credential-header-sd-cred'));
            fireEvent.click(screen.getByTestId('close-sd-claims'));
            expect(screen.queryByTestId('mock-sd-claims-modal')).not.toBeInTheDocument();
        });
    });
});
