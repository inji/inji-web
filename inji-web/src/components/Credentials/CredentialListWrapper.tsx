import React from "react";
import {CredentialList} from "./CredentialList";
import {RequestStatus} from "../../utils/constants";

interface CredentialListWrapperProps {
    state: RequestStatus;
  className?: string;
}

export const CredentialListWrapper: React.FC<CredentialListWrapperProps> = ({state,className = "",}) => {
    return (
        <div
            data-testid="Credential-List-Container"
            className={className}
        >
      {/* Responsive grid wrapper ensures consistent alignment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CredentialList state={state}/>
        </div>
    </div>
    );
};