import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HomeQuickTip } from '../../../components/Home/HomeQuickTip';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const mockPlainButton = jest.fn();
jest.mock('../../../components/Common/Buttons/PlainButton', () => ({
    PlainButton: (props: any) => {
        mockPlainButton(props);
        return (
            <button
                data-testid={props.testId}
                onClick={props.onClick}
            >
                {props.title}
            </button>
        );
    },
}));

describe('HomeQuickTip', () => {
    const mockOnClick = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the container', () => {
        render(<HomeQuickTip onClick={mockOnClick} />);
        expect(screen.getByTestId('HomeQuickTip-Container')).toBeInTheDocument();
    });

    it('renders the content section', () => {
        render(<HomeQuickTip onClick={mockOnClick} />);
        expect(screen.getByTestId('HomeQuickTip-Content')).toBeInTheDocument();
    });

    it('renders the heading with translation key', () => {
        render(<HomeQuickTip onClick={mockOnClick} />);
        expect(screen.getByTestId('HomeQuickTip-Heading')).toHaveTextContent('QuickTip.heading');
    });

    it('renders the button container', () => {
        render(<HomeQuickTip onClick={mockOnClick} />);
        expect(screen.getByTestId('HomeQuickTip-ButtonContainer')).toBeInTheDocument();
    });

    it('renders the PlainButton with correct testId', () => {
        render(<HomeQuickTip onClick={mockOnClick} />);
        expect(screen.getByTestId('HomeQuickTip-Get-Started')).toBeInTheDocument();
    });

    it('passes the button title translation key to PlainButton', () => {
        render(<HomeQuickTip onClick={mockOnClick} />);
        expect(mockPlainButton).toHaveBeenCalledWith(
            expect.objectContaining({ title: 'QuickTip.buttontext' })
        );
    });

    it('passes the onClick handler to PlainButton', () => {
        render(<HomeQuickTip onClick={mockOnClick} />);
        expect(mockPlainButton).toHaveBeenCalledWith(
            expect.objectContaining({ onClick: mockOnClick })
        );
    });

    it('calls onClick when the button is clicked', () => {
        render(<HomeQuickTip onClick={mockOnClick} />);
        fireEvent.click(screen.getByTestId('HomeQuickTip-Get-Started'));
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
});
