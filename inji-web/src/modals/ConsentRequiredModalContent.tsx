import { SolidButton } from "../components/Common/Buttons/SolidButton";
import ShieldIcon from "../assets/Shield-gray.svg";
import { ModalStyles } from "./ModalStyles";

export interface ConsentRequiredModalContentProps {
    title: string;
    description: string;
    credentialsTitle: string;
    credentialsDescription: string;
    consentButtonTitle: string;
    backButtonTitle: string;
    onConfirm?: () => void;
    onBack?: () => void;
}

export function ConsentRequiredModalContent({
    title,
    description,
    credentialsTitle,
    credentialsDescription,
    consentButtonTitle,
    backButtonTitle,
    onConfirm,
    onBack,
}: ConsentRequiredModalContentProps) {
    const styles = ModalStyles.consentRequiredModal;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>
            <div className={styles.credentialsContainer}>
                <p className={styles.credentialsTitle}>
                    <img src={ShieldIcon} alt="Shield icon" />
                    {credentialsTitle}
                </p>
                <p className={styles.credentialsDescription}>
                    {credentialsDescription}
                </p>
            </div>
            <SolidButton
                testId="CredentialShareCard-ShareButton"
                onClick={() => onConfirm?.()}
                title={consentButtonTitle}
                className={styles.confirmButton}
            />
            <button
                type="button"
                className={styles.backButton}
                onClick={() => onBack?.()}
            >
                {backButtonTitle}
            </button>
        </div>
    );
}
