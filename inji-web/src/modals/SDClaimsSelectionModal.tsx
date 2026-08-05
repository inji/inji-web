import { ModalWrapper } from "./ModalWrapper";
import {
    SDClaimsSelectionModalContent,
    SDClaimsSelectionModalContentProps,
} from "./SDClaimsSelectionModalContent";

function SDClaimsSelectionModal(props: SDClaimsSelectionModalContentProps) {
    return (
        <div>
            <ModalWrapper
                zIndex={50}
                size="7xl"
                header={<></>}
                footer={<></>}
                content={<SDClaimsSelectionModalContent {...props} />}
            />
        </div>
    );
}

export default SDClaimsSelectionModal;
