import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CredentialRequestModalHeader } from '../../../components/Credentials/CredentialRequestModalHeader';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: Record<string, unknown>) => {
            if (opts && typeof opts === 'object') {
                return `${key}:${JSON.stringify(opts)}`;
            }
            return key;
        },
    }),
}));

describe('CredentialRequestModalHeader', () => {
    const defaultProps = {
        verifierName: 'Test Verifier',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders the title element', () => {
            render(<CredentialRequestModalHeader {...defaultProps} />);
            expect(screen.getByTestId('title-verifier-request')).toBeInTheDocument();
        });

        it('renders the description element', () => {
            render(<CredentialRequestModalHeader {...defaultProps} />);
            expect(screen.getByTestId('text-select-credentials')).toBeInTheDocument();
        });

        it('passes verifierName to the title translation key', () => {
            render(<CredentialRequestModalHeader verifierName="My Bank" />);
            const title = screen.getByTestId('title-verifier-request');
            expect(title).toHaveTextContent('My Bank');
        });

        it('renders header.title translation key', () => {
            render(<CredentialRequestModalHeader {...defaultProps} />);
            const title = screen.getByTestId('title-verifier-request');
            expect(title).toHaveTextContent('header.title');
        });

        it('renders header.description translation key', () => {
            render(<CredentialRequestModalHeader {...defaultProps} />);
            const desc = screen.getByTestId('text-select-credentials');
            expect(desc).toHaveTextContent('header.description');
        });
    });

    describe('DOM structure', () => {
        it('renders title as an h2 element', () => {
            render(<CredentialRequestModalHeader {...defaultProps} />);
            const title = screen.getByTestId('title-verifier-request');
            expect(title.tagName).toBe('H2');
        });

        it('renders description as a p element', () => {
            render(<CredentialRequestModalHeader {...defaultProps} />);
            const desc = screen.getByTestId('text-select-credentials');
            expect(desc.tagName).toBe('P');
        });

        it('wraps content in a container div', () => {
            const { container } = render(<CredentialRequestModalHeader {...defaultProps} />);
            expect(container.firstChild).not.toBeNull();
            expect(container.querySelector('h2')).toBeInTheDocument();
            expect(container.querySelector('p')).toBeInTheDocument();
        });
    });

    describe('Edge cases', () => {
        it('renders with an empty verifierName', () => {
            render(<CredentialRequestModalHeader verifierName="" />);
            expect(screen.getByTestId('title-verifier-request')).toBeInTheDocument();
        });

        it('renders with a verifierName containing special characters', () => {
            render(<CredentialRequestModalHeader verifierName="Bank & Trust <Ltd>" />);
            expect(screen.getByTestId('title-verifier-request')).toBeInTheDocument();
        });
    });
});
