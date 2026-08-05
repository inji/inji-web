import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { useApi } from "../hooks/useApi";
import { api } from "../utils/api";
import { LoaderModal } from "../modals/LoaderModal";
import { ErrorCard } from "../modals/ErrorCard";
import { PresentationCredential } from "../types/components";
import { useApiErrorHandler } from "../hooks/useApiErrorHandler";
import { DcqlSelectionEntry, SelectedSdClaimsMap, SubmitPresentationBody } from "../types/data";
import { DcqlSelectionState } from "../types/dcql";

export interface CredentialShareSuccessPayload {
    verifierName: string;
    verifierLogo?: string | null;
    verifierTrusted?: boolean;
    credentials: PresentationCredential[];
    returnUrl: string;
}

interface CredentialShareHandlerProps {
    verifierName: string;
    verifierLogo?: string | null;
    verifierTrusted?: boolean;
    returnUrl: string;
    selectedCredentials: PresentationCredential[];
    selectedSdClaims?: SelectedSdClaimsMap;
    presentationId: string;
    isDcqlPresentation?: boolean;
    dcqlSelection?: DcqlSelectionState;
    onClose?: () => void;
    onShareSuccess?: (payload: CredentialShareSuccessPayload) => void;
}

export const CredentialShareHandler: React.FC<CredentialShareHandlerProps> = ({
                                                                                  verifierName,
                                                                                  verifierLogo,
                                                                                  verifierTrusted,
                                                                                  returnUrl,
                                                                                  selectedCredentials,
                                                                                  selectedSdClaims,
                                                                                  presentationId,
                                                                                  isDcqlPresentation,
                                                                                  dcqlSelection,
                                                                                  onClose,
                                                                                  onShareSuccess
                                                                              }) => {
    const { fetchData } = useApi();
    const {t} = useTranslation("ShareHandlerLoadingModal");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
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
        const body: SubmitPresentationBody = {};

        if (isDcqlPresentation && dcqlSelection) {
            // DCQL: selectedCredentials is an array of objects — Mimoto detects DCQL
            // by inspecting whether the first element has a queryId field.
            const dcqlEntries: DcqlSelectionEntry[] = Object.entries(dcqlSelection)
                .filter(([, ids]) => ids.length > 0)
                .map(([queryId, selectedCredentialIds]) => ({ queryId, selectedCredentialIds }));
            body.selectedCredentials = dcqlEntries;
        } else {
            // Draft-23: selectedCredentials is an array of plain credential ID strings.
            body.selectedCredentials = selectedCredentials.map((c) => c.credentialId);
        }

        if (selectedSdClaims && Object.keys(selectedSdClaims).length > 0) {
            body.selectedSdClaims = selectedSdClaims;
        }

        const response = await fetchData({
            apiConfig: api.submitPresentation,
            url: api.submitPresentation.url(presentationId),
            body,
        });
        return response;
    }, [fetchData, presentationId, selectedCredentials, selectedSdClaims, isDcqlPresentation, dcqlSelection]);

    const handleRetrySuccess = useCallback((response: any) => {
        const responseRedirectUri = response.data?.redirectUri;
        const finalReturnUrl = responseRedirectUri || returnUrl;
        onShareSuccess?.({
            verifierName,
            verifierLogo,
            verifierTrusted,
            credentials: selectedCredentials,
            returnUrl: finalReturnUrl,
        });
        setIsSuccess(true);
    }, [
        onShareSuccess,
        returnUrl,
        selectedCredentials,
        verifierLogo,
        verifierName,
        verifierTrusted,
    ]);

    const submitPresentation = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await submitPresentationCallback();

            if (response.ok()) {
                const responseRedirectUri = response.data?.redirectUri;
                const finalReturnUrl = responseRedirectUri || returnUrl;
                onShareSuccess?.({
                    verifierName,
                    verifierLogo,
                    verifierTrusted,
                    credentials: selectedCredentials,
                    returnUrl: finalReturnUrl,
                });
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
    }, [submitPresentationCallback, handleApiError, handleRetrySuccess, onShareSuccess, returnUrl, selectedCredentials, verifierLogo, verifierName, verifierTrusted]);

    useEffect(() => {
        if (hasSubmittedRef.current) return;
        if (!selectedCredentials?.length || !presentationId) return;

        hasSubmittedRef.current = true;
        void submitPresentation();
    }, [submitPresentation, selectedCredentials, presentationId]);

    if (isSuccess) {
        return null;
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