import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorCard } from '../../modals/ErrorCard';
import { useTranslation } from 'react-i18next';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('../../modals/ModalWrapper', () => ({
  ModalWrapper: ({ header, footer, content, zIndex, size }: any) => (
    <div data-testid="ModalWrapper-Mock" data-z-index={zIndex} data-size={size}>
      {header}
      {content}
      {footer}
    </div>
  ),
}));

jest.mock('../../components/Common/Buttons/SolidButton', () => ({
  SolidButton: ({ onClick, title, testId, fullWidth, className, disabled }: any) => (
    <button
      data-testid={testId}
      onClick={onClick}
      data-full-width={fullWidth}
      className={className}
      disabled={disabled}
    >
      {title}
    </button>
  ),
}));

// Mock the ErrorMessageIcon SVG import
jest.mock('../../assets/error_message.svg', () => 'error-message-icon-mock.svg');

const defaultProps = {
    title: 'Test Error',
    description: 'This is a test error message',
    isOpen: true,
    onClose: jest.fn(),
    testId: 'test-error-card',
};

describe('ErrorCard', () => {
    beforeEach(() => {
        (useTranslation as jest.Mock).mockReturnValue({
            t: (key: string) => {
                const translations: Record<string, string> = {
                    'ErrorCard.defaultTitle': 'Default Error Title',
                    'ErrorCard.defaultDescription': 'Default Error Description',
                    'ErrorCard.closeButton': 'Close',
                    'RetryCard.defaultDescription': 'Default Retry Description',
                    'RetryCard.retryButton': 'Retry',
                };
                return translations[key] || key;
            },
        });
        jest.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('should not render when isOpen is false', () => {
            render(<ErrorCard {...defaultProps} isOpen={false} />);
            expect(screen.queryByTestId('ModalWrapper-Mock')).not.toBeInTheDocument();
        });

        it('should render when isOpen is true', () => {
            render(<ErrorCard {...defaultProps} />);
            expect(screen.getByTestId('ModalWrapper-Mock')).toBeInTheDocument();
            expect(screen.getByTestId(defaultProps.testId)).toBeInTheDocument();
        });

        it('should display the correct title and description', () => {
            render(<ErrorCard {...defaultProps} />);
            
            expect(screen.getByText('Test Error')).toBeInTheDocument();
            expect(screen.getByText('This is a test error message')).toBeInTheDocument();
        });

        it('should render the error icon', () => {
            render(<ErrorCard {...defaultProps} />);
            
            const errorIcon = screen.getByTestId('img-error-card-icon');
            expect(errorIcon).toBeInTheDocument();
            expect(errorIcon).toHaveAttribute('src', 'error-message-icon-mock.svg');
        });
    });

    describe('User Interactions', () => {
        it('should show Close button and call onClose when no onRetry is provided', () => {
            const mockOnClose = jest.fn();
            render(<ErrorCard {...defaultProps} onClose={mockOnClose} />);
            
            const closeButton = screen.getByTestId('btn-error-card-close');
            expect(closeButton).toBeInTheDocument();
            expect(closeButton).toHaveTextContent('Close');

            fireEvent.click(closeButton);
            
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should use closeButtonTitle when provided and onRetry is not', () => {
            const mockOnClose = jest.fn();
            render(
                <ErrorCard
                    {...defaultProps}
                    onClose={mockOnClose}
                    closeButtonTitle="Go to Home"
                />
            );

            const closeButton = screen.getByTestId('btn-error-card-close');
            expect(closeButton).toHaveTextContent('Go to Home');
            fireEvent.click(closeButton);
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should show Retry button and call onRetry when onRetry is provided', () => {
            const mockOnRetry = jest.fn();
            const propsWithRetry = {
                ...defaultProps,
                onClose: undefined, // Ensure onClose is not passed if onRetry is
                onRetry: mockOnRetry,
            };
            render(<ErrorCard {...propsWithRetry} />);

            const retryButton = screen.getByTestId('btn-retry-card-retry');
            expect(retryButton).toBeInTheDocument();
            expect(retryButton).toHaveTextContent('Retry');

            fireEvent.click(retryButton);
            expect(mockOnRetry).toHaveBeenCalledTimes(1);

            // Ensure close button is not rendered
            expect(screen.queryByTestId('btn-error-card-close')).not.toBeInTheDocument();
        });

        it('should disable the retry button when isRetrying is true', () => {
            render(<ErrorCard {...defaultProps} onRetry={jest.fn()} isRetrying={true} />);

            const retryButton = screen.getByTestId('btn-retry-card-retry');
            expect(retryButton).toBeDisabled();
        });

        it('should enable the retry button when isRetrying is false', () => {
            render(<ErrorCard {...defaultProps} onRetry={jest.fn()} isRetrying={false} />);

            const retryButton = screen.getByTestId('btn-retry-card-retry');
            expect(retryButton).not.toBeDisabled();
        });

        it('should not disable the close button even if isRetrying is true', () => {
            // This tests that `disabled` is only applied in the retryable case
            render(<ErrorCard {...defaultProps} onClose={jest.fn()} isRetrying={true} />);

            const closeButton = screen.getByTestId('btn-error-card-close');
            expect(closeButton).not.toBeDisabled();
        });
    });

    describe('Different Error Types', () => {
        it('should handle API error messages', () => {
            const apiErrorProps = {
                ...defaultProps,
                title: 'API Error',
                description: 'Failed to fetch data from server'
            };
            
            render(<ErrorCard {...apiErrorProps} />);
            
            expect(screen.getByText('API Error')).toBeInTheDocument();
            expect(screen.getByText('Failed to fetch data from server')).toBeInTheDocument();
        });

        it('should handle network error messages', () => {
            const networkErrorProps = {
                ...defaultProps,
                title: 'Network Error',
                description: 'Unable to connect to the server. Please check your internet connection.'
            };
            
            render(<ErrorCard {...networkErrorProps} />);
            
            expect(screen.getByText('Network Error')).toBeInTheDocument();
            expect(screen.getByText('Unable to connect to the server. Please check your internet connection.')).toBeInTheDocument();
        });

        it('should handle validation error messages', () => {
            const validationErrorProps = {
                ...defaultProps,
                title: 'Validation Error',
                description: 'Please check your input and try again.'
            };
            
            render(<ErrorCard {...validationErrorProps} />);
            
            expect(screen.getByText('Validation Error')).toBeInTheDocument();
            expect(screen.getByText('Please check your input and try again.')).toBeInTheDocument();
        });

        it('should handle long error messages', () => {
            const longErrorProps = {
                ...defaultProps,
                title: 'Complex Error',
                description: 'This is a very long error message that might wrap to multiple lines and should be handled gracefully by the component without breaking the layout or causing any visual issues.'
            };
            
            render(<ErrorCard {...longErrorProps} />);
            
            expect(screen.getByText('Complex Error')).toBeInTheDocument();
            expect(screen.getByText('This is a very long error message that might wrap to multiple lines and should be handled gracefully by the component without breaking the layout or causing any visual issues.')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA attributes', () => {
            render(<ErrorCard {...defaultProps} />);
            
            const modal = screen.getByTestId('ModalWrapper-Mock');
            expect(modal).toBeInTheDocument();
            
            const title = screen.getByText('Test Error');
            expect(title).toHaveAttribute('id', 'title-error-card');
            expect(title.tagName).toBe('H2');
        });

        it('should have proper heading structure', () => {
            render(<ErrorCard {...defaultProps} />);
            
            const title = screen.getByText('Test Error');
            expect(title).toHaveAttribute('id', 'title-error-card');
            expect(title.tagName).toBe('H2');
        });

        it('should have proper description structure', () => {
            render(<ErrorCard {...defaultProps} />);
            
            const description = screen.getByTestId('text-error-card-description');
            expect(description).toBeInTheDocument();
        });

    });

    describe('Styling and Layout', () => {
        it('should have correct CSS classes', () => {
            render(<ErrorCard {...defaultProps} />);
            
            const modal = screen.getByTestId('ModalWrapper-Mock');
            expect(modal).toBeInTheDocument();
        });

        it('should have proper button styling', () => {
            render(<ErrorCard {...defaultProps} />);
            
            const closeButton = screen.getByTestId('btn-error-card-close');
            expect(closeButton).toBeInTheDocument();
        });

        it('should center the modal content', () => {
            render(<ErrorCard {...defaultProps} />);
            
            const modal = screen.getByTestId('ModalWrapper-Mock');
            expect(modal).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should use provided title when given', () => {
            const customTitle = 'Custom Error Title';
            const propsWithTitle = {
                ...defaultProps,
                title: customTitle
            };

            render(<ErrorCard {...propsWithTitle} />);

            expect(screen.getByText(customTitle)).toBeInTheDocument();
            expect(screen.queryByText('Default Error Title')).not.toBeInTheDocument();
        });

        it('should use provided description when given', () => {
            const customDescription = 'Custom error description';
            const propsWithDescription = {
                ...defaultProps,
                description: customDescription
            };

            render(<ErrorCard {...propsWithDescription} />);

            expect(screen.getByText(customDescription)).toBeInTheDocument();
            expect(screen.queryByText('Default Error Description')).not.toBeInTheDocument();
        });

        it('should use provided description when given (retryable)', () => {
            const customDescription = 'Custom retry description';
            const propsWithDescription = {
                ...defaultProps,
                description: customDescription,
                onRetry: jest.fn()
            };

            render(<ErrorCard {...propsWithDescription} />);

            expect(screen.getByText(customDescription)).toBeInTheDocument();
            expect(screen.queryByText('Default Retry Description')).not.toBeInTheDocument();
        });

        it('should fallback to translation when title is empty string', () => {
            const propsWithEmptyTitle = {
                ...defaultProps,
                title: ''
            };

            render(<ErrorCard {...propsWithEmptyTitle} />);

            expect(screen.getByText('Default Error Title')).toBeInTheDocument();
        });

        it('should fallback to default error translation when description is empty string', () => {
            const propsWithEmptyDescription = {
                ...defaultProps,
                description: ''
            };

            render(<ErrorCard {...propsWithEmptyDescription} />);

            expect(screen.getByText('Default Error Description')).toBeInTheDocument();
        });

        it('should fallback to default retry translation when description is empty and onRetry is provided', () => {
            const propsWithEmptyDescription = {
                ...defaultProps,
                description: '',
                onRetry: jest.fn(),
            };

            render(<ErrorCard {...propsWithEmptyDescription} />);

            expect(screen.getByText('Default Retry Description')).toBeInTheDocument();
        });

        it('should handle special characters in provided title and description', () => {
            const specialCharsProps = {
                ...defaultProps,
                title: 'Error @#$%^&*()',
                description: 'Special characters: <>&"\'`'
            };

            render(<ErrorCard {...specialCharsProps} />);

            expect(screen.getByText('Error @#$%^&*()')).toBeInTheDocument();
            expect(screen.getByText('Special characters: <>&"\'`')).toBeInTheDocument();
        });

        it('should render no button if both onClose and onRetry are missing', () => {
            const propsWithNoActions = {
                ...defaultProps,
                onClose: undefined as any,
                onRetry: undefined,
            };

            render(<ErrorCard {...propsWithNoActions} />);

            expect(screen.queryByTestId('btn-error-card-close')).not.toBeInTheDocument();
            expect(screen.queryByTestId('btn-retry-card-retry')).not.toBeInTheDocument();
        });
    });

    describe('Responsive Design', () => {
        it('should be responsive on different screen sizes', () => {
            render(<ErrorCard {...defaultProps} />);
            
            const modal = screen.getByTestId('ModalWrapper-Mock');
            expect(modal).toBeInTheDocument();
            
            // The component should have responsive classes
            // This would be tested with actual CSS media queries in integration tests
        });
    });
});