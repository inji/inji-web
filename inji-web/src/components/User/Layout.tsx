import React, {useEffect, useRef} from 'react';
import {Sidebar} from './Sidebar';
import {Header} from './Header';
import {Footer} from '../PageTemplate/Footer';
import {useSelector} from 'react-redux';
import {RootState} from '../../types/redux';
import {getCredentialTypeDisplayObjectForCurrentLanguage, getDirCurrentLanguage} from '../../utils/i18n';
import {Outlet, useLocation} from 'react-router-dom';
import DashboardBgTop from '../../assets/Background.svg';
import DashboardBgBottom from '../../assets/DashboardBgBottom.svg';
import 'react-toastify/dist/ReactToastify.css';
import {CrossIconButton} from '../Common/Buttons/CrossIconButton';
import LayoutStyles from "../Common/LayoutStyles";
import {useDownloadSessionDetails} from '../../hooks/User/useDownloadSession';
import {useTranslation} from "react-i18next";
import {showToast} from "../Common/toast/ToastWrapper";
import {CloseButtonProps} from "react-toastify/dist/components";
import {RequestStatus, ROUTES} from "../../utils/constants";
import { LogoutConfirmationModal } from '../../modals/LogoutConfirmationModal';
import { useUser } from '../../hooks/User/useUser';
import { useApi } from '../../hooks/useApi';
import { api } from '../../utils/api';

