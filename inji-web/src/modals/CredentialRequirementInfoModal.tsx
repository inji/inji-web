import { ModalWrapper } from "./ModalWrapper";
import {
    CredentialRequirementInfoModalContent,
    CredentialRequirementInfoModalContentProps,
} from "./CredentialRequirementInfoModalContent";

export type { RequirementInfoVerifier } from "./CredentialRequirementInfoModalContent";

function CredentialRequirementInfoModal(
    props: CredentialRequirementInfoModalContentProps
) {
    return (
        <div>
            <ModalWrapper
                zIndex={50}
                size="md"
                header={<></>}
                footer={<></>}
                content={<CredentialRequirementInfoModalContent {...props} />}
            />
        </div>
    );
}

export default CredentialRequirementInfoModal;
