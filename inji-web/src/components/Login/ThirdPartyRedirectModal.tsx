import React, {useEffect, useRef} from "react";
import {useTranslation} from "react-i18next";
import {FiBell} from "react-icons/fi";
import {SolidButton} from "../Common/Buttons/SolidButton";

type ThirdPartyRedirectModalProps = {
    onContinue: () => void;
    onClose: () => void;
};

/**
 * Shown after the user asks to sign in with Google but before the browser leaves
 * for the IdP, warning that the language chosen here does not carry over to
 * Google's own pages. Dismissing it cancels the hand-off.
 */
export const ThirdPartyRedirectModal: React.FC<ThirdPartyRedirectModalProps> = ({onContinue, onClose}) => {
    const {t} = useTranslation("HomePage");
    const continueContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        continueContainerRef.current?.querySelector("button")?.focus();
    }, []);

    return (
        <div
            data-testid="third-party-redirect-modal"
            className="overflow-hidden fixed inset-0 backdrop-blur-md bg-black bg-opacity-40 flex items-center justify-center z-50 px-5"
            onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="third-party-redirect-modal-title"
                className="bg-white shadow-lg rounded-2xl pt-10 pb-9 px-8 sm:px-14 w-full max-w-[420px] text-center"
                onClick={(event) => event.stopPropagation()}>

                <div className="flex justify-center mb-4">
                    <FiBell
                        size={30}
                        data-testid="third-party-redirect-modal-icon"
                        className="text-iw-primary"
                    />
                </div>

                <h2
                    id="third-party-redirect-modal-title"
                    data-testid="third-party-redirect-modal-title"
                    className="text-[20px] leading-[28px] font-bold text-iw-title mb-3">
                    {t("ThirdPartyRedirectModal.title")}
                </h2>

                <p
                    data-testid="third-party-redirect-modal-description"
                    className="text-[14px] leading-[22px] font-normal text-iw-subTitle mb-8">
                    {t("ThirdPartyRedirectModal.description")}
                </p>

                {/* SolidButton is w-full, so a fixed-width wrapper keeps the
                    button at the pill size shown in the design. */}
                <div ref={continueContainerRef} className="mx-auto w-[180px]">
                    <SolidButton
                        testId="third-party-redirect-modal-continue"
                        onClick={onContinue}
                        title={t("ThirdPartyRedirectModal.continue")}
                    />
                </div>
            </div>
        </div>
    );
};
