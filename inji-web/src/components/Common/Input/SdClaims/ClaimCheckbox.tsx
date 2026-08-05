import React from "react";
import { ClaimType } from "../../../../utils/sdClaimsTree";
import { RequiredClaimCheckbox } from "./RequiredClaimCheckbox";
import { SdClaimCheckbox } from "./SdClaimCheckbox";

interface ClaimCheckboxProps {
    claimType: ClaimType;
    selected: boolean;
    onToggle?: () => void;
    testId?: string;
    readOnly?: boolean;
    label?: string;
}

export const ClaimCheckbox: React.FC<ClaimCheckboxProps> = ({
    claimType,
    selected,
    onToggle,
    testId,
    readOnly = false,
    label,
}) => {
    if (claimType === "claim") {
        return <RequiredClaimCheckbox />;
    }

    return (
        <SdClaimCheckbox
            selected={selected}
            onToggle={onToggle}
            testId={testId}
            readOnly={readOnly}
            label={label}
        />
    );
};
