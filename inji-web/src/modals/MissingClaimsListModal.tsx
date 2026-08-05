import React from "react";
import { ModalWrapper } from "./ModalWrapper";
import {
    MissingClaimsListModalContent,
    MissingClaimsListModalContentProps,
} from "./MissingClaimsListModalContent";

export interface MissingClaimsListModalProps
    extends MissingClaimsListModalContentProps {
    isVisible: boolean;
}

export const MissingClaimsListModal: React.FC<MissingClaimsListModalProps> = ({
    isVisible,
    ...contentProps
}) => {
    if (!isVisible) {
        return null;
    }

    return (
        <div
            data-testid="card-missing-claims-list-modal"
            className="w-full transition-all duration-300 ease-in-out"
        >
            <ModalWrapper
                zIndex={50}
                size="2xl"
                header={<></>}
                footer={<></>}
                content={<MissingClaimsListModalContent {...contentProps} />}
            />
        </div>
    );
};
