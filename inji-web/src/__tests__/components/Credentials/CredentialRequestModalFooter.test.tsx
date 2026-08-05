import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CredentialRequestModalFooter } from '../../../components/Credentials/CredentialRequestModalFooter';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('CredentialRequestModalFooter', () => {
    const mockOnCancel = jest.fn();
    const mockOnConsentAndShare = jest.fn();

    const defaultProps = {
        isConsentButtonEnabled: true,
        onCancel: mockOnCancel,
        onConsentAndShare: mockOnConsentAndShare,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders the consent/share button', () => {
            render(<CredentialRequestModalFooter {...defaultProps} />);
            const buttons = screen.getAllByTestId('btn-consent-share');
            expect(buttons.length).toBeGreaterThan(0);
        });

        it('renders the cancel button', () => {
            render(<CredentialRequestModalFooter {...defaultProps} />);
            const buttons = screen.getAllByTestId('btn-cancel');
            expect(buttons.length).toBeGreaterThan(0);
        });

        it('shows consent button label from translation key', () => {
            render(<CredentialRequestModalFooter {...defaultProps} />);
            const [consentBtn] = screen.getAllByTestId('btn-consent-share');
            expect(consentBtn).toHaveTextContent('buttons.consentShare');
        });

        it('shows cancel button label from translation key', () => {
            render(<CredentialRequestModalFooter {...defaultProps} />);
            const [cancelBtn] = screen.getAllByTestId('btn-cancel');
            expect(cancelBtn).toHaveTextContent('buttons.cancel');
        });
    });

    describe('Consent button state', () => {
        it('is enabled when isConsentButtonEnabled is true', () => {
            render(<CredentialRequestModalFooter {...defaultProps} isConsentButtonEnabled={true} />);
            screen.getAllByTestId('btn-consent-share').forEach((btn) => {
                expect(btn).not.toBeDisabled();
            });
        });

        it('is disabled when isConsentButtonEnabled is false', () => {
            render(<CredentialRequestModalFooter {...defaultProps} isConsentButtonEnabled={false} />);
            screen.getAllByTestId('btn-consent-share').forEach((btn) => {
                expect(btn).toBeDisabled();
            });
        });
    });

    describe('Cancel button state', () => {
        it('is enabled when isCancelPending is false (default)', () => {
            render(<CredentialRequestModalFooter {...defaultProps} />);
            screen.getAllByTestId('btn-cancel').forEach((btn) => {
                expect(btn).not.toBeDisabled();
            });
        });

        it('is disabled when isCancelPending is true', () => {
            render(
                <CredentialRequestModalFooter {...defaultProps} isCancelPending={true} />
            );
            screen.getAllByTestId('btn-cancel').forEach((btn) => {
                expect(btn).toBeDisabled();
            });
        });

        it('defaults isCancelPending to false when not provided', () => {
            render(<CredentialRequestModalFooter {...defaultProps} />);
            screen.getAllByTestId('btn-cancel').forEach((btn) => {
                expect(btn).not.toBeDisabled();
            });
        });
    });

    describe('Click handlers', () => {
        it('calls onConsentAndShare when consent button is clicked', () => {
            render(<CredentialRequestModalFooter {...defaultProps} />);
            fireEvent.click(screen.getAllByTestId('btn-consent-share')[0]);
            expect(mockOnConsentAndShare).toHaveBeenCalledTimes(1);
        });

        it('calls onCancel when cancel button is clicked', () => {
            render(<CredentialRequestModalFooter {...defaultProps} />);
            fireEvent.click(screen.getAllByTestId('btn-cancel')[0]);
            expect(mockOnCancel).toHaveBeenCalledTimes(1);
        });

        it('does not call onConsentAndShare when consent button is disabled', () => {
            render(<CredentialRequestModalFooter {...defaultProps} isConsentButtonEnabled={false} />);
            fireEvent.click(screen.getAllByTestId('btn-consent-share')[0]);
            expect(mockOnConsentAndShare).not.toHaveBeenCalled();
        });

        it('does not call onCancel when cancel button is disabled (isCancelPending)', () => {
            render(
                <CredentialRequestModalFooter {...defaultProps} isCancelPending={true} />
            );
            fireEvent.click(screen.getAllByTestId('btn-cancel')[0]);
            expect(mockOnCancel).not.toHaveBeenCalled();
        });
    });

    describe('Both layouts (mobile and desktop)', () => {
        it('renders two consent/share buttons (mobile + desktop layout)', () => {
            render(<CredentialRequestModalFooter {...defaultProps} />);
            expect(screen.getAllByTestId('btn-consent-share')).toHaveLength(2);
        });

        it('renders two cancel buttons (mobile + desktop layout)', () => {
            render(<CredentialRequestModalFooter {...defaultProps} />);
            expect(screen.getAllByTestId('btn-cancel')).toHaveLength(2);
        });
    });
});
