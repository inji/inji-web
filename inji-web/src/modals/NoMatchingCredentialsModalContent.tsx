import React from "react";
import { useTranslation } from "react-i18next";
import { SolidButton } from "../components/Common/Buttons/SolidButton";
import { CloseIconButton } from "../components/Common/Buttons/CloseIconButton";
import { NoMatchingCredentialsModalStyles } from "./NoMatchingCredentialsModalStyles";
import TrustedIcon from "../assets/TrustedIcon.svg";
import unknownVerifierLogo from "../assets/unknown_verifier_logo.png";
import { PresentationCredential } from "../types/components";
import { formatMissingClaimLabel } from "../utils/dcqlSelectionUtils";
import Shield from "../assets/FullRedShield.svg";
import emptyLeftArrow from "../assets/emptyLeftArrow.svg";
import { RequirementInfoVerifier } from "./CredentialRequirementInfoModalContent";

export interface NoMatchingCredentialsModalContentProps {
    missingClaims: string[];
    visibleClaims: string[];
    hiddenClaimsCount: number;
    matchingCredentials: PresentationCredential[];
    verifier?: RequirementInfoVerifier | null;
    verifierName: string;
    isSubmitting: boolean;
    isRetrying: boolean;
    onClose: () => void;
    onShowFullClaimsList: () => void;
    onGoToHome: () => void;
}

export const NoMatchingCredentialsModalContent: React.FC<
    NoMatchingCredentialsModalContentProps
> = ({
    missingClaims,
    visibleClaims,
    hiddenClaimsCount,
    matchingCredentials,
    verifier,
    verifierName,
    isSubmitting,
    isRetrying,
    onClose,
    onShowFullClaimsList,
    onGoToHome,
}) => {
    const { t } = useTranslation("NoMatchingCredentialsModal");
    const styles = NoMatchingCredentialsModalStyles;

    return (
        <div className={styles.wrapper}>
            <div className={styles.closeButtonContainer}>
                <CloseIconButton
                    onClick={onClose}
                    btnClassName={styles.closeButton}
                    iconClassName="h-4 w-4"
                    btnTestId="btn-close-no-matching-credentials"
                />
            </div>
            <div className={styles.headerSection}>
                <div className={styles.iconContainer}>
                    <img
                        src={Shield}
                        alt=""
                        className={styles.iconImage}
                        data-testid="img-no-matching-credentials-icon"
                        aria-hidden
                    />
                </div>

                <h2
                    id="title-no-matching-credentials"
                    className={styles.title}
                >
                    {t("title")}
                </h2>
                <p
                    data-testid="text-no-matching-credentials-description"
                    className={styles.claimsIntro}
                >
                    {t("claimsIntro")}
                </p>
            </div>

            <div className={styles.scrollArea}>
                {missingClaims.length > 0 && (
                    <div
                        className={styles.claimsCard}
                        data-testid="no-matching-claims-list"
                    >
                        <p className={styles.sectionLabel}>
                            {t("missingInfoLabel")}
                        </p>
                        <ul className={styles.claimsList}>
                            {visibleClaims.map((claim) => (
                                <li key={claim} className={styles.claimItem}>
                                    <span
                                        className={styles.claimBullet}
                                        aria-hidden
                                    />
                                    <span>
                                        {formatMissingClaimLabel(claim)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        {hiddenClaimsCount > 0 && (
                            <button
                                type="button"
                                className={styles.showMoreButton}
                                data-testid="btn-show-more-claims"
                                onClick={onShowFullClaimsList}
                            >
                                <span>
                                    {t("showMore", {
                                        count: hiddenClaimsCount,
                                    })}
                                </span>
                                <img
                                    src={emptyLeftArrow}
                                    alt=""
                                    className="h-2.5 w-2.5 mt-1"
                                />
                            </button>
                        )}
                    </div>
                )}

                <p className={styles.sectionLabel}>{t("whatYouCanDo")}</p>
                <div
                    className={styles.actionCard}
                    data-testid="no-matching-verifier-card"
                >
                    <div className={styles.verifierRow}>
                        <div className={styles.verifierLogoWrapper}>
                            <img
                                src={verifier?.logo || unknownVerifierLogo}
                                alt=""
                                className={styles.verifierLogo}
                                data-testid="no-matching-verifier-logo"
                            />
                        </div>
                        <div className="min-w-0 flex flex-col">
                            <div className="flex items-center gap-1">
                                <p
                                    className={styles.verifierName}
                                    data-testid="no-matching-verifier-name"
                                >
                                    {verifierName}
                                </p>
                                {verifier?.trusted && (
                                    <img
                                        src={TrustedIcon}
                                        alt=""
                                        className="h-3 w-3 shrink-0"
                                        data-testid="no-matching-verifier-trusted-badge"
                                        aria-hidden
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    <p className={styles.verifierHelp}>{t("verifierHelp")}</p>
                </div>

                {matchingCredentials.length > 0 && (
                    <>
                        <p className={styles.sectionLabel}>
                            {t("matchingCards")}
                        </p>
                        <div
                            className={styles.matchingCardsCard}
                            data-testid="no-matching-cards-list"
                        >
                            <ul className="flex flex-col">
                                {matchingCredentials.map((credential) => (
                                    <li
                                        key={credential.credentialId}
                                        className={styles.matchingCardRow}
                                        data-testid={`no-matching-card-${credential.credentialId}`}
                                    >
                                        <div
                                            className={
                                                styles.matchingCardLogoWrapper
                                            }
                                        >
                                            <img
                                                src={
                                                    credential.credentialTypeLogo
                                                }
                                                alt={
                                                    credential.credentialTypeDisplayName
                                                }
                                                className={
                                                    styles.matchingCardLogo
                                                }
                                            />
                                        </div>
                                        <span className={styles.matchingCardName}>
                                            {
                                                credential.credentialTypeDisplayName
                                            }
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}
            </div>

            <SolidButton
                testId="btn-go-to-home"
                onClick={onGoToHome}
                title={t("goToHomeButton")}
                fullWidth
                disabled={isSubmitting || isRetrying}
                className={styles.footerButton}
            />
        </div>
    );
};
