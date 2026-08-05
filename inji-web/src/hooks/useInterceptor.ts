import {useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {KEYS, ROUTES} from "../utils/constants";
import {useUser} from "./User/useUser";
import {apiInstance} from "./useApi";
import {AppStorage} from "../utils/AppStorage";

export function useInterceptor() {
    const navigate = useNavigate();
    const location = useLocation();
    const {removeUser, isUserLoggedIn} = useUser()

    const interceptor = apiInstance.interceptors.response.use(function (response: any) {
        return response;
    }, function (error: {
        response: {
            config: { url: string; };
            status: number;
        };
    }) {
        /**
         * Logged-in user = Authentication via Provider (e.g. Google) + Unlocked wallet using Passcode.
         * Authenticated APIs that requires user to be authenticated but not necessarily with unlocked wallet.
         * 1. GET /users/me - User profile API
         * 2. GET /wallets - Get all wallets API
         * 3. POST /wallets - Create a new wallet API
         * 4. DELETE /wallets/:walletId - Delete a wallet API
         * 5. POST /wallets/:walletId/unlock - Unlock a wallet API
         */
            // Redirect to / page on logged-in user if unauthorized access is detected
        const currentRoute = location.pathname + location.search + location.hash;
        const isPasscodeRelatedRoute = location.pathname === ROUTES.USER_RESET_PASSCODE || location.pathname === ROUTES.USER_PASSCODE;
        const isSessionActive: boolean = !!AppStorage.getItem(KEYS.USER);
        
        if (error.response && error.response.status === 401) {
            // Avoid redirecting to passcode related pages in case of unauthorized access and re-login. This avoids unnecessary redirections to passcode related pages. If this is not leads to below sort of scenario.
            // Scenario: User authenticated via Provider -> tries to access passcode related page -> session expire & got unauthorized access
            // -> redirect to log in -> user logs in again -> enter passcode -> submit -> user is redirected to passcode page again // Here user is required to enter passcode again, which is not required.
            
            if (!isPasscodeRelatedRoute && location.pathname !== ROUTES.ROOT) {
                AppStorage.setItem(KEYS.REDIRECT_TO, currentRoute, true);
            }

            if (isUserLoggedIn() || isSessionActive) {
                removeUser()
                console.warn("Unauthorized access detected. Redirecting to / page.");
                navigate(ROUTES.ROOT)
            }
        }
        return Promise.reject(error as unknown as Error);
    });

    useEffect(() => {
        return () => {
            apiInstance.interceptors.response.eject(interceptor);
        };
    }, [navigate, location, interceptor]);
}
