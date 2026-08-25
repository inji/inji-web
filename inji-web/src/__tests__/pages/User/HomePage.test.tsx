import {render, screen, waitFor} from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useUser } from '../../../hooks/User/useUser';
import { HomePage } from '../../../pages/User/Home/HomePage';
import { showToast } from '../../../components/Common/toast/ToastWrapper';

// Mock dependencies
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            if (key === 'Home.welcome') return 'Welcome';
            if (key === 'Home.loginSuccess') return 'Login successful';
            return key;
        },
    }),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}));

jest.mock('../../../hooks/User/useUser', () => ({
    useUser: jest.fn(),
}));

jest.mock('../../../pages/IssuersPage', () => ({
    IssuersPage: () => <div data-testid="issuers-page">IssuersPage</div>,
}));

jest.mock('../../../components/Common/toast/ToastWrapper', () => ({
    showToast: jest.fn(),
}));

describe('HomePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useLocation as jest.Mock).mockReturnValue({
            state: null,
            key: 'default',
        });
    });

    it('renders welcome message with PascalCase name', () => {
        (useUser as jest.Mock).mockReturnValue({
            user: {displayName: 'John Doe'},
        });

        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        expect(screen.getByText("Welcome John Doe!")).toBeInTheDocument();
    });

    it('renders IssuersPage component', () => {
        (useUser as jest.Mock).mockReturnValue({
            user: {displayName: 'Test User'},
        });

        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );
        expect(screen.getByTestId('issuers-page')).toBeInTheDocument();
    });

    it('shows login success toast when location state has loginSuccess true', async () => {
        (useUser as jest.Mock).mockReturnValue({ user: { displayName: 'John Doe' } });
        (useLocation as jest.Mock).mockReturnValue({
            state: { loginSuccess: true },
            key: 'test-key',
        });

        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(showToast).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Login successful',
                    type: 'success',
                    testId: 'login-success-toast',
                }),
            );
        });
    });

    it('shows login success toast when sessionStorage flag is set and clears the flag', async () => {
        (useUser as jest.Mock).mockReturnValue({ user: { displayName: 'John Doe' } });
        (useLocation as jest.Mock).mockReturnValue({
            state: null,
            key: 'test-key',
        });

        window.sessionStorage.setItem('showLoginSuccessToast', 'true');
        const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

        try {
            render(
                <MemoryRouter>
                    <HomePage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(removeItemSpy).toHaveBeenCalledWith('showLoginSuccessToast');
            });
            expect(showToast).toHaveBeenCalled();
        } finally {
            removeItemSpy.mockRestore();
        }
    });
    
    it('matches snapshot when user is undefined', () => {
        (useUser as jest.Mock).mockReturnValue({ user: undefined });
        const { asFragment } = render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );
        expect(asFragment()).toMatchSnapshot();
      });
    
      it('matches snapshot when user has a displayName', () => {
        (useUser as jest.Mock).mockReturnValue({ user: { displayName: 'Jane Smith' } });
        const { asFragment } = render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );
        expect(asFragment()).toMatchSnapshot();
      });
});
