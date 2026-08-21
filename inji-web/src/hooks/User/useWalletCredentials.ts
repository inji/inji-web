import {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {ApiError, ErrorType, WalletCredential} from '../../types/data';
import {RootState} from '../../types/redux';
import {api} from '../../utils/api';
import {HTTP_STATUS_CODES, NETWORK_ERROR_MESSAGE} from '../../utils/constants';
import {useApi} from '../useApi';

/**
 * Owns fetching, searching and error mapping for the logged-in user's wallet
 * credentials. Shared by the dashboard Home page and the Stored Cards page.
 */
export const useWalletCredentials = () => {
    const [credentials, setCredentials] = useState<WalletCredential[]>([]);
    const [filteredCredentials, setFilteredCredentials] = useState<WalletCredential[]>([]);
    const walletCredentialsApi = useApi<WalletCredential[]>();
    const [loading, setLoading] = useState(true);
    const language = useSelector((state: RootState) => state.common.language);
    const [error, setError] = useState<string>();

    const fetchWalletCredentials = async () => {
        setLoading(true);
        setError(undefined);
        try {
            const fetchWalletCredentials = api.fetchWalletVCs;

            const response = await walletCredentialsApi.fetchData({
                headers: fetchWalletCredentials.headers(language),
                apiConfig: fetchWalletCredentials
            });

            if (response.ok()) {
                const responseData = response.data!;
                setCredentials(responseData);
                setFilteredCredentials(responseData);
            } else {
                if (response.error?.message === (NETWORK_ERROR_MESSAGE) && !navigator.onLine) {
                    setError("networkError");
                    return;
                }

                switch (response.status) {
                    case HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR:
                        setError("internalServerError");
                        break;
                    case HTTP_STATUS_CODES.SERVICE_UNAVAILABLE:
                        setError("serviceUnavailable");
                        break;
                    case HTTP_STATUS_CODES.BAD_REQUEST: {
                        const errorMessage = ((response.error as ApiError)?.response?.data as ErrorType).errorMessage ?? "";
                        const invalidWalletRequests = [
                            "Wallet key not found in session",
                            "Wallet is locked",
                            "Invalid Wallet ID. Session and request Wallet ID do not match"
                        ];
                        setError(
                            invalidWalletRequests.includes(errorMessage)
                                ? "invalidWalletRequest"
                                : "invalidRequest"
                        );
                        break;
                    }
                    default:
                        setError("unknownError");
                }
            }
        } catch {
            setError("unknownError");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchWalletCredentials();
        // fetchWalletCredentials is redefined every render; `language` is the
        // only input that should refetch, since it sets Accept-Language.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);

    const filterCredentials = (searchText: string) => {
        if (searchText === "") {
            setFilteredCredentials(credentials);
        } else {
            const filteredCredentialsToBeUpdated = credentials.filter((credential: WalletCredential) =>
                credential.credentialTypeDisplayName.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredCredentials(filteredCredentialsToBeUpdated);
        }
    };

    const refreshCredentials = async () => {
        await fetchWalletCredentials();
    };

    return {credentials, filteredCredentials, loading, error, filterCredentials, refreshCredentials};
};
