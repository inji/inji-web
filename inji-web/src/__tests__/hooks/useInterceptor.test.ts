import {renderHook} from "@testing-library/react";
import {useInterceptor} from "../../hooks/useInterceptor";
import {useUser} from "../../hooks/User/useUser";
import {useLocation, useNavigate} from "react-router-dom";
import {apiInstance} from "../../hooks/useApi";
import {ROUTES} from "../../utils/constants";
import {AppStorage} from "../../utils/AppStorage";
import {userProfile} from "../../test-utils/mockObjects";

jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
    useLocation: jest.fn()
}));

jest.mock("../../hooks/User/useUser", () => ({
    useUser: jest.fn()
}));

jest.mock("../../hooks/useApi", () => ({
    apiInstance: {
        interceptors: {
            response: {
                use: jest.fn(),
                eject: jest.fn()
            }
        }
    }
}));

jest.mock("../../utils/AppStorage.ts", () => ({
    AppStorage: {
        setItem: jest.fn(),
        getItem: jest.fn(() => null)
    },
}))
describe("useInterceptor", () => {
    let navigateMock: jest.Mock;
    let removeUserMock: jest.Mock;
    let isUserLoggedInMock: jest.Mock;
    let interceptorMock: number;

    beforeEach(() => {
        jest.clearAllMocks();

        navigateMock = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigateMock);

        (useLocation as jest.Mock).mockReturnValue({
            pathname: "/test-path",
            search: "?test=true",
            hash: "#test"
        });

        removeUserMock = jest.fn();
        isUserLoggedInMock = jest.fn();
        (useUser as jest.Mock).mockReturnValue({
            removeUser: removeUserMock,
            isUserLoggedIn: isUserLoggedInMock
        });

        interceptorMock = 123; // Some arbitrary interceptor ID
        (apiInstance.interceptors.response.use as jest.Mock).mockReturnValue(interceptorMock);
    });

    const getErrorCallback = () => {
        renderHook(() => useInterceptor());
        return (apiInstance.interceptors.response.use as jest.Mock).mock.calls[0][1];
    };

    test("should set up response interceptor on mount", () => {
        renderHook(() => useInterceptor());

        expect(apiInstance.interceptors.response.use).toHaveBeenCalled();
    });

    test("should clean up interceptor on unmount", () => {
        const {unmount} = renderHook(() => useInterceptor());

        unmount();

        expect(apiInstance.interceptors.response.eject).toHaveBeenCalledWith(interceptorMock);
    });

    test("should handle successful responses correctly", () => {
        renderHook(() => useInterceptor());

        const successCallback = (apiInstance.interceptors.response.use as jest.Mock).mock.calls[0][0];
        const mockResponse = {data: "test data"};
        const result = successCallback(mockResponse);

        expect(result).toBe(mockResponse);
    });

    const sessionExpiredScenarios = [
        {
            description: "Session expired for logged-in (authenticated + unlocked wallet) user",
            url: "/wallets/123/credentials",
            loggedIn: true
        },
        {
            description: "Session expired for authenticated user, hitting user profile API",
            url: "/users/me",
            loggedIn: false
        },
        {
            description: "Session expired for authenticated user who is trying to unlock wallet",
            url: "/wallets/123/unlock",
            loggedIn: false
        },
        {
            description: "Session expired for authenticated user, hitting delete wallets API",
            url: "/wallets/123",
            loggedIn: false
        },
        {
            description: "Session expired for authenticated user, hitting create wallet or get all wallets API",
            url: "/wallets",
            loggedIn: false
        }
    ]

    test.each(sessionExpiredScenarios)("should redirect to login (root page) when accessing any protected API and response is unauthorized ($description)", async ({ loggedIn, url}) => {
        isUserLoggedInMock.mockReturnValue(loggedIn);
        const mockError = {
            response: {
                status: 401,
                config: {
                    url: url
                }
            }
        };
        (AppStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify({...userProfile, walletId: null}))

        const errorCallback = getErrorCallback();

        await assertRedirectToLogin(errorCallback, mockError)
        assertStoringOfCurrentLocation()
    })

    test.each([ROUTES.USER_PASSCODE, ROUTES.USER_RESET_PASSCODE])('should redirect to login when accessing protected API in passcode related page - %s and response is unauthorized', async (route) => {
        (useLocation as jest.Mock).mockReturnValue({
            pathname: route,
            search: null,
            hash: null
        });
        const mockError = {
            response: {
                status: 401,
                config: {
                    url: "/wallets/123/unlock"
                }
            }
        };
        isUserLoggedInMock.mockReturnValue(false);
        (AppStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify({...userProfile, walletId: null}))

        const errorCallback = getErrorCallback();

        await assertRedirectToLogin(errorCallback, mockError)
        expect(AppStorage.setItem).not.toHaveBeenCalled()
    })

    test("should not redirect for non-401 errors", async () => {
        isUserLoggedInMock.mockReturnValue(true);

        const errorCallback = getErrorCallback()
        const mockError = {
            response: {
                status: 500,
                config: {
                    url: "/some-endpoint"
                }
            }
        };

        await expect(errorCallback(mockError)).rejects.toBe(mockError);
        expect(removeUserMock).not.toHaveBeenCalled();
        expect(navigateMock).not.toHaveBeenCalled();
    });

    test("should not overwrite redirectTo when 401 happens on login home page", async () => {
        (useLocation as jest.Mock).mockReturnValue({
            pathname: ROUTES.ROOT,
            search: "",
            hash: ""
        });
        isUserLoggedInMock.mockReturnValue(false);
        (AppStorage.getItem as jest.Mock).mockReturnValue(null);

        const errorCallback = getErrorCallback();
        const mockError = {
            response: {
                status: 401,
                config: {url: "/users/me"}
            }
        };

        await expect(errorCallback(mockError)).rejects.toBe(mockError);
        expect(AppStorage.setItem).not.toHaveBeenCalled();
        expect(navigateMock).not.toHaveBeenCalled();
    });

    function assertStoringOfCurrentLocation() {
        expect(AppStorage.setItem).toHaveBeenCalledTimes(1);
        expect(AppStorage.setItem).toHaveBeenCalledWith("redirectTo", "/test-path?test=true#test", true);
    }

    async function assertRedirectToLogin(errorCallback: (arg0: { response: { status: number; config: { url: string; }; }; }) => any, mockError: { response: { status: number; config: { url: string } } }) {
        await expect(errorCallback(mockError)).rejects.toBe(mockError);
        expect(removeUserMock).toHaveBeenCalled();
        expect(navigateMock).toHaveBeenCalledWith(ROUTES.ROOT);
    }
});