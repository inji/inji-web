import { ModalWrapper } from "./ModalWrapper";
import {
    LeaveConfirmationModalContent,
    LeaveConfirmationModalContentProps,
} from "./LeaveConfirmationModalContent";

function LeaveConfirmationModal(props: LeaveConfirmationModalContentProps) {
    return (
        <ModalWrapper
            zIndex={50}
            size="sm"
            header={<></>}
            footer={<></>}
            content={<LeaveConfirmationModalContent {...props} />}
        />
    );
}

export default LeaveConfirmationModal;
