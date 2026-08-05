import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MultipleCardsSection } from '../../../components/Ovp/MultipleCardsSection';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, vars?: Record<string, unknown>) => {
            if (vars?.count !== undefined) return `${key}:${vars.count}`;
            return key;
        },
    }),
}));

jest.mock('../../../components/Ovp/Dcql/DcqlSelectionRadio', () => ({
    DcqlSelectionRadio: ({ checked, onClick, testId }: any) => (
        <button
            data-testid={testId}
            data-checked={String(checked)}
            onClick={onClick}
            aria-label="select"
        />
    ),
}));

describe('MultipleCardsSection', () => {
    const mockOnToggle = jest.fn();

    const defaultProps = {
        testId: 'set-0',
        optionIndex: 0,
        checked: false,
        credentialCount: 2,
        onToggle: mockOnToggle,
        children: <div data-testid="child-content">child</div>,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the combined container with correct testId', () => {
        render(<MultipleCardsSection {...defaultProps} />);
        expect(screen.getByTestId('set-0-option-0-combined')).toBeInTheDocument();
    });

    it('renders children', () => {
        render(<MultipleCardsSection {...defaultProps} />);
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('renders multipleCards translation key', () => {
        render(<MultipleCardsSection {...defaultProps} />);
        expect(screen.getByText('dcql.multipleCards')).toBeInTheDocument();
    });

    it('renders credentialsCount with count', () => {
        render(<MultipleCardsSection {...defaultProps} />);
        expect(screen.getByText('dcql.credentialsCount:2')).toBeInTheDocument();
    });

    it('renders DcqlSelectionRadio with correct testId', () => {
        render(<MultipleCardsSection {...defaultProps} />);
        expect(screen.getByTestId('set-0-option-0-select-all')).toBeInTheDocument();
    });

    it('passes checked=false to DcqlSelectionRadio when unchecked', () => {
        render(<MultipleCardsSection {...defaultProps} checked={false} />);
        expect(screen.getByTestId('set-0-option-0-select-all')).toHaveAttribute('data-checked', 'false');
    });

    it('passes checked=true to DcqlSelectionRadio when checked', () => {
        render(<MultipleCardsSection {...defaultProps} checked={true} />);
        expect(screen.getByTestId('set-0-option-0-select-all')).toHaveAttribute('data-checked', 'true');
    });

    it('calls onToggle when DcqlSelectionRadio is clicked', () => {
        render(<MultipleCardsSection {...defaultProps} />);
        fireEvent.click(screen.getByTestId('set-0-option-0-select-all'));
        expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('renders with different optionIndex', () => {
        render(<MultipleCardsSection {...defaultProps} optionIndex={3} />);
        expect(screen.getByTestId('set-0-option-3-combined')).toBeInTheDocument();
        expect(screen.getByTestId('set-0-option-3-select-all')).toBeInTheDocument();
    });

    it('renders with different testId', () => {
        render(<MultipleCardsSection {...defaultProps} testId="credential-set-1" />);
        expect(screen.getByTestId('credential-set-1-option-0-combined')).toBeInTheDocument();
    });

    it('renders correct count for 3 credentials', () => {
        render(<MultipleCardsSection {...defaultProps} credentialCount={3} />);
        expect(screen.getByText('dcql.credentialsCount:3')).toBeInTheDocument();
    });
});
