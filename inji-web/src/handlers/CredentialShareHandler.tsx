import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { useApi } from "../hooks/useApi";
import { api } from "../utils/api";
import { LoaderModal } from "../modals/LoaderModal";
import { ErrorCard } from "../modals/ErrorCard";
import { CredentialShareSuccessModal } from "../modals/CredentialShareSuccessModal";
import { PresentationCredential, CredentialShareSuccessModalProps } from "../types/components";
import { useApiErrorHandler } from "../hooks/useApiErrorHandler";

interface CredentialShareHandlerProps {
    verifierName: string;
    returnUrl: string;
    selectedCredentials: PresentationCredential[];
    presentationId: string;
    onClose?: () => void;
}

export const CredentialShareHandler: React.FC<CredentialShareHandlerProps> = ({
                                                                                  verifierName,
                                                                                  returnUrl,
                                                                                  selectedCredentials,
                                                                                  presentationId,
                                                                                  onClose
                                                                              }) => {
    const { fetchData } = useApi();
    const {t} = useTranslation("ShareHandlerLoadingModal");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [redirectUri, setRedirectUri] = useState<string | null>(null);
    const hasSubmittedRef = useRef<boolean>(false);

    const {
        showError,
        isRetrying,
        errorTitle,
        errorDescription,
        onRetry,
        onClose: handleModalClose,
        handleApiError
    } = useApiErrorHandler({ onClose });

    const submitPresentationCallback = useCallback(async () => {
        const response = await fetchData({
            apiConfig: api.submitPresentation,
            url: api.submitPresentation.url(presentationId),
            body: {
                selectedCredentials: selectedCredentials.map(c => c.credentialId)
            }
        });
        return response;
    }, [fetchData, presentationId, selectedCredentials]);

    const handleRetrySuccess = useCallback((response: any) => {
        const responseRedirectUri = response.data?.redirectUri;
        if (responseRedirectUri) {
            setRedirectUri(responseRedirectUri);
        }
        setIsSuccess(true);
    }, []);

    const submitPresentation = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await submitPresentationCallback();

            if (response.ok()) {
                const responseRedirectUri = response.data?.redirectUri;
                if (responseRedirectUri) {
                    setRedirectUri(responseRedirectUri);
                }
                setIsSuccess(true);
            } else {
                const errorMessage = response.error?.message || 'Failed to submit presentation';
                const error = response.error || new Error(errorMessage);
                handleApiError(error, "submitPresentation", submitPresentationCallback, (response) => handleRetrySuccess(response));
                setIsSuccess(false);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            const error = err instanceof Error ? err : new Error(errorMessage);
            handleApiError(error, "submitPresentation", submitPresentationCallback, (response) => handleRetrySuccess(response));
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
        }
    }, [submitPresentationCallback, handleApiError, handleRetrySuccess]);

    useEffect(() => {
        if (hasSubmittedRef.current) return;
        if (!selectedCredentials?.length || !presentationId) return;

        hasSubmittedRef.current = true;
        void submitPresentation();
    }, [submitPresentation, selectedCredentials, presentationId]);

    const handleSuccessClose = () => {
        const finalRedirectUri = redirectUri || returnUrl;
        if (finalRedirectUri) window.location.href = finalRedirectUri;
        else if (onClose) onClose();
    };

    if (isSuccess) {
        const successModalProps: CredentialShareSuccessModalProps = {
            isOpen: true,
            verifierName,
            credentials: selectedCredentials,
            returnUrl: redirectUri || returnUrl,
            onClose: handleSuccessClose
        };
        return <CredentialShareSuccessModal {...successModalProps} />;
    }

    if (showError) {
        return (
            <ErrorCard
                isOpen={true}
                title={errorTitle}
                description={errorDescription}
                onClose={handleModalClose}
                onRetry={onRetry}
                isRetrying={isRetrying}
                testId="modal-error-card"
            />
        );
    }

    if (isLoading || isRetrying) {
        return (
            <LoaderModal
                isOpen={true}
                message={t("message")}
                size="xl-loading"
                testId="modal-loader-card"
            />
        );
    }

    return null;
};