import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoCheckmarkCircle } from "react-icons/io5";
import { SuccessIcon } from "../Common/Icons/SuccessIcon";
import TrustedIcon from "../../assets/TrustedIcon.svg";
import unknownVerifierLogo from "../../assets/unknown_verifier_logo.png";
import { CredentialShareSuccessViewProps } from "../../types/components";
import { CredentialShareSuccessStyles } from "./CredentialShareSuccessStyles";
import { SolidButton } from "../Common/Buttons/SolidButton";
import { formatSharedTimestamp } from "../../utils/dateUtils";
import { safeExternalRedirect } from "../../utils/navigationUtils";

export function CredentialShareSuccessView({
    verifierName,
    verifierLogo,
    verifierTrusted = false,
    credentials,
    returnUrl,
    countdownStart = 5,
    onClose,
}: CredentialShareSuccessViewProps) {
    const { t, i18n } = useTranslation("CredentialShareSuccessModal");
    const styles = CredentialShareSuccessStyles;
    const [count, setCount] = useState(countdownStart);
    const startedRef = useRef(false);

    const sharedAtLabel = useMemo(() => {
        const { isToday, time, dateTimeLabel } = formatSharedTimestamp(
            new Date(),
            i18n.language
        );
        return isToday ? t("sharedTodayAt", { time }) : dateTimeLabel;
    }, [i18n.language, t]);

    useEffect(() => {
        if (startedRef.current) return;

        startedRef.current = true;
        setCount(countdownStart);

        const timer = setInterval(() => {
            setCount((prev) => (prev > 1 ? prev - 1 : 0));
        }, 1000);

        const navigationTimer = setTimeout(() => {
            onClose?.();
            if (returnUrl) {
                safeExternalRedirect(returnUrl);
            }
        }, countdownStart * 1000);

        return () => {
            clearInterval(timer);
            clearTimeout(navigationTimer);
            startedRef.current = false;
        };
    }, [countdownStart, onClose, returnUrl]);

    const handleReturnClick = () => {
        onClose?.();
        if (returnUrl) {
            safeExternalRedirect(returnUrl);
        }
    };

    return (
        <div
            className={styles.page}
            data-testid="credential-share-success-view"
        >
            <div className={styles.successIconWrapper}>
                <SuccessIcon className="h-14 w-14 sm:h-16 sm:w-16" />
            </div>

            <h1 className={styles.title}>{t("title")}</h1>
            <p className={styles.subtitle}>
                {t("subtitle", { verifierName })}
            </p>

            <section
                className={styles.summaryCard}
                data-testid="credential-share-success-summary"
            >
                <div className={styles.verifierRow}>
                    <div className={styles.verifierInfo}>
                        <div className={styles.verifierLogoWrapper}>
                            <img
                                src={verifierLogo || unknownVerifierLogo}
                                alt=""
                                className={styles.verifierLogo}
                                data-testid="credential-share-success-verifier-logo"
                            />
                        </div>
                        <div className="min-w-0">
                            <h2
                                className={styles.verifierName}
                                data-testid="credential-share-success-verifier-name"
                            >
                                {verifierName}
                            </h2>
                            {verifierTrusted && (
                                <div
                                    className={styles.trustedBadge}
                                    data-testid="credential-share-success-trusted-badge"
                                >
                                    <div className="flex gap-1 items-center"> <img
                                        src={TrustedIcon}
                                        alt=""
                                        className="h-3 w-3"
                                        aria-hidden
                                    />
                                        <span>{t("trustedLabel")}</span>
                                    </div>
                                    <time
                                        className={styles.timestamp}
                                        dateTime={new Date().toISOString()}
                                        data-testid="credential-share-success-timestamp"
                                    >
                                        {sharedAtLabel}
                                    </time>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <hr className={styles.divider} />

                <p className={styles.cardsSectionLabel}>
                    {t("cardsShared", { count: credentials.length })}
                </p>

                <ul
                    className={styles.credentialList}
                    data-testid="shared-credentials-container"
                >
                    {credentials.map((cred, idx) => (
                        <li
                            key={cred.credentialId}
                            id={`item-${cred.credentialTypeDisplayName}-${idx}`}
                            data-testid={`item-${cred.credentialTypeDisplayName}-${idx}`}
                            className={styles.credentialRow}
                        >
                            <div className={styles.credentialLogoWrapper}>
                                <img
                                    src={cred.credentialTypeLogo}
                                    alt={cred.credentialTypeDisplayName}
                                    className={styles.credentialLogo}
                                />
                            </div>
                            <span className={styles.credentialName}>
                                {cred.credentialTypeDisplayName}
                            </span>
                            <IoCheckmarkCircle
                                className={styles.credentialCheck}
                                aria-hidden
                            />
                        </li>
                    ))}
                </ul>
            </section>
            <div className="text-center">
                <SolidButton
                    testId="btn-return-to-verifier"
                    onClick={handleReturnClick}
                    title={t("redirectMessage", { count })}
                    className={styles.returnButton}
                    fullWidth
                />
            </div>
        </div>
    );
}
