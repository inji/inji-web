import React from "react";
import { useTranslation } from "react-i18next";
import { SolidButton } from "../Common/Buttons/SolidButton";
import { BorderedButton } from "../Common/Buttons/BorderedButton";

const TrustRejectionModalStyles = {
    wrapper: "flex flex-col items-center text-center px-6 py-12 sm:p-8",
    title: "text-md sm:text-2xl font-semibold text-gray-900 mb-7 mt-8",
    description: "text-gray-600 mb-6 mx-2 md:mx-8 text-sm sm:text-base",
    buttonsContainer: "space-y-3 w-full mb-8",
    confirmButton: `
        !py-2.5 mt-4 mb-2 !text-base
    `,
    goBackButton: "!py-2.5",
};

export interface TrustRejectionModalContentProps {
    onConfirm: () => void;
    onClose: () => void;
    testId: string;
}

export const TrustRejectionModalContent: React.FC<
    TrustRejectionModalContentProps
> = ({ onConfirm, onClose, testId }) => {
    const { t } = useTranslation("VerifierTrustPage");
    const styles = TrustRejectionModalStyles;

    return (
        <div data-testid={testId} className={styles.wrapper}>
            <h2 data-testid="title-cancel-confirmation" className={styles.title}>
                {t(`TrustRejectionModal.title`)}
            </h2>

            <p
                data-testid="text-cancel-confirmation-description"
                className={styles.description}
            >
                {t(`TrustRejectionModal.description`)}
            </p>

            <div className={styles.buttonsContainer}>
                <SolidButton
                    testId="btn-confirm-cancel"
                    onClick={onConfirm}
                    title={t(`TrustRejectionModal.confirmButton`)}
                    fullWidth
                    className={styles.confirmButton}
                />
                <BorderedButton
                    testId="btn-go-back"
                    onClick={onClose}
                    title={t(`TrustRejectionModal.goBackButton`)}
                    className={styles.goBackButton}
                />
            </div>
        </div>
    );
};
