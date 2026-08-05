import React from "react";
import { ModalWrapper } from "../../modals/ModalWrapper";
import {
    TrustVerifierModalContent,
    TrustVerifierModalContentProps,
} from "./TrustVerifierModalContent";

interface TrustVerifierModalProps extends TrustVerifierModalContentProps {
    isOpen: boolean;
}

export const TrustVerifierModal: React.FC<TrustVerifierModalProps> = ({
    isOpen,
    ...contentProps
}) => {
    if (!isOpen) return null;

    return (
        <ModalWrapper
            zIndex={50}
            size="md"
            header={<></>}
            footer={<></>}
            content={<TrustVerifierModalContent {...contentProps} />}
        />
    );
};
