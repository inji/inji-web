import {useCallback, useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useUser} from '../../hooks/User/useUser';
import {KEYS, ROUTES} from '../../utils/constants';
import {AppStorage} from "../../utils/AppStorage";

const loginProtectedPrefixes = [ROUTES.USER];

const isLoginProtectedRoute = (pathname: string) => {
    return loginProtectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

/**
 * LoginSessionStatusChecker component checks the login session status
 * and redirects the user to the appropriate page based on their login state.
 * It listens for changes in the local storage to update the session status.
 * It relies on the storage data to determine if the user is logged in or not.
 */
const LoginSessionStatusChecker = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {removeUser, fetchUserProfile} = useUser();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isRootPage = useCallback(() => location.pathname === ROUTES.ROOT, [location.pathname]);

    const redirectToLogin = useCallback(() => {
        removeUser()
        if (!isRootPage()) {
            console.warn("Redirecting to / page as accessing protected route without login from ", location.pathname);
            navigate(ROUTES.ROOT, {
                state: {
                    from: {
                        pathname: location.pathname
                    }
                }
            });
        }
    }, [isRootPage, location.pathname, navigate, removeUser]);


    const validateStatus = useCallback(() => {
        const user = AppStorage.getItem(KEYS.USER);
        const isSessionActive: boolean = !!user
        const walletId = AppStorage.getItem(KEYS.WALLET_ID);
        const isLoggedIn = !!walletId && isSessionActive;
        const isPasscodeRelatedRoute = location.pathname === ROUTES.USER_RESET_PASSCODE || location.pathname === ROUTES.USER_PASSCODE;

        /**
         * If user is not logged in, ask them to login again or unlock wallet based on the session state for a protected route.
         * Guest routes are accessible without any restriction.
         * Root page is a special case that is both a guest and a protected route.
         *      - redirects to passcode page if session is active.
         *      - redirects to home page if already logged in. (Handled in AppRouter.tsx)
         *      - no redirection if on guest mode.
         */

        if (!isLoggedIn && (isLoginProtectedRoute(location.pathname) || isRootPage())) {
            // Redirect based on session state
            if (isSessionActive) {
                // User can stay on passcode routes if session is active
                if (isPasscodeRelatedRoute) {
                    return;
                }
                // Session active but wallet locked - redirect to passcode
                console.warn('Session active but wallet locked, redirecting to passcode page');
                navigate(ROUTES.USER_PASSCODE);
            } else {
                // No active session - clear user data and redirect to log in
                redirectToLogin()
            }
        }
    }, [location.pathname, isRootPage, navigate, redirectToLogin]);


    const fetchUser = useCallback(async () => {
        try {
            setIsLoading(true)
            await fetchUserProfile();
            setIsLoading(false)
        } catch (error) {
            console.error('Error fetching user profile:', error);
            if (isLoginProtectedRoute(location.pathname)) {
                redirectToLogin();
            }
        }
    }, [redirectToLogin, fetchUserProfile, location.pathname]);

    // on app launch, populate the data from backend
    useEffect(() => {
        void fetchUser();

        const handleStorageChange = (event: any) => {
            if (event.key === KEYS.USER || event.key === KEYS.WALLET_ID) {
                void fetchUser();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // on every path change, validate the status. This happens after app launch handlers are set up
    useEffect(() => {
        if (!isLoading) {
            validateStatus();
        }
    }, [location.pathname, validateStatus, isLoading]);

    return null;
};

export default LoginSessionStatusChecker;
