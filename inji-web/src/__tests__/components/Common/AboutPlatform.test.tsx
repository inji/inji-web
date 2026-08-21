import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {AboutPlatform} from '../../../components/Common/AboutPlatform';

const openModal = () => {
    render(<AboutPlatform />);
    fireEvent.click(screen.getByTestId('About-Platform-Button'));
};

describe('Testing the Functionality of About Platform', () => {
    test('Check if the modal opens from the trigger button', () => {
        openModal();
        expect(screen.getByTestId('About-Platform-Modal')).toBeInTheDocument();
    });

    test('Check if the dialog semantics sit on the dialog surface', () => {
        openModal();

        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby', 'About-Platform-Modal-Title');
    });

    test('Check if the close button dismisses the modal', () => {
        openModal();

        fireEvent.click(screen.getByTestId('About-Platform-Modal-Close-Button'));
        expect(screen.queryByTestId('About-Platform-Modal')).not.toBeInTheDocument();
    });

    test('Check if the Escape key dismisses the modal', () => {
        openModal();

        fireEvent.keyDown(document, {key: 'Escape'});
        expect(screen.queryByTestId('About-Platform-Modal')).not.toBeInTheDocument();
    });

    test('Check if the backdrop click dismisses the modal', () => {
        openModal();

        fireEvent.click(screen.getByTestId('About-Platform-Modal'));
        expect(screen.queryByTestId('About-Platform-Modal')).not.toBeInTheDocument();
    });

    test('Check if focus moves into the modal and returns to the trigger on close', () => {
        render(<AboutPlatform />);

        // fireEvent.click does not move focus in jsdom the way a real click
        // does, so focus the trigger first to mirror the browser.
        const trigger = screen.getByTestId('About-Platform-Button');
        trigger.focus();
        fireEvent.click(trigger);

        const closeButton = screen.getByTestId('About-Platform-Modal-Close-Button');
        expect(closeButton).toHaveFocus();

        fireEvent.click(closeButton);
        expect(trigger).toHaveFocus();
    });
});
