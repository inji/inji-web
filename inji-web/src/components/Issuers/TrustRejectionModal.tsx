import React, { useCallback } from "react";
import { ModalWrapper } from "../../modals/ModalWrapper";
import { useApi } from "../../hooks/useApi";
import { useNavigate } from "react-router-dom";
import { rejectVerifierRequest } from "../../utils/verifierUtils";
import {
    TrustRejectionModalContent,
    TrustRejectionModalContentProps,
} from "./TrustRejectionModalContent";

interface TrustRejectionModalProps
    extends Omit<TrustRejectionModalContentProps, "onConfirm"> {
    isOpen: boolean;
    presentationId: string;
    redirectUri?: string | null;
    onConfirm?: () => void;
}

export const TrustRejectionModal: React.FC<TrustRejectionModalProps> = ({
    isOpen,
    presentationId,
    redirectUri,
    onConfirm,
    ...contentProps
}) => {
    const { fetchData } = useApi();
    const navigate = useNavigate();

    const handleConfirm = useCallback(async () => {
        await rejectVerifierRequest({
            presentationId,
            fetchData,
            redirectUri,
            onSuccess: onConfirm,
            navigate,
        });
    }, [presentationId, fetchData, redirectUri, onConfirm, navigate]);

    if (!isOpen) return null;

    return (
        <ModalWrapper
            zIndex={50}
            size="xl"
            header={<></>}
            footer={<></>}
            content={
                <TrustRejectionModalContent
                    {...contentProps}
                    onConfirm={handleConfirm}
                />
            }
        />
    );
};
