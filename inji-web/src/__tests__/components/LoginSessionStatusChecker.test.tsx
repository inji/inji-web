import React from 'react';
import {render, waitFor} from '@testing-library/react';
import {useUser} from '../../hooks/User/useUser';
import {useLocation, useNavigate} from 'react-router-dom';
import {AppStorage} from '../../utils/AppStorage';
import {KEYS, OPENID_VP_LOGIN, ROUTES} from '../../utils/constants';
import LoginSessionStatusChecker from "../../components/Common/LoginSessionStatusChecker";
import {nonPasscodeRelatedProtectedRoutes, protectedRoutes, unProtectedRoutes} from "../../test-utils/mockObjects";

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
    useLocation: jest.fn(),
}));

jest.mock('../../hooks/User/useUser', () => ({
    useUser: jest.fn(),
}));

jest.mock('../../utils/AppStorage.ts', () => ({
    AppStorage: {
        getItem: jest.fn(),
    },
}));

describe('LoginSessionStatusChecker', () => {
    const mockNavigate = jest.fn();
    const mockRemoveUser = jest.fn();
    const mockFetchUserProfile = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        (useUser as jest.Mock).mockReturnValue({
            removeUser: mockRemoveUser,
            fetchUserProfile: mockFetchUserProfile,
        });
    });

    const protectedRoutesWithoutRoot = protectedRoutes.filter(route => route !== ROUTES.ROOT);

    const passcodeRelatedRoutes = [ROUTES.USER_PASSCODE, ROUTES.USER_RESET_PASSCODE];


    test.each(nonPasscodeRelatedProtectedRoutes)('should redirect to passcode page when session is active but no wallet ID for path %s', async (route) => {
        (useLocation as jest.Mock).mockReturnValue({pathname: route});
        setupMockActiveSessionInStorage()

        render(<LoginSessionStatusChecker/>);

        await waitFor(() =>
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.USER_PASSCODE)
        )
    });

    test.each(unProtectedRoutes)('should not redirect to login when accessing unprotected route - %s with active session', (route) => {
        (useLocation as jest.Mock).mockReturnValue({pathname: route});
        setupMockActiveSessionInStorage();

        render(<LoginSessionStatusChecker/>);

        expect(mockNavigate).not.toHaveBeenCalled();
    })

    test.each(passcodeRelatedRoutes)('should not redirect to login when accessing passcode related route - %s with active session', (route) => {
        (useLocation as jest.Mock).mockReturnValue({pathname: route});
        setupMockActiveSessionInStorage();

        render(<LoginSessionStatusChecker/>);

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalledWith(ROUTES.USER_PASSCODE);
    })

    // In case of accessing root page, we should not redirect to root page again
    test.each(protectedRoutesWithoutRoot)('should redirect to login (root page) when accessing protected route - %s without being logged in', async (route) => {
        (useLocation as jest.Mock).mockReturnValue({pathname: route});
        // Mock storage with no user and no wallet ID
        (AppStorage.getItem as jest.Mock).mockReturnValue(null);

        render(<LoginSessionStatusChecker/>);

        await waitFor(() => expect(mockRemoveUser).toHaveBeenCalled())
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ROOT);
    });

    test('should set OpenID VP login intent when unauthenticated on /user/authorize', async () => {
        const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
        (useLocation as jest.Mock).mockReturnValue({
            pathname: ROUTES.USER_AUTHORIZE,
            search: '',
        });
        (AppStorage.getItem as jest.Mock).mockReturnValue(null);

        render(<LoginSessionStatusChecker/>);

        await waitFor(() => expect(mockRemoveUser).toHaveBeenCalled());
        expect(setItemSpy).toHaveBeenCalledWith(OPENID_VP_LOGIN, 'true');
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ROOT);
        setItemSpy.mockRestore();
    });

    test("should not redirect to login when fetching user profile fails and path is already root page", async () => {
        (useLocation as jest.Mock).mockReturnValue({pathname: ROUTES.ROOT});
        (AppStorage.getItem as jest.Mock).mockReturnValue(null);
        mockFetchUserProfile.mockRejectedValue(new Error("Fetch failed"));

        render(<LoginSessionStatusChecker/>);

        expect(mockNavigate).not.toHaveBeenCalled();
    })

    // Root page ("/") is a case where if logged in its redirected to user home page or not - This is handled in AppRouter so no extra redirection in LoginSessionStatusChecker
    test.each(protectedRoutes)('should not redirect to login when user is logged in and accessing protected route - %s', (route) => {
        (useLocation as jest.Mock).mockReturnValue({pathname: route});
        setupMockLoggedInStorage();

        render(<LoginSessionStatusChecker/>);

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test.each(unProtectedRoutes)('should not redirect to login when user is logged in and accessing unprotected route - %s', (route) => {
        (useLocation as jest.Mock).mockReturnValue({pathname: route});
        setupMockLoggedInStorage();

        render(<LoginSessionStatusChecker/>);

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test.each(unProtectedRoutes)("should not redirect to login when accessing unprotected route - %s when session is active", (route) => {
        (useLocation as jest.Mock).mockReturnValue({pathname: route});
        setupMockLoggedInStorage()

        render(<LoginSessionStatusChecker/>);

        expect(mockNavigate).not.toHaveBeenCalled();
    })

    test('should fetch user profile on mount', () => {
        (useLocation as jest.Mock).mockReturnValue({pathname: ROUTES.USER_CREDENTIALS});

        render(<LoginSessionStatusChecker/>);

        expect(mockFetchUserProfile).toHaveBeenCalled();
    });

    test('should add and remove storage event listener', () => {
        (useLocation as jest.Mock).mockReturnValue({pathname: ROUTES.USER_CREDENTIALS});
        const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

        const {unmount} = render(<LoginSessionStatusChecker/>);

        expect(addEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
        unmount();
        expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    });

    test("should redirect to login (root page) when fetching user profile fails", async () => {
        (useLocation as jest.Mock).mockReturnValue({pathname: ROUTES.USER_CREDENTIALS});
        mockFetchUserProfile.mockRejectedValue(new Error("Fetch failed"));

        render(<LoginSessionStatusChecker/>);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ROOT);
        });
    })

    test.each([KEYS.USER, KEYS.WALLET_ID])("should recheck on storage change of %s key", async (storageKey) => {
        (useLocation as jest.Mock).mockReturnValue({pathname: ROUTES.USER_CREDENTIALS});
        const mockStorageEvent = new StorageEvent('storage', {
            key: storageKey,
            newValue: undefined
        });
        render(<LoginSessionStatusChecker/>);

        window.dispatchEvent(mockStorageEvent);

        expect(mockFetchUserProfile).toHaveBeenCalled();
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ROOT))
    })

    function setupMockLoggedInStorage() {
        (AppStorage.getItem as jest.Mock).mockImplementation((key) => {
            if (key === KEYS.USER) return JSON.stringify({username: 'testUser'});
            if (key === KEYS.WALLET_ID) return 'wallet-123';
            return null;
        });
    }

    function setupMockActiveSessionInStorage() {
        (AppStorage.getItem as jest.Mock).mockImplementation((key) => {
            if (key === KEYS.USER) return JSON.stringify({username: 'testUser'});
            return null;
        });
    }
});