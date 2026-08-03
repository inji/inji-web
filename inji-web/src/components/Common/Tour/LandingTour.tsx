import React, {useMemo} from "react";
import {useTranslation} from "react-i18next";
import {Tour, TourStep} from "./Tour";
import {useLandingTour} from "../../../hooks/useLandingTour";

interface LandingTourProps {
    /** In the OpenID4VP login flow the guest option is hidden, so its step is skipped. */
    isOpenIdVpLogin?: boolean;
}

/**
 * Guided walkthrough shown only on the Landing Page. It highlights the language
 * selector, Google login and guest login, then persists its completion so it is
 * shown only once. Rendered from the Landing Page so it never appears elsewhere.
 */
export const LandingTour: React.FC<LandingTourProps> = ({isOpenIdVpLogin = false}) => {
    const {t} = useTranslation("HomePage");
    const {isTourOpen, completeTour} = useLandingTour();

    const steps = useMemo<TourStep[]>(() => {
        const tourSteps: TourStep[] = [
            {
                targetSelector: '[data-testid="Language-Selector-Button"]',
                placement: "bottom",
                // The only step whose control is safe to operate mid-tour: switching
                // language re-renders the tour in place instead of navigating away.
                interactive: true,
                content: {
                    title: t("Tour.steps.language.title"),
                    subTitle: t("Tour.steps.language.subTitle"),
                    heading: t("Tour.steps.language.heading"),
                    description: t("Tour.steps.language.description")
                }
            },
            {
                targetSelector: '[data-testid="google-login-button"]',
                placement: "top",
                content: {
                    title: t("Tour.steps.google.title"),
                    description: t("Tour.steps.google.description")
                }
            }
        ];

        // The guest login button is not rendered during the OpenID4VP login flow.
        if (!isOpenIdVpLogin) {
            tourSteps.push({
                targetSelector: '[data-testid="home-banner-guest-login-container"]',
                placement: "bottom",
                content: {
                    title: t("Tour.steps.guest.title"),
                    description: t("Tour.steps.guest.description")
                }
            });
        }

        return tourSteps;
    }, [t, isOpenIdVpLogin]);

    return <Tour steps={steps} isOpen={isTourOpen} onClose={completeTour} />;
};

export default LandingTour;
