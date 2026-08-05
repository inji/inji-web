import { useTranslation } from "react-i18next";
import TrustedIcon from "../assets/TrustedIcon.svg";
import unknownVerifierLogo from "../assets/unknown_verifier_logo.png";
import { CloseIconButton } from "../components/Common/Buttons/CloseIconButton";
import { ModalStyles } from "./ModalStyles";
import RedShield from "../assets/RedShield.svg";
import GrayShield from "../assets/GrayShield.svg";
import InfoLightIcon from "../assets/InfoLightIcon.svg";

export interface RequirementInfoVerifier {
    name?: string | null;
    logo?: string | null;
    trusted?: boolean;
}

export interface CredentialRequirementInfoModalContentProps {
    verifier?: RequirementInfoVerifier | null;
    onClose: () => void;
}

export function CredentialRequirementInfoModalContent({
    verifier,
    onClose,
}: CredentialRequirementInfoModalContentProps) {
    const { t } = useTranslation("VerifierTrustPage");
    const styles = ModalStyles.credentialRequirementInfoModal;
    const verifierName =
        verifier?.name?.trim() || t("mainPage.unknownVerifier");

    return (
        <div
            className={styles.content}
            data-testid="credential-requirement-info-modal"
        >
            <div className={styles.closeButtonContainer}>
                <CloseIconButton
                    onClick={onClose}
                    btnClassName={styles.closeButton}
                    iconClassName="h-4 w-4"
                    btnTestId="requirement-info-close-button"
                />
            </div>
            <div className={styles.orgHeaderRow}>
                <div className={styles.orgDetails}>
                    <div className={styles.orgLogoWrapper}>
                        <img
                            src={verifier?.logo || unknownVerifierLogo}
                            alt=""
                            className={styles.orgLogo}
                            data-testid="requirement-info-verifier-logo"
                        />
                    </div>
                    <div className="min-w-0">
                        <h2
                            className={styles.orgName}
                            data-testid="requirement-info-verifier-name"
                        >
                            {verifierName}
                        </h2>
                        {verifier?.trusted && (
                            <div
                                className={styles.trustedBadge}
                                data-testid="requirement-info-trusted-badge"
                            >
                                <img
                                    src={TrustedIcon}
                                    alt=""
                                    className="h-3 w-3"
                                    aria-hidden
                                />
                                <span>{t("mainPage.trustedLabel")}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <hr className={styles.divider} />

            <div className={styles.sectionsCard}>
                <div className={styles.sectionRow}>
                    <div
                        className={`${styles.sectionIconOne} ${styles.sectionIcon}`}
                        aria-hidden
                    >
                        <img src={RedShield} alt="" className="h-5 w-5" />
                    </div>
                    <div className={styles.sectionBody}>
                        <div className={styles.sectionTitleRow}>
                            <p className={styles.sectionTitle}>
                                {t("dcql.requirementInfo.requiredTitle")}
                            </p>
                            <span
                                className={`${styles.statusBadge} ${styles.requiredBadge}`}
                            >
                                {t("dcql.required")}
                            </span>
                        </div>
                        <p className={styles.sectionDescription}>
                            {t("dcql.requirementInfo.requiredDescription")}
                        </p>
                    </div>
                </div>

                <hr className={styles.divider} />

                <div className={styles.sectionRow}>
                    <div
                        className={`${styles.sectionIconTwo} ${styles.sectionIcon}`}
                        aria-hidden
                    >
                        <img src={GrayShield} alt="" className="h-5 w-5" />
                    </div>
                    <div className={styles.sectionBody}>
                        <div className={styles.sectionTitleRow}>
                            <p className={styles.sectionTitle}>
                                {t("dcql.requirementInfo.optionalTitle")}
                            </p>
                            <span
                                className={`${styles.statusBadge} ${styles.optionalBadge}`}
                            >
                                {t("dcql.optionalSection")}
                            </span>
                        </div>
                        <p className={styles.sectionDescription}>
                            {t("dcql.requirementInfo.optionalDescription")}
                        </p>
                    </div>
                </div>
            </div>

            <div className={styles.footerNote}>
                <img
                    src={InfoLightIcon}
                    alt=""
                    className={styles.footerNoteIcon}
                    aria-hidden
                />
                <p>{t("dcql.requirementInfo.footerNote")}</p>
            </div>

            <hr className={styles.divider} />
        </div>
    );
}
