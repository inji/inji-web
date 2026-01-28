import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CredentialItem } from '../../../components/Credentials/CredentialItem';
import { PresentationCredential } from '../../../types/components';

jest.mock('../../../hooks/useCredentialItem', () => ({
    useCredentialItem: ({ credentialId, onToggle }: any) => ({
        imageError: false,
        handleToggle: () => onToggle(credentialId),
        handleImageError: jest.fn()
    })
}));

describe('CredentialItem Component', () => {
    const mockCredential: PresentationCredential = {
        credentialId: 'test-cred-1',
        credentialTypeDisplayName: 'Test Credential',
        credentialTypeLogo: '/test-logo.png',
        format: 'ldp_vc'
    };

    const mockOnToggle = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Selection functionality', () => {
        it('should call onToggle when clicking the div', () => {
            render(
                <CredentialItem
                    credential={mockCredential}
                    isSelected={false}
                    onToggle={mockOnToggle}
                />
            );

            // Find the clickable div using role="button" within the item container
            const itemContainer = screen.getByTestId(`item-${mockCredential.credentialId}`);
            const clickableDiv = itemContainer.querySelector('div[role="button"]');
            expect(clickableDiv).toBeInTheDocument();

            fireEvent.click(clickableDiv!);
            expect(mockOnToggle).toHaveBeenCalledTimes(1);
            expect(mockOnToggle).toHaveBeenCalledWith(mockCredential.credentialId);
        });

        it('should call onToggle when pressing Enter key on div', () => {
            render(
                <CredentialItem
                    credential={mockCredential}
                    isSelected={false}
                    onToggle={mockOnToggle}
                />
            );
            // Find the clickable div using role="button"
            const itemContainer = screen.getByTestId(`item-${mockCredential.credentialId}`);
            const clickableDiv = itemContainer.querySelector('div[role="button"]') as HTMLElement;
            expect(clickableDiv).toBeInTheDocument();
            
            fireEvent.keyDown(clickableDiv, { key: 'Enter' });
            expect(mockOnToggle).toHaveBeenCalledTimes(1);
            expect(mockOnToggle).toHaveBeenCalledWith(mockCredential.credentialId);
        });

        it('should call onToggle when pressing Space key on div', () => {
            render(
                <CredentialItem
                    credential={mockCredential}
                    isSelected={false}
                    onToggle={mockOnToggle}
                />
            );
            // Find the clickable div using role="button"
            const itemContainer = screen.getByTestId(`item-${mockCredential.credentialId}`);
            const clickableDiv = itemContainer.querySelector('div[role="button"]') as HTMLElement;
            expect(clickableDiv).toBeInTheDocument();
            
            fireEvent.keyDown(clickableDiv, { key: ' ' });
            expect(mockOnToggle).toHaveBeenCalledTimes(1);
            expect(mockOnToggle).toHaveBeenCalledWith(mockCredential.credentialId);
        });

        it('should apply selected styles when isSelected is true', () => {
            render(
                <CredentialItem
                    credential={mockCredential}
                    isSelected={true}
                    onToggle={mockOnToggle}
                />
            );
            // Find the clickable div using role="button"
            const itemContainer = screen.getByTestId(`item-${mockCredential.credentialId}`);
            const clickableDiv = itemContainer.querySelector('div[role="button"]');
            expect(clickableDiv).toBeInTheDocument();
            expect(clickableDiv).toHaveClass('bg-orange-50');
        });

        it('should not apply selected styles when isSelected is false', () => {
            render(
                <CredentialItem
                    credential={mockCredential}
                    isSelected={false}
                    onToggle={mockOnToggle}
                />
            );
            // Find the clickable div using role="button"
            const itemContainer = screen.getByTestId(`item-${mockCredential.credentialId}`);
            const clickableDiv = itemContainer.querySelector('div[role="button"]');
            expect(clickableDiv).toBeInTheDocument();
            expect(clickableDiv).not.toHaveClass('bg-orange-50');
        });

        it('should call onToggle when clicking the checkbox', () => {
            render(
                <CredentialItem
                    credential={mockCredential}
                    isSelected={false}
                    onToggle={mockOnToggle}
                />
            );

            const checkbox = screen.getByTestId(`checkbox-${mockCredential.credentialId}`);
            expect(checkbox).toBeInTheDocument();

            fireEvent.click(checkbox);
            expect(mockOnToggle).toHaveBeenCalledTimes(1);
            expect(mockOnToggle).toHaveBeenCalledWith(mockCredential.credentialId);
        });

        it('should not trigger double-toggle when clicking checkbox (stopPropagation works)', () => {
            render(
                <CredentialItem
                    credential={mockCredential}
                    isSelected={false}
                    onToggle={mockOnToggle}
                />
            );

            const checkbox = screen.getByTestId(`checkbox-${mockCredential.credentialId}`);
            
            // Click checkbox - should only trigger once due to stopPropagation
            // If stopPropagation didn't work, the div's onClick would also fire, causing double-toggle
            fireEvent.click(checkbox);
            
            expect(mockOnToggle).toHaveBeenCalledTimes(1);
            expect(mockOnToggle).toHaveBeenCalledWith(mockCredential.credentialId);
        });

        it('should display selected state correctly', () => {
            render(
                <CredentialItem
                    credential={mockCredential}
                    isSelected={true}
                    onToggle={mockOnToggle}
                />
            );

            const checkbox = screen.getByTestId(`checkbox-${mockCredential.credentialId}`);
            expect(checkbox).toBeChecked();
        });

        it('should display unselected state correctly', () => {
            render(
                <CredentialItem
                    credential={mockCredential}
                    isSelected={false}
                    onToggle={mockOnToggle}
                />
            );

            const checkbox = screen.getByTestId(`checkbox-${mockCredential.credentialId}`);
            expect(checkbox).not.toBeChecked();
        });
    });
});

