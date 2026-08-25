import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { IssuersPage } from '../../IssuersPage';
import { useUser } from '../../../hooks/User/useUser';
import { convertStringIntoPascalCase } from "../../../utils/misc";
import { HomePageStyles } from "./HomePageStyles";
import { showToast } from '../../../components/Common/toast/ToastWrapper';

export const HomePage: React.FC = () => {
    const { t } = useTranslation('User');
    const [displayName, setDisplayName] = useState<string | undefined>(undefined);
    const { user } = useUser();
    const userDisplayName = user?.displayName;
    const location = useLocation();
    const hasShownLoginToast = useRef(false);

    useEffect(() => {
        setDisplayName(userDisplayName);
    }, [userDisplayName]);

    useEffect(() => {
        // Check if we're coming from a successful login
        // Use sessionStorage as primary method since location.state can be lost during navigation
        const loginSuccessFromStorage = sessionStorage.getItem('showLoginSuccessToast');
        const state = location.state as { loginSuccess?: boolean } | null;

        const shouldShowToast = (state?.loginSuccess || loginSuccessFromStorage === 'true') && !hasShownLoginToast.current;

        if (shouldShowToast) {
            // Small delay to ensure component is fully rendered
            const timer = setTimeout(() => {
                showToast({
                    message: t('Home.loginSuccess'),
                    type: 'success',
                    testId: 'login-success-toast'
                });
                hasShownLoginToast.current = true;
                // Clear the sessionStorage flag
                if (loginSuccessFromStorage === 'true') {
                    sessionStorage.removeItem('showLoginSuccessToast');
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [location.key, t]);

    return (
        <div className={HomePageStyles.container}>
            <h1 className={HomePageStyles.welcomeText}>
                {`${t('Home.welcome')} ${convertStringIntoPascalCase(
                    displayName
                )}!`}
            </h1>
            <IssuersPage />
        </div>
    );
};
