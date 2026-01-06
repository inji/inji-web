import React, { useEffect, useState } from "react";
import { HomeBanner } from "../components/Home/HomeBanner";
import { HomeFeatures } from "../components/Home/HomeFeatures";
import { HomeQuickTip } from "../components/Home/HomeQuickTip";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useLocation } from 'react-router-dom';
import { LoginFailedModal } from '../components/Login/LoginFailedModal';
import { LANDING_VISITED } from "../utils/constants";

const Status = {
    SUCCESS: "success",
    FAILURE: "error"
};

export const HomePage: React.FC = () => {
    const { t } = useTranslation("HomePage");
    const [toastVisible, setToastVisible] = useState(false);
    const location = useLocation();
    const [isLoginFailed, setIsLoginFailed] = useState(false);

    // to mark landing as visited
    useEffect(() => {
        try {
            sessionStorage.setItem(LANDING_VISITED, "true");
        } catch (e) {
            console.warn("Unable to access sessionStorage", e);
        }
    }, []);

    // to stop scrolling the blurred background when login failed modal is showing up, scrolling is locked.
    useEffect(() => {
        if (isLoginFailed) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        // Cleaning up the class when the component unmounts
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [isLoginFailed]);

    // If google login is failing,show login failed modal
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("status") === Status.FAILURE) {
            setIsLoginFailed(true);
        }
    }, [location]);

    const showToast = (message: string) => {
        if (toastVisible) return;
        setToastVisible(true);
        toast.warning(message, {
            onClose: () => setToastVisible(false),
            toastId: "toast-wrapper",
            autoClose: false
        });
    };

    return (
        <div>
            <div className={"pb-20 flex flex-col gap-y-4 "}>
                <HomeBanner />
                <HomeFeatures />
                <HomeQuickTip onClick={() => showToast(t("QuickTip.toastText"))} />
            </div>

            {isLoginFailed && <LoginFailedModal />}
        </div>

    );
};