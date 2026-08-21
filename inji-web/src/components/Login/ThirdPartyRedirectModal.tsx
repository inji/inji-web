import React from "react";
import {useTranslation} from "react-i18next";
import {FiBell} from "react-icons/fi";
import {SolidButton} from "../Common/Buttons/SolidButton";
import {useModalDialog} from "../../hooks/useModalDialog";

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
    // The modal only exists while it is open, so focus management starts as
    // soon as it mounts and hands focus back to the trigger on unmount.
    const dialogRef = useModalDialog<HTMLDivElement>(true, onClose);

    return (
        <div
            data-testid="third-party-redirect-modal"
            className="overflow-hidden fixed inset-0 backdrop-blur-md bg-black bg-opacity-40 flex items-center justify-center z-50 px-5"
            onClick={onClose}>
            <div
                ref={dialogRef}
                tabIndex={-1}
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
                <div className="mx-auto w-[180px]">
                    <SolidButton
                        testId="third-party-redirect-modal-continue"
                        onClick={onContinue}
                        title={t("ThirdPartyRedirectModal.continue")}
                    />
                </div>

                <button
                    type="button"
                    data-testid="third-party-redirect-modal-cancel"
                    onClick={onClose}
                    className="mt-3 mx-auto block text-[14px] leading-[22px] font-semibold text-iw-subTitle
                               hover:text-iw-title focus:outline-none focus-visible:ring-2 focus-visible:ring-iw-primary
                               focus-visible:ring-offset-2 rounded-lg px-3 py-1">
                    {t("ThirdPartyRedirectModal.cancel")}
                </button>
            </div>
        </div>
    );
};
