import { Navigate, Route, Routes, useLocation} from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { IssuersPage } from './pages/IssuersPage';
import { Header } from './components/PageTemplate/Header';
import { Footer } from './components/PageTemplate/Footer';
import { FAQPage } from './pages/FAQPage';
import { CredentialsPage } from './pages/CredentialsPage';
import { RedirectionPage } from './pages/RedirectionPage';
import { useSelector } from 'react-redux';
import { RootState } from './types/redux';
import { getDirCurrentLanguage } from './utils/i18n';
import { PageNotFound } from './pages/PageNotFound';
import { AuthorizationPage } from './pages/AuthorizationPage';
import { VPAuthorizationPage } from './pages/VPAuthorizationPage';
import { HomePage } from './pages/HomePage';
import LoginSessionStatusChecker from './components/Common/LoginSessionStatusChecker';
import { PasscodePage } from './pages/User/Passcode/PasscodePage';
import { Layout } from './components/User/Layout';
import { HomePage as DashboardHomePage } from './pages/User/Home/HomePage';
import { useUser } from './hooks/User/useUser';
import { CredentialTypesPage } from './pages/User/CredentialTypes/CredentialTypesPage';
import { ResetPasscodePage } from './pages/User/ResetPasscode/ResetPasscodePage';
import { ProfilePage } from './pages/User/Profile/ProfilePage';
import { Pages, ROUTES} from "./utils/constants";
import { useInterceptor } from "./hooks/useInterceptor";
import { LandingGuard } from "./components/Guards/LandingGuard";


function RedirectToUserHome() {
    return <Navigate to={ROUTES.USER_HOME} replace />;
}

export const AppRouter = () => {
    useInterceptor()
    const location = useLocation();
    const language = useSelector((state: RootState) => state.common.language);
    const { isUserLoggedIn } = useUser();

    const headerRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [footerHeight, setFooterHeight] = useState(0);

    const getHeaderFooterHeights = () => {
        return {
            headerHeight:
                headerRef.current?.getBoundingClientRect().height ?? 0,
            footerHeight: footerRef.current?.getBoundingClientRect().height ?? 0
        };
    };

    useEffect(() => {
        const updateHeights = () => {
            const { headerHeight, footerHeight } = getHeaderFooterHeights();
            setHeaderHeight(headerHeight);
            setFooterHeight(footerHeight);
        };

        updateHeights();

        window.addEventListener('resize', updateHeights);
        return () => {
            window.removeEventListener('resize', updateHeights);
        };
    }, [location.pathname]);

    const wrapElement = (element: JSX.Element, isBGNeeded: boolean = true) => {
        return (
            <div
                className={`flex flex-col h-screen ${!isBGNeeded ? 'bg-iw-background' : 'bg bg-iw-background'
                    } font-base`}
                dir={getDirCurrentLanguage(language)}
            >
                <Header headerRef={headerRef} />
                <div
                    className="flex-grow overflow-y-auto"
                    style={{
                        marginTop: headerHeight,
                        marginBottom: footerHeight
                    }}
                >
                    {element}
                </div>
                <Footer footerRef={footerRef} />
            </div>
        );
    };

    function renderBasedOnAuthStatus(Element: React.FC) {
        return isUserLoggedIn() ? (
            <RedirectToUserHome />
        ) : (
            wrapElement(<Element />, false)
        );
    }

    return (
        <>
            <LoginSessionStatusChecker />
            <Routes>
                <Route path={ROUTES.ROOT} element={renderBasedOnAuthStatus(HomePage)}
                />
                <Route
                    path={Pages.ISSUERS}
                    element=
                            {wrapElement(
                            <LandingGuard><IssuersPage className="mt-10 mb-20" /></LandingGuard>)}
                />
                <Route
                    path={Pages.ISSUER_TEMPLATE}
                    element=
                            {wrapElement(<LandingGuard><CredentialsPage/></LandingGuard>)}
                        
                />
                <Route
                    path={Pages.FAQ}
                    element=
                            {wrapElement(<LandingGuard><FAQPage backUrl={ROUTES.ROOT} /></LandingGuard>)}  
                />
                <Route
                    path={Pages.REDIRECT}
                    element={wrapElement(<RedirectionPage />)}
                />
                <Route
                    path={Pages.AUTHORIZE}
                    element={wrapElement(<AuthorizationPage />)}
                />
                <Route path={Pages.USER}>
                    <Route path={Pages.PASSCODE} element={renderBasedOnAuthStatus(PasscodePage)} />
                    <Route path={Pages.RESET_PASSCODE} element={renderBasedOnAuthStatus(ResetPasscodePage)} />
                    <Route element={<Layout />}>

                        {/* "Add Card" destination: issuer selection for downloading a new card */}
                        <Route path={Pages.ISSUERS} element={<IssuersPage variant="dashboard" />} />
                        <Route path={Pages.HOME} element={<DashboardHomePage />} />
                        <Route path={Pages.AUTHORIZE} element={<VPAuthorizationPage />} />
                        <Route
                            path={Pages.ISSUER_TEMPLATE}
                            element={
                                <CredentialTypesPage backUrl={ROUTES.USER_ISSUERS} />
                            }
                        />
                        {/* Stored Cards was merged into Home; keep old links working */}
                        <Route path={Pages.CREDENTIALS} element={<RedirectToUserHome />} />
                        <Route path={Pages.PROFILE} element={<ProfilePage />} />
                        <Route path={Pages.FAQ} element={<FAQPage withHome={true} />} />
                    </Route>
                </Route>

                <Route path="/*" element={wrapElement(<PageNotFound />)} />
            </Routes>
        </>
    );
};
