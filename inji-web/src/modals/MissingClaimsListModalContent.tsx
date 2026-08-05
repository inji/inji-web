import React from "react";
import { useTranslation } from "react-i18next";
import { MissingClaimsListModalStyles } from "./MissingClaimsListModalStyles";
import ArrowOpenLeft from "../assets/ArrowOpenLeft.svg";
import { CloseIconButton } from "../components/Common/Buttons/CloseIconButton";
import { formatMissingClaimLabel } from "../utils/dcqlSelectionUtils";

export interface MissingClaimsListModalContentProps {
    missingClaims?: string[];
    onBack: () => void;
}

export const MissingClaimsListModalContent: React.FC<
    MissingClaimsListModalContentProps
> = ({ missingClaims = [], onBack }) => {
    const { t } = useTranslation("MissingClaimsListModal");
    const styles = MissingClaimsListModalStyles;

    return (
        <div className={styles.wrapper}>
            <div className={styles.closeButtonContainer}>
                <CloseIconButton
                    onClick={onBack}
                    btnClassName={styles.closeButton}
                    iconClassName="h-4 w-4"
                    btnTestId="btn-close-missing-claims-list"
                />
            </div>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={onBack}>
                    <img
                        src={ArrowOpenLeft}
                        alt="Back arrow"
                        className="h-2.5 w-2.5"
                        data-testid="button-missing-claims-list-back"
                    />
                </button>
                <h2
                    className={styles.title}
                    data-testid="title-missing-claims-list"
                >
                    {t("title")}
                </h2>
                <span
                    className={styles.requiredCount}
                    data-testid="text-missing-claims-required-count"
                >
                    {t("requiredCount", {
                        count: missingClaims.length,
                    })}
                </span>
            </div>
            <ul className={styles.list} data-testid="missing-claims-list">
                {missingClaims.map((claim, index) => (
                    <li key={`${claim}-${index}`} className={styles.claimRow}>
                        <span className={styles.claimIndex}>{index + 1}</span>
                        <span className={styles.claimBullet} aria-hidden />
                        <span className="min-w-0 break-words text-[#0F172A] font-semibold">
                            {formatMissingClaimLabel(claim)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
