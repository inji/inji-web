import React from "react";
import { ClaimLeaf } from "../../../../utils/sdClaimsTree";
import { ClaimCheckbox } from "./ClaimCheckbox";
import { SdClaimInputStyles } from "./SdClaimInputStyles";

interface ClaimLeafRowProps {
    node: ClaimLeaf;
    depth?: number;
    isSelected: boolean;
    onToggle?: () => void;
    variant?: "default" | "modal";
}

export const ClaimLeafRow: React.FC<ClaimLeafRowProps> = ({
    node,
    depth = 0,
    isSelected,
    onToggle,
    variant = "default",
}) => {
    const isToggleable = node.claimType === "sdClaim" && !!onToggle;
    const isModalVariant = variant === "modal";

    return (
        <button
            type="button"
            className={
                isModalVariant
                    ? SdClaimInputStyles.leafRowModal
                    : SdClaimInputStyles.leafRow
            }
            data-testid={`claim-leaf-${node.path}`}
            onClick={isToggleable ? onToggle : undefined}
            disabled={!isToggleable}
            aria-pressed={isToggleable ? isSelected : undefined}
        >
            <p
                className={
                    isModalVariant
                        ? SdClaimInputStyles.leafLabelModal
                        : SdClaimInputStyles.leafLabel
                }
            >
                {node.label}
            </p>
            <ClaimCheckbox
                claimType={node.claimType}
                selected={isSelected}
                readOnly={isToggleable}
                testId={`claim-checkbox-${node.path}`}
                label={node.label}
            />
        </button>
    );
};
