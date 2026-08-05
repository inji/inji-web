import { ModalWrapper } from "./ModalWrapper";
import {
    CredentialPreviewModalContent,
    CredentialPreviewModalContentProps,
} from "./CredentialPreviewModalContent";

function CredentialPreviewModal(props: CredentialPreviewModalContentProps) {
    return (
        <ModalWrapper
            zIndex={50}
            size="6xl"
            header={<></>}
            footer={<></>}
            content={<CredentialPreviewModalContent {...props} />}
        />
    );
}

export default CredentialPreviewModal;
