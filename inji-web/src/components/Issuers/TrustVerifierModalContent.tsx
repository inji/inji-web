import React from "react";
import { useTranslation } from "react-i18next";
import { SolidButton } from "../Common/Buttons/SolidButton";
import { InfoTooltip } from "../Common/ToolTip/InfoTooltip";
import { TrustVerifierModalStyles } from "./TrustVerifierModalStyles";
import LogoIcon from "../../assets/unknown_verifier_logo.png";
import { BorderedButton } from "../Common/Buttons/BorderedButton";
import { ClientIdScheme } from "../../types/components";

export interface TrustVerifierModalContentProps {
    logo?: string | null;
    verifierName?: string;
    onTrust: () => void;
    onCancel: () => void;
    testId: string;
    clientIdScheme?: ClientIdScheme;
    certVerifiedDnsName?: string;
    certOrganization?: string;
    certValidUntil?: string;
}

export const TrustVerifierModalContent: React.FC<TrustVerifierModalContentProps> = ({
    logo,
    verifierName,
    onTrust,
    onCancel,
    testId,
    clientIdScheme,
    certVerifiedDnsName,
    certOrganization,
    certValidUntil,
}) => {
    const { t } = useTranslation(["VerifierTrustPage", "Common"]);
    const styles = TrustVerifierModalStyles.trustModal;

    const trustVerifierInstructions = [
        {
            instructionKey: `modal.benefitSaveSecurely`,
            testId: "text-trust-point-1",
        },
        {
            instructionKey: `modal.benefitAddToTrustedList`,
            testId: "text-trust-point-2",
        },
        {
            instructionKey: `modal.benefitSkipReviewFuture`,
            testId: "text-trust-point-3",
        },
    ];

    return (
        <div data-testid={testId} className={styles.wrapper}>
            <div className={styles.logoContainer}>
                {logo ? (
                    <img
                        src={logo}
                        alt={`${verifierName} logo`}
                        className={styles.logoImage}
                        data-testid="img-verifier-logo"
                    />
                ) : (
                    <img
                        src={LogoIcon}
                        alt={`${verifierName} logo`}
                        className={styles.logoImage}
                        data-testid="img-default-logo"
                    />
                )}
            </div>

            <h1 data-testid="title-verifier-name" className={styles.title}>
                {verifierName || t(`modal.title`)}
            </h1>

            <p data-testid="text-modal-description" className={styles.description}>
                {t(`modal.description`)}
            </p>

            <ul className={styles.list}>
                {trustVerifierInstructions.map((item) => (
                    <li
                        data-testid={item.testId}
                        key={item.testId}
                        className={styles.listItem}
                    >
                        <span className={styles.listItemBullet} aria-hidden="true">
                            •
                        </span>
                        <span>{t(item.instructionKey)}</span>
                    </li>
                ))}
            </ul>

            {clientIdScheme === "x509_san_dns" && (certVerifiedDnsName || certOrganization || certValidUntil) && (
                <div data-testid="cert-identity-section" className={styles.certIdentitySection}>
                    <p className={styles.certIdentityTitle}>{t("modal.certIdentityTitle")}</p>
                    {certVerifiedDnsName && (
                        <div className={styles.certIdentityRow}>
                            <span className={styles.certIdentityLabel}>{t("modal.certDnsNameLabel")}</span>
                            <span data-testid="cert-dns-name" className={styles.certIdentityValue}>{certVerifiedDnsName}</span>
                        </div>
                    )}
                    {certOrganization && (
                        <div className={styles.certIdentityRow}>
                            <span className={styles.certIdentityLabel}>{t("modal.certOrganizationLabel")}</span>
                            <span data-testid="cert-organization" className={styles.certIdentityValue}>{certOrganization}</span>
                        </div>
                    )}
                    {certValidUntil && (
                        <div className={styles.certIdentityRow}>
                            <span className={styles.certIdentityLabel}>{t("modal.certValidUntilLabel")}</span>
                            <span data-testid="cert-valid-until" className={styles.certIdentityValue}>{certValidUntil}</span>
                        </div>
                    )}
                </div>
            )}

            <div className={styles.buttonsContainer}>
                <SolidButton
                    testId="btn-trust-verifier"
                    onClick={onTrust}
                    title={t(`modal.trustButton`)}
                    fullWidth
                    className={styles.trustButton}
                />

                <BorderedButton
                    testId="btn-not-trust-verifier"
                    onClick={onCancel}
                    title={t(`modal.notTrustButton`)}
                    className={styles.noTrustButton}
                />
            </div>

            <InfoTooltip
                infoButtonText={t("modal.infoTooltipButton")}
                tooltipText={t("modal.infoTooltipText")}
                testId="btn-info-tooltip"
            />
        </div>
    );
};
