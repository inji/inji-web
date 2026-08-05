import { ModalWrapper } from "./ModalWrapper";
import {
    ConsentRequiredModalContent,
    ConsentRequiredModalContentProps,
} from "./ConsentRequiredModalContent";

function ConsentRequiredModal(props: ConsentRequiredModalContentProps) {
    return (
        <div>
            <ModalWrapper
                zIndex={50}
                size="md"
                header={<></>}
                footer={<></>}
                content={<ConsentRequiredModalContent {...props} />}
            />
        </div>
    );
}

export default ConsentRequiredModal;
