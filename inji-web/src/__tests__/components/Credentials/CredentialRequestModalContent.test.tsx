import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CredentialRequestModalContent } from '../../../components/Credentials/CredentialRequestModalContent';
import { PresentationCredential } from '../../../types/components';

const mockPresentationCredentialList = jest.fn();

jest.mock('../../../components/Credentials/PresentationCredentialList', () => ({
    PresentationCredentialList: (props: any) => {
        mockPresentationCredentialList(props);
        return <div data-testid="mock-presentation-credential-list" />;
    },
}));

describe('CredentialRequestModalContent', () => {
    const mockCredentials: PresentationCredential[] = [
        {
            credentialId: 'cred-1',
            credentialTypeDisplayName: 'National ID',
            credentialTypeLogo: '/logo1.png',
            format: 'ldp_vc',
        },
        {
            credentialId: 'cred-2',
            credentialTypeDisplayName: 'Driving License',
            credentialTypeLogo: '/logo2.png',
            format: 'ldp_vc',
        },
    ];

    const mockOnCredentialToggle = jest.fn();

    const defaultProps = {
        credentials: mockCredentials,
        selectedCredentials: ['cred-1'],
        onCredentialToggle: mockOnCredentialToggle,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders the PresentationCredentialList', () => {
            render(<CredentialRequestModalContent {...defaultProps} />);
            expect(screen.getByTestId('mock-presentation-credential-list')).toBeInTheDocument();
        });

        it('renders a wrapping container div', () => {
            const { container } = render(<CredentialRequestModalContent {...defaultProps} />);
            expect(container.firstChild).not.toBeNull();
        });
    });

    describe('Props forwarding', () => {
        it('passes credentials to PresentationCredentialList', () => {
            render(<CredentialRequestModalContent {...defaultProps} />);
            expect(mockPresentationCredentialList).toHaveBeenCalledWith(
                expect.objectContaining({ credentials: mockCredentials })
            );
        });

        it('passes selectedCredentials to PresentationCredentialList', () => {
            render(<CredentialRequestModalContent {...defaultProps} />);
            expect(mockPresentationCredentialList).toHaveBeenCalledWith(
                expect.objectContaining({ selectedCredentials: ['cred-1'] })
            );
        });

        it('passes onCredentialToggle to PresentationCredentialList', () => {
            render(<CredentialRequestModalContent {...defaultProps} />);
            expect(mockPresentationCredentialList).toHaveBeenCalledWith(
                expect.objectContaining({ onCredentialToggle: mockOnCredentialToggle })
            );
        });
    });

    describe('Edge cases', () => {
        it('renders correctly with an empty credentials array', () => {
            render(
                <CredentialRequestModalContent
                    credentials={[]}
                    selectedCredentials={[]}
                    onCredentialToggle={mockOnCredentialToggle}
                />
            );
            expect(screen.getByTestId('mock-presentation-credential-list')).toBeInTheDocument();
            expect(mockPresentationCredentialList).toHaveBeenCalledWith(
                expect.objectContaining({ credentials: [], selectedCredentials: [] })
            );
        });

        it('renders correctly with all credentials selected', () => {
            render(
                <CredentialRequestModalContent
                    credentials={mockCredentials}
                    selectedCredentials={['cred-1', 'cred-2']}
                    onCredentialToggle={mockOnCredentialToggle}
                />
            );
            expect(mockPresentationCredentialList).toHaveBeenCalledWith(
                expect.objectContaining({ selectedCredentials: ['cred-1', 'cred-2'] })
            );
        });

        it('renders correctly with no credentials selected', () => {
            render(
                <CredentialRequestModalContent
                    credentials={mockCredentials}
                    selectedCredentials={[]}
                    onCredentialToggle={mockOnCredentialToggle}
                />
            );
            expect(mockPresentationCredentialList).toHaveBeenCalledWith(
                expect.objectContaining({ selectedCredentials: [] })
            );
        });
    });
});
