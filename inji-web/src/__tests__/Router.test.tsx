import React from "react";
import {screen} from "@testing-library/react";
import {AppRouter} from "../Router";
import * as useUserModule from "../hooks/User/useUser";
import {renderMemoryRouterWithProvider} from "../test-utils/mockUtils";
import {AppStorage} from "../utils/AppStorage";
import {mockStore, nonPasscodeRelatedProtectedRoutes, unProtectedRoutes, userProfile} from "../test-utils/mockObjects";
import {LANDING_VISITED, ROUTES} from "../utils/constants";

jest.mock('../components/Preview/PDFViewer', () => ({
    PDFViewer: ({previewContent}: {
        previewContent: Blob
    }) => (
        <div data-testid="pdf-viewer">{previewContent && previewContent instanceof Blob ? "Test PDF Content" : ""}</div>
    ),
}));

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useSelector: jest.fn(selector => selector(mockStore.getState()))
}));
jest.mock("../hooks/User/useUser");
jest.mock("../components/PageTemplate/Header", () => ({
    Header: () => <div data-testid="header"/>
}));
jest.mock("../components/PageTemplate/Footer", () => ({
    Footer: () => <div data-testid="footer"/>
}));
jest.mock("../components/Common/LoginSessionStatusChecker", () => () => <div data-testid="login-checker"/>);
jest.mock("../pages/HomePage", () => ({
    HomePage: () => <div>HomePage</div>
}));
jest.mock("../pages/User/Passcode/PasscodePage", () => ({
    PasscodePage: () => <div>User/passcodePage</div>
}));
jest.mock("../pages/User/ResetPasscode/ResetPasscodePage", () => ({
    ResetPasscodePage: () => <div>User/reset-passcodePage</div>
}));
jest.mock("../pages/User/Home/HomePage.tsx", () => ({
    HomePage: () => <div>User/homePage</div>
}));
jest.mock("../components/User/Header.tsx", () => ({
    Header: () => <div data-testid="user-header">User Header</div>
}));
jest.mock("../utils/AppStorage.ts", () => ({
    AppStorage: {
        getItem: jest.fn(),
    },
}));

jest.mock("../pages/AuthorizationPage.tsx", () => ({
    AuthorizationPage: () => <div>AuthorizationPage</div>
}));

jest.mock("../pages/VPAuthorizationPage.tsx", () => ({
    VPAuthorizationPage: () => <div>User/authorizePage</div>
}));

jest.mock("../pages/CredentialsPage.tsx", () => ({
    CredentialsPage: () => <div>Issuers/issuer1Page</div>
}))

jest.mock("../pages/RedirectionPage.tsx", () => ({
    RedirectionPage: () => <div>RedirectPage</div>
}));

jest.mock("../pages/User/CredentialTypes/CredentialTypesPage.tsx", () => ({
    CredentialTypesPage: () => <div>User/issuers/issuer1Page</div>
}));

jest.mock("../pages/User/Profile/ProfilePage.tsx", () => ({
    ProfilePage: () => <div>User/profilePage</div>
}));

jest.mock("../pages/IssuersPage.tsx", () => ({
    IssuersPage: () => <div data-testid="Home-Page-Container">IssuersPage</div>
}));

jest.mock("../pages/FAQPage.tsx", () => ({
    FAQPage: () => <div>FaqPage</div>
}));

jest.mock("../pages/User/StoredCards/StoredCardsPage.tsx", () => ({
    StoredCardsPage: () => <div>User/credentialsPage</div>
}))

