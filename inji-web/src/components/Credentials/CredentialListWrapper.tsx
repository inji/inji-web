import React from "react";
import {CredentialList} from "./CredentialList";
import {RequestStatus} from "../../utils/constants";

interface CredentialListWrapperProps {
    state: RequestStatus;
    className: string;
    showHeader?: boolean;
}

export const CredentialListWrapper: React.FC<CredentialListWrapperProps> = ({state, className, showHeader = true}) => {
    return (
        <div
            data-testid="Credential-List-Container"
            className={className}
        >
            <CredentialList state={state} showHeader={showHeader}/>
        </div>
    );
};