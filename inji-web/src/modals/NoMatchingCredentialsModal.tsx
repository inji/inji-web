import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ModalWrapper } from "./ModalWrapper";
import { useTranslation } from "react-i18next";
import { useApi } from "../hooks/useApi";
import { api } from "../utils/api";
import { useApiErrorHandler } from "../hooks/useApiErrorHandler";
import { ErrorCard } from "./ErrorCard";
import { RequirementInfoVerifier } from "./CredentialRequirementInfoModal";
import { PresentationCredential } from "../types/components";
import { MissingClaimsListModal } from "./MissingClaimsListModal";
import { safeExternalRedirect } from "../utils/navigationUtils";
import { NoMatchingCredentialsModalContent } from "./NoMatchingCredentialsModalContent";

const INITIAL_VISIBLE_CLAIMS = 3;

export interface NoMatchingCredentialsModalProps {
    isVisible: boolean;
    missingClaims?: string[];
    matchingCredentials?: PresentationCredential[];
    verifier?: RequirementInfoVerifier | null;
    onGoToHome?: () => void;
    onClose?: () => void;
    redirectUri?: string | null;
    presentationId?: string;
}

export const NoMatchingCredentialsModal: React.FC<
    NoMatchingCredentialsModalProps
> = ({
    isVisible,
    missingClaims = [],
    matchingCredentials = [],
    verifier,
    onGoToHome,
    onClose,
    redirectUri,
    presentationId,
}) => {
    const { t } = useTranslation("NoMatchingCredentialsModal");
    const { fetchData: rejectVerifier } = useApi<{
        success: boolean;
        redirectUri?: string | null;
    }>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFullClaimsList, setShowFullClaimsList] = useState(false);

    useEffect(() => {
        if (!isVisible) {
            setShowFullClaimsList(false);
        }
    }, [isVisible]);

    const {
        showError,
        errorDescription,
        errorTitle,
        isRetrying,
        handleApiError,
        onClose: handleModalClose,
        onRetry,
    } = useApiErrorHandler({ onClose: onGoToHome });

    const verifierName = verifier?.name?.trim() || t("unknownVerifier");

    const visibleClaims = useMemo(() => {
        if (missingClaims.length <= INITIAL_VISIBLE_CLAIMS) {
            return missingClaims;
        }
        return missingClaims.slice(0, INITIAL_VISIBLE_CLAIMS);
    }, [missingClaims]);

    const hiddenClaimsCount = Math.max(
        missingClaims.length - INITIAL_VISIBLE_CLAIMS,
        0
    );

    const hasMatchingCredentials = matchingCredentials.length > 0;

    const handleExit = useCallback(
        (nextRedirectUri = "") => {
            if (nextRedirectUri) {
                safeExternalRedirect(nextRedirectUri);
            } else if (onGoToHome) {
                onGoToHome();
            }
        },
        [onGoToHome]
    );

    const rejectVerifierCallback = useCallback(async () => {
        const rejectPayload = {
            errorCode: "invalid_transaction_data",
            errorMessage: "No matching credentials found to fulfill the request",
        };

        const response = await rejectVerifier({
            url: api.userRejectVerifier.url(presentationId!),
            apiConfig: api.userRejectVerifier,
            body: rejectPayload,
        });

        return response;
    }, [rejectVerifier, presentationId]);

    const handleContinueWithAvailableCredentials = useCallback(() => {
        if (onClose) {
            onClose();
            return;
        }
        onGoToHome?.();
    }, [onClose, onGoToHome]);

    const handleGoToHome = useCallback(async () => {
        if (isSubmitting || isRetrying) {
            return;
        }

        if (hasMatchingCredentials) {
            handleContinueWithAvailableCredentials();
            return;
        }

        setIsSubmitting(true);

        if (!presentationId) {
            handleExit();
            if (!redirectUri) setIsSubmitting(false);
            return;
        }

        try {
            const response = await rejectVerifierCallback();
            const responseRedirectUri = response?.data?.redirectUri || "";
            if (response.ok()) {
                handleExit(responseRedirectUri);
            } else {
                throw response.error || new Error("Failed to reject verifier");
            }
            if (!responseRedirectUri) setIsSubmitting(false);
        } catch (err) {
            handleApiError(err, "rejectVerifier", rejectVerifierCallback, handleExit);
            setIsSubmitting(false);
        }
    }, [
        isSubmitting,
        isRetrying,
        hasMatchingCredentials,
        handleContinueWithAvailableCredentials,
        presentationId,
        rejectVerifierCallback,
        handleExit,
        handleApiError,
        redirectUri,
    ]);

    const handleClose = useCallback(() => {
        if (onClose) {
            onClose();
            return;
        }
        void handleGoToHome();
    }, [onClose, handleGoToHome]);

    if (!isVisible) return null;

    if (showError) {
        return (
            <ErrorCard
                isOpen={true}
                title={errorTitle}
                description={errorDescription}
                onClose={handleModalClose}
                onRetry={onRetry}
                isRetrying={isRetrying}
                testId="modal-error-handler-no-matching"
            />
        );
    }

    if (showFullClaimsList) {
        return (
            <MissingClaimsListModal
                isVisible
                missingClaims={missingClaims}
                onBack={() => setShowFullClaimsList(false)}
            />
        );
    }

    return (
        <div
            data-testid="card-no-matching-credentials-modal"
            className="w-full transition-all duration-300 ease-in-out"
        >
            <ModalWrapper
                zIndex={50}
                size="3xl"
                header={<></>}
                footer={<></>}
                content={
                    <NoMatchingCredentialsModalContent
                        missingClaims={missingClaims}
                        visibleClaims={visibleClaims}
                        hiddenClaimsCount={hiddenClaimsCount}
                        matchingCredentials={matchingCredentials}
                        verifier={verifier}
                        verifierName={verifierName}
                        hasMatchingCredentials={hasMatchingCredentials}
                        isSubmitting={isSubmitting}
                        isRetrying={isRetrying}
                        onClose={handleClose}
                        onShowFullClaimsList={() => setShowFullClaimsList(true)}
                        onGoToHome={() => void handleGoToHome()}
                    />
                }
            />
        </div>
    );
};
