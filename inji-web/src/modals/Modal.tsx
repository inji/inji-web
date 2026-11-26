import React, {Fragment} from 'react';
import ReactDOM from 'react-dom';
import {BackArrowButton} from "../components/Common/Buttons/BackArrowButton";
import {PageTitle} from "../components/Common/PageTitle/PageTitle";
import {Clickable} from "../components/Common/Clickable";
import {Separator} from "../components/Common/Separator";
import {CloseIconButton} from "../components/Common/Buttons/CloseIconButton";
import {ModalStyles} from "./ModalStyles";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    titleTestId?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
    testId: string;
}

/**
 * Modal component that renders a dialog box with a backdrop.
 * Features:
 * 1. Renders provided title with back arrow and on close as header
 *    Renders the provided children
 *    If action is provided
 *      - action is sticky floatable for large screens
 *      - container block for smaller screens
 * 2. Serves a responsive modal which can be used to wrap any content as per need
 */
export const Modal: React.FC<ModalProps> = ({isOpen, onClose, children, action, title, size, testId, titleTestId}) => {
    if (!isOpen) return null;

    const modalSize = size ? `min-h-${size}` : "h-[83vh] w-[calc(100vw-1rem)] sm:w-[70vw] sm:h-[80vh]"

    return ReactDOM.createPortal(
        <Clickable
            className={ModalStyles.modal.overlay}
            onClick={onClose}
            testId={testId}
        >
            <dialog
                className={`${ModalStyles.modal.container} ${modalSize}`}
                aria-modal="true"
                open
                onClose={onClose}
                onCancel={onClose}
            >
                {
                    title && (
                        <Fragment>
                            <div className={ModalStyles.modal.header.wrapper}>
                                <BackArrowButton onClick={onClose} btnTestId={"btn-back"}/>
                                <PageTitle value={title} testId={titleTestId ?? `title-${testId}`}/>
                                <CloseIconButton
                                    btnTestId={"btn-close"}
                                    onClick={onClose}
                                    btnClassName={ModalStyles.modal.header.closeButton}
                                />
                            </div>
                            <Separator className={ModalStyles.modal.separator}/>
                        </Fragment>
                    )
                }

                <div className={ModalStyles.modal.content.wrapper}>
                    <div className={ModalStyles.modal.content.container} data-testid={`${testId}-content`}>
                        {children}
                    </div>

                    {action && (
                        <div className={ModalStyles.modal.action}>
                            {action}
                        </div>
                    )}
                </div>
            </dialog>
        </Clickable>,
        document.body
    );
};