describe("AppRouter", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const routesWithHomeRedirectionOnLoggedIn = [
        {route: "/", notExpectedText: "HomePage", expectedText: "User/homePage"},
        {route: "/user/passcode", notExpectedText: "User/passcodePage", expectedText: "User/homePage"},
        {route: "/user/reset-passcode", notExpectedText: "User/reset-passcodePage", expectedText: "User/homePage"},
    ];

    const routesWithoutRedirectOnActiveSessionOnly = [
        {route: "/user/passcode", expectedText: "User/passcodePage", notExpectedText: "User/homePage"},
        {route: "/user/reset-passcode", expectedText: "User/reset-passcodePage", notExpectedText: "User/homePage"},
    ];

    const notFoundRoutes = [
        {isLoggedIn: true, description: "logged in mode", route: "/unknown", expectedText: /not found/i},
        {isLoggedIn: false, description: "guest mode", route: "/unknown", expectedText: /not found/i},
    ];

    const guestModeRoutes = unProtectedRoutes.filter(
        (route) => ![ROUTES.FAQ, ROUTES.ISSUERS, ROUTES.ISSUER("issuer1")].includes(route)
    );

    const protectedDeepLinks = [ROUTES.FAQ, ROUTES.ISSUERS, ROUTES.ISSUER("issuer1"),];

    it.each(routesWithHomeRedirectionOnLoggedIn)(
        "redirects to user home when logged in and url is $route",
        ({route, notExpectedText, expectedText}) => {
            (useUserModule.useUser as jest.Mock).mockReturnValue({isUserLoggedIn: () => true});

            renderMemoryRouterWithProvider(<AppRouter/>, [route]);

            expect(screen.queryByText(notExpectedText)).not.toBeInTheDocument();
            expect(screen.getByText(expectedText)).toBeInTheDocument();
        }
    );

    it("renders HomePage for root route when not logged in", async () => {
        (useUserModule.useUser as jest.Mock).mockReturnValue({isUserLoggedIn: () => false});
        renderMemoryRouterWithProvider(<AppRouter/>, ["/"]);

        await screen.findByText("HomePage");
        expect(screen.getByText("HomePage")).toBeInTheDocument();
        expect(screen.getByTestId("header")).toBeInTheDocument();
        expect(screen.getByTestId("footer")).toBeInTheDocument();
    });

    it.each(routesWithoutRedirectOnActiveSessionOnly)(
        'should not redirect to home page when user is not logged in (but session active) when url is $route',
        ({route, expectedText, notExpectedText}) => {
            (useUserModule.useUser as jest.Mock).mockReturnValue({isUserLoggedIn: () => false});
            // Mock storage with user (active session) but locked wallet
            (AppStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(userProfile));

            renderMemoryRouterWithProvider(<AppRouter/>, [route]);

            expect(screen.getByText(expectedText)).toBeInTheDocument();
            expect(screen.queryByText(notExpectedText)).not.toBeInTheDocument();
        }
    );

    it.each(notFoundRoutes)(
        "renders 404 page for unknown route when in $description",
        ({isLoggedIn, route, expectedText}) => {
            (useUserModule.useUser as jest.Mock).mockReturnValue({isUserLoggedIn: () => isLoggedIn});
            renderMemoryRouterWithProvider(<AppRouter/>, [route]);
            expect(screen.getByText(expectedText)).toBeInTheDocument();
        }
    );

    it.each(guestModeRoutes)("renders related guest mode page when route is %s", (route) => {
        route = route as string
        (useUserModule.useUser as jest.Mock).mockReturnValue({isUserLoggedIn: () => false});
        renderMemoryRouterWithProvider(<AppRouter/>, [`${route}`]);

        const expectedText = route === ROUTES.ROOT ? "HomePage" : getPageLabelFromRoute(route);
        expect(screen.getByText(expectedText)).toBeInTheDocument();
    })

    it.each(nonPasscodeRelatedProtectedRoutes)("renders related protected mode page when route is %s", (route) => {
        route = route as string
        (useUserModule.useUser as jest.Mock).mockReturnValue({isUserLoggedIn: () => true});
        renderMemoryRouterWithProvider(<AppRouter/>, [`${route}`]);

        let expectedText;
        if (route === ROUTES.USER_ISSUERS || route === ROUTES.ROOT) {
            expectedText = "User/homePage";
        } else if (route === ROUTES.USER_FAQ || route === ROUTES.USER_ISSUERS) { // common pages
            expectedText = `${route.charAt(6).toUpperCase() + route.slice(7)}Page`;
        } else {
            expectedText = getPageLabelFromRoute(route);
        }

        expect(screen.getByText(expectedText)).toBeInTheDocument();
    })

    function getPageLabelFromRoute(route: string): string {
        return `${route.charAt(1).toUpperCase() + route.slice(2)}Page`;
    }

    describe("LandingGuard integration for protected deep links", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            sessionStorage.clear();
            (useUserModule.useUser as jest.Mock).mockReturnValue({ isUserLoggedIn: () => false });
        });

        it.each(protectedDeepLinks)("redirects guest to HomePage when landingVisited is NOT set for %s",
            async (route) => {
                renderMemoryRouterWithProvider(<AppRouter />, [route]);
                expect(await screen.findByText("HomePage")).toBeInTheDocument();
            }
        );

        it.each(protectedDeepLinks)("allows access when landingVisited is set for %s",
            async (route) => {
                sessionStorage.setItem(LANDING_VISITED, "true");
                renderMemoryRouterWithProvider(<AppRouter />, [route]);
                const expectedText = getPageLabelFromRoute(route);
                expect(await screen.findByText(expectedText)).toBeInTheDocument();
            }
        );
    });
});