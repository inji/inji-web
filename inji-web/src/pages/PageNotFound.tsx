import React from "react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {ROUTES} from "../utils/constants";

export const PageNotFound: React.FC = () => {
    const navigate = useNavigate();
    const {t} = useTranslation("PageNotFound")
    return <div className={"flex justify-center items-center h-full flex-col"}>
        <div>
            <strong>404.</strong>{t("heading")}
        </div>
        <h3 className={"pt-4"}>{t("subHeading", {pathname: window.location.pathname})}</h3>
        <div className={"p-8"}>
            <button
                type="button"
                data-testid="PageNotFound-Home-Button"
                onClick={() => navigate(ROUTES.ROOT)}
                className="text-iw-primary font-bold py-2 px-4 rounded-lg border-2 border-iw-primary">
                {t("navigateButton")}
            </button>
        </div>
    </div>
}
