import { SolidButton } from "../components/Common/Buttons/SolidButton";
import CustomButton from "../components/Common/Buttons/CustomButton";
import { ModalStyles } from "./ModalStyles";

export interface LeaveConfirmationModalContentProps {
    title: string;
    description: string;
    confirmBtnTitle: string;
    cancelBtnTitle: string;
    confirmLeave: () => void;
    cancelLeave: () => void;
}

export function LeaveConfirmationModalContent({
    title,
    description,
    confirmBtnTitle,
    cancelBtnTitle,
    confirmLeave,
    cancelLeave,
}: LeaveConfirmationModalContentProps) {
    return (
        <div className={ModalStyles.leaveConfirmationModal.container}>
            <h2 className={ModalStyles.leaveConfirmationModal.title}>{title}</h2>
            <p className={ModalStyles.leaveConfirmationModal.description}>
                {description}
            </p>
            <SolidButton
                testId="LeaveConfirmationModal-LeaveButton"
                onClick={() => confirmLeave()}
                title={confirmBtnTitle}
                className={ModalStyles.leaveConfirmationModal.leaveButton}
            />
            <CustomButton
                testId="closeBackPopup"
                onClick={() => cancelLeave()}
                title={cancelBtnTitle}
                styles={ModalStyles.leaveConfirmationModal.goBackButton}
            />
        </div>
    );
}
