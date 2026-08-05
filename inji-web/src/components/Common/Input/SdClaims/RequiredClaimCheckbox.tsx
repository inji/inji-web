import React from "react";
import SelectedTickIcon from "../../../../assets/SelectedTickIcon.svg";
import { SdClaimInputStyles } from "./SdClaimInputStyles";

export const RequiredClaimCheckbox: React.FC = () => (
    <div className={SdClaimInputStyles.requiredCheckbox} data-testid="required-claim-checkbox">
        <img src={SelectedTickIcon} alt="" />
    </div>
);
