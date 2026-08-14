import React, { useState } from "react";
import { SolidButton } from "../Common/Buttons/SolidButton";
import { useTranslation } from "react-i18next";
import unknownVerifierLogo from "../../assets/unknown_verifier_logo.png";
import TrustedIcon from "../../assets/TrustedIcon.svg";
import LockIcon from "../../assets/LockIcon.svg";
import { useApi } from "../../hooks/useApi";
import { rejectVerifierRequest } from "../../utils/verifierUtils";
import { safeExternalRedirect } from "../../utils/navigationUtils";
import { VerifierCredentialsRequestCardStyles } from "./OvpPageStyles";
import ConsentRequiredModal from "../../modals/ConsentRequiredModal";
import { PlainButton } from "../Common/Buttons/PlainButton";
import { VpStickyActionPanel } from "./VpStickyActionPanel";

export interface Verifier {
    id: string;
    logo?: string | null;
    name: string;
    preregisteredWithWallet?: boolean;
    redirectUri?: string | null;
    trusted?: boolean;
}

interface CredentialShareCardProps {
    verifier: Verifier | null;
    presentationId: string | null;
    selectedCredentialIds?: string[];
    onShareCredentials?: () => void;
    isShareEnabled?: boolean;
    className?: string;
    stickyBelowHeader?: boolean;
}

export function VerifierRequestInfoPanel({
    verifier,
    className = "",
}: Pick<CredentialShareCardProps, "verifier" | "className">) {
    const { t } = useTranslation("VerifierTrustPage");

    return (
        <div
            className={`${VerifierCredentialsRequestCardStyles.infoCard} ${className}`.trim()}
            data-testid="verifier-request-info-panel"
        >
            <div className={VerifierCredentialsRequestCardStyles.verifierDetails}>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2 h-[56px] w-[56px]">
                    <img
                        src={verifier?.logo || unknownVerifierLogo}
                        alt={verifier?.name || "Verifier Logo"}
                        className={VerifierCredentialsRequestCardStyles.verifierLogo}
                        data-testid="verifier-logo"
                    />
                </div>
                <div className="min-w-0 mt-0.5">
                    <h1
                        data-testid="verifier-name"
                        className={VerifierCredentialsRequestCardStyles.verifierName}
                    >
                        {verifier?.name || t("mainPage.unknownVerifier")}
                    </h1>
                    {verifier?.trusted && (
                        <div
                            className={VerifierCredentialsRequestCardStyles.trustedBadge}
                            data-testid="verifier-trusted-badge"
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

            <div
                className={VerifierCredentialsRequestCardStyles.requestPanel}
                data-testid="verifier-request-panel"
            >
                <div
                    className={VerifierCredentialsRequestCardStyles.requestPanelIcon}
                    aria-hidden
                >
                    <img src={LockIcon} alt="" className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className={VerifierCredentialsRequestCardStyles.requestPanelTitle}>
                        {t("mainPage.description")}
                    </p>
                    <p className={VerifierCredentialsRequestCardStyles.requestPanelSubtext}>
                        {t("mainPage.descriptionSubtext")}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function VerifierRequestActionPanel({
    verifier,
    presentationId,
    selectedCredentialIds = [],
    onShareCredentials,
    isShareEnabled,
    className = "",
    stickyBelowHeader = false,
}: CredentialShareCardProps) {
    const { t } = useTranslation("VerifierTrustPage");
    const { fetchData } = useApi();
    const [declineDisabled, setDeclineDisabled] = useState(false);
    const [showConsentRequiredModal, setConsentRequiredModal] = useState(false);
    const credentialCount = selectedCredentialIds.length;
    const shareEnabled = isShareEnabled ?? credentialCount > 0;

    const handleDecline = async () => {
        if (!presentationId || declineDisabled) return;
        setDeclineDisabled(true);

        if (verifier?.redirectUri) {
            safeExternalRedirect(verifier.redirectUri);
            return;
        }

        try {
            const ok = await rejectVerifierRequest({
                presentationId,
                fetchData,
                redirectUri: verifier?.redirectUri || null,
            });
            if (!ok) {
                setDeclineDisabled(false);
            }
        } catch {
            setDeclineDisabled(false);
        }
    };

    const consentModalLabels = {
        title: t("consentRequiredModal.title"),
        description: t("consentRequiredModal.description"),
        credentialsTitle: t("consentRequiredModal.credentialsTitle", {
            count: credentialCount,
        }),
        credentialsDescription: t("consentRequiredModal.credentialsDescription"),
        consentButtonTitle: t("consentRequiredModal.consentButtonTitle"),
        backButtonTitle: t("consentRequiredModal.backButtonTitle"),
    };

    const panelClassName =
        `${VerifierCredentialsRequestCardStyles.actionButtons} ${className}`.trim();

    const shareButton = (
        <div className={VerifierCredentialsRequestCardStyles.shareButtonCard}>
            <SolidButton
                testId="show-consent-modal-button"
                onClick={() => setConsentRequiredModal(true)}
                title={t("credentialTile.shareCredentialsButton")}
                className="h-12 py-0 break-words min-w-0 w-full"
                fullWidth
                disabled={!shareEnabled}
            />
        </div>
    );

    const declineButton = (
        <div className={VerifierCredentialsRequestCardStyles.declineButton}>
            <PlainButton
                variant="neutral"
                fullWidth
                testId="verifier-decline-button"
                title={t("credentialTile.shareCredentialsDeclineButton")}
                onClick={handleDecline}
                disabled={declineDisabled}
                className="h-12 rounded-xl"
            />
        </div>
    );

    return (
        <>
            <div
                className={panelClassName}
                data-testid="verifier-request-action-panel"
            >
                {stickyBelowHeader ? (
                    <VpStickyActionPanel className="w-full bg-transparent">
                        {shareButton}
                        {declineButton}
                    </VpStickyActionPanel>
                ) : (
                    <div>
                        {shareButton}
                        {declineButton}
                    </div>
                )}
            </div>

            {showConsentRequiredModal && (
                <ConsentRequiredModal
                    title={consentModalLabels.title}
                    description={consentModalLabels.description}
                    credentialsTitle={consentModalLabels.credentialsTitle}
                    credentialsDescription={consentModalLabels.credentialsDescription}
                    consentButtonTitle={consentModalLabels.consentButtonTitle}
                    backButtonTitle={consentModalLabels.backButtonTitle}
                    onConfirm={() => onShareCredentials?.()}
                    onBack={() => setConsentRequiredModal(false)}
                />
            )}
        </>
    );
}

function VerifierCredentialsRequestCard({
    verifier,
    presentationId,
    selectedCredentialIds = [],
    onShareCredentials,
    isShareEnabled,
    stickyBelowHeader = false,
}: CredentialShareCardProps) {
    return (
        <div
            className={VerifierCredentialsRequestCardStyles.mainContainer}
            data-testid="verifier-credentials-request-card"
        >
            <div className={VerifierCredentialsRequestCardStyles.contentRow}>
                <VerifierRequestInfoPanel verifier={verifier} />
                <VerifierRequestActionPanel
                    verifier={verifier}
                    presentationId={presentationId}
                    selectedCredentialIds={selectedCredentialIds}
                    onShareCredentials={onShareCredentials}
                    isShareEnabled={isShareEnabled}
                    stickyBelowHeader={stickyBelowHeader}
                />
            </div>
        </div>
    );
}

export default VerifierCredentialsRequestCard;
