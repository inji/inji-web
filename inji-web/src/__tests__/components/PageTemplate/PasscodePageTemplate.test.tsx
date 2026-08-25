import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {PasscodePageTemplate} from '../../../components/PageTemplate/PasscodePage/PasscodePageTemplate';

describe('PasscodePageTemplate Component', () => {
    const mockOnErrorClose = jest.fn();
    const mockOnBack = jest.fn();
    const mockTestId = 'test';
    const mockTitle = 'Test Title';
    const mockSubtitle = 'Test Subtitle';
    const mockError = 'Test Error';
    const mockContent = <div data-testid="content">Test Content</div>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders with all elements correctly', () => {
        render(
            <PasscodePageTemplate
                title={mockTitle}
                subtitle={mockSubtitle}
                error={mockError}
                onErrorClose={mockOnErrorClose}
                content={mockContent}
                contentTestId={"content-test"}
                testId={mockTestId}
            />
        );

        expect(screen.getByTestId('test-page')).toBeInTheDocument();
        expect(screen.getByTestId('backdrop-test')).toBeInTheDocument();
        expect(screen.getByTestId('title-test')).toHaveTextContent(mockTitle);
        expect(screen.getByTestId('test-description')).toHaveTextContent(mockSubtitle);
        expect(screen.getByTestId('error-test')).toBeInTheDocument();
        expect(screen.getByTestId('btn-close-icon-container')).toBeInTheDocument();
        expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    test('renders without error when error is null', () => {
        render(
            <PasscodePageTemplate
                title={mockTitle}
                subtitle={mockSubtitle}
                error={null}
                onErrorClose={mockOnErrorClose}
                content={mockContent}
                contentTestId={"content-test"}
                testId={mockTestId}
            />
        );

        expect(screen.queryByTestId('error-passcode')).not.toBeInTheDocument();
    });

    test('renders with back button when onBack is provided', () => {
        render(
            <PasscodePageTemplate
                title={mockTitle}
                subtitle={mockSubtitle}
                content={mockContent}
                contentTestId={"content-test"}
                testId={mockTestId}
                onBack={mockOnBack}
            />
        );

        // Back button should be rendered
        expect(screen.getByTestId('btn-back-arrow-container')).toBeInTheDocument();
        expect(screen.getByTestId('icon-back-arrow')).toBeInTheDocument();
        expect(screen.getByTestId('subtitle-test')).toHaveTextContent(mockSubtitle);

        // Regular subtitle should not be present
        expect(screen.queryByTestId('passcode-description')).not.toBeInTheDocument();
    });

    test('calls onErrorClose when close button is clicked', () => {
        render(
            <PasscodePageTemplate
                title={mockTitle}
                subtitle={mockSubtitle}
                error={mockError}
                onErrorClose={mockOnErrorClose}
                content={mockContent}
                contentTestId={"content-test"}
                testId={mockTestId}
            />
        );

        fireEvent.click(screen.getByTestId('btn-close-icon-container'));

        expect(mockOnErrorClose).toHaveBeenCalledTimes(1);
    });

    test('calls onBack when back button is clicked', () => {
        render(
            <PasscodePageTemplate
                title={mockTitle}
                subtitle={mockSubtitle}
                content={mockContent}
                contentTestId={"content-test"}
                testId={mockTestId}
                onBack={mockOnBack}
            />
        );

        fireEvent.click(screen.getByTestId('btn-back-arrow-container'));
        expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    test('renders without cross button when onErrorClose is not provided', () => {
        render(
            <PasscodePageTemplate
                title={mockTitle}
                subtitle={mockSubtitle}
                error={mockError}
                content={mockContent}
                contentTestId={"content-test"}
                testId={mockTestId}
            />
        );

        expect(screen.getByTestId('error-test')).toBeInTheDocument();
        expect(screen.queryByTestId('cross-icon-button')).not.toBeInTheDocument();
    });

    test('matches snapshot', () => {
        const {asFragment} = render(
            <PasscodePageTemplate
                title={mockTitle}
                subtitle={mockSubtitle}
                error={mockError}
                onErrorClose={mockOnErrorClose}
                content={mockContent}
                contentTestId={"content-test"}
                testId={mockTestId}
                onBack={mockOnBack}
            />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    test('renders profile image with accessible alt text when user has profilePictureUrl', () => {
        const userWithPhoto = {
            displayName: 'Jane Doe',
            profilePictureUrl: 'https://example.com/photo.jpg',
            email: 'jane@example.com'
        };

        render(
            <PasscodePageTemplate
                title={mockTitle}
                subtitle={mockSubtitle}
                content={mockContent}
                contentTestId={"content-test"}
                testId={mockTestId}
                user={userWithPhoto}
            />
        );

        const img = screen.getByRole('img', { name: /profile picture for jane doe/i });
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('alt', 'Profile picture for Jane Doe');
    });

    test('renders profile initials with role img and aria-label when user has no profile picture', () => {
        const userWithInitials = {
            displayName: 'John Smith',
            profilePictureUrl: '',
            email: 'john@example.com'
        };

        render(
            <PasscodePageTemplate
                title={mockTitle}
                subtitle={mockSubtitle}
                content={mockContent}
                contentTestId={"content-test"}
                testId={mockTestId}
                user={userWithInitials}
            />
        );

        const initials = screen.getByRole('img', { name: /profile initials for john smith/i });
        expect(initials).toBeInTheDocument();
        expect(initials).toHaveAttribute('aria-label', 'Profile initials for John Smith');
        expect(initials).toHaveTextContent('J');
    });
});