export const Layout: React.FC = () => {
    const {t} = useTranslation('Layout')
    const language = useSelector((state: RootState) => state.common.language);
    const location = useLocation();
    const headerRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const [headerHeight, setHeaderHeight] = React.useState(0);
    const [footerHeight, setFooterHeight] = React.useState(0);
    const [showLogoutModal, setShowLogoutModal] = React.useState(false);
    const {
        latestDownloadedSessionId,
        downloadInProgressSessions,
        setLatestDownloadedSessionId,
        currentSessionDownloadId,
        removeSession
    } = useDownloadSessionDetails();
    const { removeUser, isUserLoggedIn } = useUser();
    const logoutRequestApi = useApi();

    // Refs to avoid stale closure in popstate handler
    const locationRef = useRef(location.pathname);
    const isUserLoggedInRef = useRef(isUserLoggedIn);

    // Update refs when values change
    useEffect(() => {
        locationRef.current = location.pathname;
        isUserLoggedInRef.current = isUserLoggedIn;
    }, [location.pathname, isUserLoggedIn]);

    useEffect(() => {
        const updateHeights = () => {
            const headerHeight =
                headerRef.current?.getBoundingClientRect().height ?? 0;
            const footerHeight =
                footerRef.current?.getBoundingClientRect().height ?? 0;
            setHeaderHeight(headerHeight);
            setFooterHeight(footerHeight);
        };

        updateHeights();
        window.addEventListener('resize', updateHeights);
        return () => window.removeEventListener('resize', updateHeights);
    }, []);

    useEffect(() => {
        try {
            const currentState: any = window.history.state || {};
            // install only once per session (per tab) when inside /user/* layout
            if (!currentState?.injiSentinelInstalled) {
                // first replace current entry with a sentinel marker.
                window.history.replaceState(
                    { injiSentinel: true, injiSentinelInstalled: true },
                    '',
                    locationRef.current
                );
                // push the actual visible page state (no extra flag) so Back lands on sentinel
                window.history.pushState(
                    { injiSentinelInstalled: true },
                    '',
                    locationRef.current
                );
            }
            const onPopState = (e: PopStateEvent) => {
                const state = e.state as any;
                if (state?.injiSentinel) {
                    if (locationRef.current === ROUTES.USER_HOME && isUserLoggedInRef.current?.()) {
                        setShowLogoutModal(true);
                        // Keep user on the active entry without growing history
                        window.history.go(1);
                        return;
                    }
                    // Other /user/* routes: silent bounce to block IdP exposure
                    window.history.go(1);
                }
            };
            window.addEventListener('popstate', onPopState);
            return () => window.removeEventListener('popstate', onPopState);
        } catch (err) {
            console.warn('Sentinel history setup failed:', err);
        }
    }, []);

    const handleLogout = async () => {
        try {
            const response = await logoutRequestApi.fetchData({
                apiConfig: api.userLogout,
            });
            if (response.ok()) {
                removeUser?.();
                setShowLogoutModal(false);
                window.location.replace(ROUTES.ROOT);
            } else {
                const parsedErrors = (response.error as any)?.response?.data?.errors;
                const errorCode = parsedErrors?.[0]?.errorCode;
                if (errorCode === 'user_logout_error') {
                    removeUser?.();
                    setShowLogoutModal(false);
                    window.location.replace(ROUTES.ROOT);
                } else {
                    throw new Error(parsedErrors?.[0]?.errorMessage || 'Logout failed');
                }
            }
        } catch (error) {
            // As a fallback, clear client state and redirect
            removeUser?.();
            setShowLogoutModal(false);
            window.location.replace(ROUTES.ROOT);
        }
    };
    const handleStayOnPage = () => {
        setShowLogoutModal(false);
    };

    useEffect(() => {
            if (latestDownloadedSessionId && !currentSessionDownloadId) {
                const session = downloadInProgressSessions[latestDownloadedSessionId];
                if (session) {
                    const credentialTypeDisplayName =
                        getCredentialTypeDisplayObjectForCurrentLanguage(
                            session.credentialTypeDisplayObj,
                            language
                        ).name;
                    const {downloadStatus} = session;

                    const toastOptions = {
                        limit: 1,
                        autoClose: 3000,
                        icon: undefined,
                        closeButton: handleToasterCloseButton,
                        style: {
                            marginTop: headerHeight + 5,
                        },
                        className: ({type}: any) => {
                            const toastType = type ?? 'default';
                            return `${getToasterBackgroundColor(toastType)} ${LayoutStyles.toastContainerBase}`;
                        }
                    };
                    const toastMessage = downloadStatus === RequestStatus.DONE
                        ? t('VCDownload.success', {cardType: credentialTypeDisplayName})
                        : t('VCDownload.error', {cardType: credentialTypeDisplayName})

                    showToast({
                            message: toastMessage,
                            type: downloadStatus === RequestStatus.DONE ? 'success' : 'error',
                            options: {...toastOptions}
                        }
                    );
                    setLatestDownloadedSessionId(null);
                    removeSession(latestDownloadedSessionId);
                }
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [latestDownloadedSessionId, downloadInProgressSessions, setLatestDownloadedSessionId, removeSession]
    )
    ;

    const contextClassMap = {
        success: LayoutStyles.successToastContainer,
        error: LayoutStyles.errorToastContainer,
        default: ''
    };

    const getToasterBackgroundColor = (type: string) => {
        return contextClassMap[type as keyof typeof contextClassMap];
    };

    const handleToasterCloseButton = ({closeToast}: CloseButtonProps) => (
        <CrossIconButton
            onClick={(e) => {
                e.stopPropagation();
                closeToast(e);
            }}
            iconClassName={LayoutStyles.closeIcon}
        />
    );

    return (
        <div
            className={LayoutStyles.mainContainer}
            dir={getDirCurrentLanguage(language)}
        >
            <Header headerRef={headerRef} headerHeight={headerHeight}/>

            <div
                className={LayoutStyles.contentContainer}
                style={{
                    marginTop: headerHeight,
                    marginBottom: footerHeight,
                    zIndex: 0
                }}
            >
                <Sidebar/>
                <div
                    className={LayoutStyles.sidebarAndOutletContainer}
                    style={{zIndex: 1}}
                >
                    <img
                        src={DashboardBgTop}
                        alt="Gradient Top Background"
                        className={LayoutStyles.dashboardBgTop}
                    />

                    <img
                        src={DashboardBgBottom}
                        alt="Gardient Bottom Background"
                        className={LayoutStyles.dashboardBgBottom}
                    />

                    <div className={LayoutStyles.outletWrapper}>
                        <div className={LayoutStyles.outletInner}>
                            <Outlet />
                        </div>
                    </div>

                </div>
            </div>

            {/* Logout confirmation shown only when user tries to go back from /user/home */}
            <LogoutConfirmationModal
                isOpen={showLogoutModal}
                onLogout={handleLogout}
                onStayOnPage={handleStayOnPage}
                testId="logout-confirm-on-back"
            />

            <Footer footerRef={footerRef}/>
        </div>
    );
};