import React, {useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {IntroBox} from "../components/Common/IntroBox";
import {SearchIssuer} from "../components/Issuers/SearchIssuer";
import {IssuersList} from "../components/Issuers/IssuersList";
import {useDispatch} from "react-redux";
import {storeFilteredIssuers, storeIssuers} from "../redux/reducers/issuersReducer";
import {api} from "../utils/api";
import {ApiRequest, IssuerObject} from "../types/data";
import {useTranslation} from "react-i18next";
import {toast} from "react-toastify";
import {useApi} from "../hooks/useApi";
import {RequestStatus} from "../utils/constants";
import {useUser} from "../hooks/User/useUser";
import {NavBackArrowButton} from "../components/Common/Buttons/NavBackArrowButton";
import {navigateToUserHome} from "../utils/navigationUtils";

export const IssuersPage: React.FC<IssuerPageProps> = ({className, variant = "landing"}) => {
    const {state, fetchData} = useApi();
    const dispatch = useDispatch();
    const {t} = useTranslation("IssuersPage");
    const {isUserLoggedIn, fetchUserProfile} = useUser()
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        async function fetchIssuers() {
            const apiRequest: ApiRequest = api.fetchIssuers;
            const {data: response, state: issuerResponseState} = await fetchData(
                {
                    apiConfig: apiRequest,
                }
            );
            if (issuerResponseState === RequestStatus.ERROR) {
                toast.error(t("errorContent"));
                return
            }

            const ignoredIssuerIds = window._env_.IGNORED_ISSUER_IDS
                ? window._env_.IGNORED_ISSUER_IDS.split(",").filter((id) => id.trim() !== "")
                : [];
            const issuers = response?.response?.issuers.filter(
                (issuer: IssuerObject) =>
                    // Excludes issuers with protocol 'OTP' and those whose issuer_id is in the ignoredIssuersFromRendering list (or contains any ignored issuer id as a substring).
                    issuer.protocol !== 'OTP' &&
                    (ignoredIssuerIds.length === 0 || !ignoredIssuerIds.some((ignoredIssuerId) =>
                        issuer.issuer_id.includes(ignoredIssuerId)
                    ))
            );

            dispatch(storeFilteredIssuers(issuers));
            dispatch(storeIssuers(issuers));
        }

        const initializeIssuersData = async () => {
            if (isUserLoggedIn()) {
                try {
                    await fetchUserProfile();
                    await fetchIssuers();
                } catch (error: any) {
                    console.error("Error fetching user profile:", error);
                    toast.error(t("errorContent"));
                }
            } else {
                await fetchIssuers();
            }
        };

        void initializeIssuersData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleBackClick = () => {
        const previousPagePath = location.state?.from;
        if (previousPagePath) {
            navigate(previousPagePath);
        } else {
            navigateToUserHome(navigate);
        }
    };

    if (variant === "dashboard") {
        return (
            <div data-testid="Home-Page-Container" className="w-full px-4 sm:px-8 md:px-12 lg:px-16 my-8 flex flex-col">
                <div
                    data-testid="Issuers-Back-Button"
                    className="flex items-center self-start cursor-pointer"
                    onClick={handleBackClick}
                >
                    <NavBackArrowButton onBackClick={handleBackClick}/>
                    <span className="text-[18px] leading-[26px] font-semibold text-iw-title">
                        {t("back")}
                    </span>
                </div>

                <div className="text-center mt-2">
                    <h1
                        data-testid="Issuers-Page-Title"
                        className="text-[36px] leading-[44px] tracking-[-0.02em] font-bold text-iw-title"
                    >
                        {t("containerHeading")}
                    </h1>
                    <p
                        data-testid="Issuers-Page-SubTitle"
                        className="mt-6 mx-auto max-w-[720px] text-[18px] sm:text-[20px] leading-[28px] font-normal text-iw-title"
                    >
                        {/* Gradient span is inlined rather than using renderGradientText:
                            that helper hardcodes font-bold and is shared with the button
                            components, so it can't be lightened for this heading alone. */}
                        {t("heroSubtitle1")}{" "}
                        <span className="inline-block bg-gradient-to-r from-iw-primary to-iw-secondary bg-clip-text font-normal text-transparent">
                            {t("heroSubtitle2")}
                        </span>{" "}
                        {t("heroSubtitle3")}
                    </p>
                    <p
                        data-testid="Issuers-Page-Description"
                        className="mt-12 text-[16px] leading-[24px] font-medium text-iw-subTitle"
                    >
                        {t("Intro.subTitle")}
                    </p>
                </div>

                <div className="mt-6">
                    <SearchIssuer placeholder={t("searchPlaceholder")} showHelpText={false}/>
                </div>

                <div className="mt-8">
                    <IssuersList state={state} showHeader={false}/>
                </div>
            </div>
        );
    }

    return (
        <div data-testid="Home-Page-Container">
            <div className="container mx-auto mt-8 flex flex-col px-4 sm:px-6 md:px-10 lg:px-20">
                <div className={className}>
                    <IntroBox/>
                    <SearchIssuer/>
                </div>
                <IssuersList state={state}/>
            </div>
        </div>
    );
};

type IssuerPageProps = {
    className?: string;
    variant?: "landing" | "dashboard";
};
