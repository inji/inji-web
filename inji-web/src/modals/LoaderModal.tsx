import React from "react";
import { ModalWrapper } from "./ModalWrapper";
import {
    LoaderModalContent,
    LoaderModalContentProps,
} from "./LoaderModalContent";

interface LoaderModalProps extends LoaderModalContentProps {
    isOpen: boolean;
}

export const LoaderModal: React.FC<LoaderModalProps> = ({
    isOpen,
    ...contentProps
}) => {
    if (!isOpen) return null;

    return (
        <div className="transition-all duration-300 ease-in-out max-[533px]:w-screen max-[533px]:left-0 max-[533px]:right-0 max-[533px]:z-[60]">
            <ModalWrapper
                zIndex={50}
                size={contentProps.size ?? "4xl"}
                header={<></>}
                footer={<></>}
                content={<LoaderModalContent {...contentProps} />}
            />
        </div>
    );
};
