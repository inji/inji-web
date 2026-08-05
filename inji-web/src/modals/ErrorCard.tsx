import React from "react";
import { ModalWrapper } from "./ModalWrapper";
import { ErrorCardContent, ErrorCardContentProps } from "./ErrorCardContent";

interface ErrorCardProps extends ErrorCardContentProps {
    isOpen: boolean;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
    isOpen,
    ...contentProps
}) => {
    if (!isOpen) return null;

    return (
        <div>
            <ModalWrapper
                zIndex={50}
                size="xl"
                header={<></>}
                footer={<></>}
                content={<ErrorCardContent {...contentProps} />}
            />
        </div>
    );
};
