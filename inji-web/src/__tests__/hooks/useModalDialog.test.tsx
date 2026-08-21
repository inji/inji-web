import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {useModalDialog} from '../../hooks/useModalDialog';

const Harness: React.FC<{isOpen: boolean; onClose: () => void}> = ({isOpen, onClose}) => {
    const dialogRef = useModalDialog<HTMLDivElement>(isOpen, onClose);

    return (
        <div>
            <button type="button" data-testid="trigger">Open</button>
            {isOpen && (
                <div ref={dialogRef} tabIndex={-1} role="dialog" data-testid="dialog">
                    <button type="button" data-testid="first">First</button>
                    <button type="button" data-testid="last">Last</button>
                </div>
            )}
        </div>
    );
};

describe('useModalDialog', () => {
    test('moves focus to the first control in the dialog when it opens', () => {
        render(<Harness isOpen onClose={jest.fn()} />);
        expect(screen.getByTestId('first')).toHaveFocus();
    });

    test('falls back to the dialog itself when it holds no focusable control', () => {
        const Empty = () => {
            const dialogRef = useModalDialog<HTMLDivElement>(true, jest.fn());
            return <div ref={dialogRef} tabIndex={-1} role="dialog" data-testid="empty-dialog" />;
        };
        render(<Empty />);
        expect(screen.getByTestId('empty-dialog')).toHaveFocus();
    });

    test('closes on Escape', () => {
        const onClose = jest.fn();
        render(<Harness isOpen onClose={onClose} />);

        fireEvent.keyDown(document, {key: 'Escape'});
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('does not close on Escape while shut', () => {
        const onClose = jest.fn();
        render(<Harness isOpen={false} onClose={onClose} />);

        fireEvent.keyDown(document, {key: 'Escape'});
        expect(onClose).not.toHaveBeenCalled();
    });

    test('wraps Tab from the last control back to the first', () => {
        render(<Harness isOpen onClose={jest.fn()} />);
        screen.getByTestId('last').focus();

        fireEvent.keyDown(document, {key: 'Tab'});
        expect(screen.getByTestId('first')).toHaveFocus();
    });

    test('wraps Shift+Tab from the first control to the last', () => {
        render(<Harness isOpen onClose={jest.fn()} />);
        screen.getByTestId('first').focus();

        fireEvent.keyDown(document, {key: 'Tab', shiftKey: true});
        expect(screen.getByTestId('last')).toHaveFocus();
    });

    test('restores focus to the opener once the dialog closes', () => {
        const {rerender} = render(<Harness isOpen={false} onClose={jest.fn()} />);
        const trigger = screen.getByTestId('trigger');
        trigger.focus();

        rerender(<Harness isOpen onClose={jest.fn()} />);
        expect(screen.getByTestId('first')).toHaveFocus();

        rerender(<Harness isOpen={false} onClose={jest.fn()} />);
        expect(trigger).toHaveFocus();
    });
});
