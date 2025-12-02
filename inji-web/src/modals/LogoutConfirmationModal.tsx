import React from "react";
import {SolidButton} from "../components/Common/Buttons/SolidButton";
import {useTranslation} from "react-i18next";
import {LogoutConfirmationModalStyles} from "./LogoutConfirmationModalStyles";
import {ReactComponent as ExitWalletInfoIcon} from "../assets/exit-wallet-info-icon.svg";
import ReactDOM from "react-dom";
import {Clickable} from "../components/Common/Clickable";
/**
 * LogoutConfirmationModal component
 *
 * Features:
 * - Displays a confirmation modal when user tries to navigate back from protected routes
 * - Shows an info icon, warning message about logout, and two action buttons
 * - Handles session cleanup on logout confirmation
 * - Allows user to stay on current page
 */
export interface LogoutConfirmationModalProps {
    isOpen: boolean;
    onLogout: () => void;
    onStayOnPage: () => void;
    testId: string;
}
export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
    isOpen,
    onLogout,
    onStayOnPage,
    testId
}) => {
    const {t} = useTranslation('LogoutConfirmation');
    if (!isOpen) return null;
    
    const InfoIcon = () => (
        <div className={LogoutConfirmationModalStyles.iconWrapper}>
            <ExitWalletInfoIcon
                className={LogoutConfirmationModalStyles.icon}
                data-testid={`${testId}-exit-wallet-info-icon`}
            />
        </div>
    );
    return ReactDOM.createPortal(
        <Clickable
            className={LogoutConfirmationModalStyles.overlay}
            onClick={onStayOnPage}
            testId={`modal-logout-confirmation-${testId}`}
        >
            <div 
                className={LogoutConfirmationModalStyles.modalContainer}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={LogoutConfirmationModalStyles.container}>
                    <InfoIcon />
                    <div className={LogoutConfirmationModalStyles.titleWrapper}>
                        <h2
                            className={LogoutConfirmationModalStyles.title}
                            data-testid={`${testId}-title`}
                        >
                            {t('title')}
                        </h2>
                    </div>
                    <div className={LogoutConfirmationModalStyles.messageWrapper}>
                        <p
                            className={LogoutConfirmationModalStyles.message}
                            data-testid={`${testId}-message`}
                        >
                            {t('message')}
                        </p>
                    </div>
                    <div className={LogoutConfirmationModalStyles.buttonsContainer}>
                        <SolidButton
                            testId={`${testId}-logout-button`}
                            onClick={onLogout}
                            title={t('logoutButton')}
                            fullWidth
                            className={LogoutConfirmationModalStyles.logoutButton}
                        />
                        <button
                            data-testid={`${testId}-stay-button`}
                            onClick={(event: React.MouseEvent) => {
                                event.stopPropagation();
                                onStayOnPage();
                            }}
                            className={LogoutConfirmationModalStyles.stayButton}
                        >
                            {t('stayButton')}
                        </button>
                    </div>
                </div>
            </div>
        </Clickable>,
        document.body
    );
};