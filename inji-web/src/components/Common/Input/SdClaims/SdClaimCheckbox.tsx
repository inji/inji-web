import React from "react";
import SelectedTickIcon from "../../../../assets/SelectedTickIcon.svg";
import { SdClaimInputStyles } from "./SdClaimInputStyles";

interface SdClaimCheckboxProps {
    selected: boolean;
    onToggle?: () => void;
    testId?: string;
    readOnly?: boolean;
    label?: string;
}

export const SdClaimCheckbox: React.FC<SdClaimCheckboxProps> = ({
    selected,
    onToggle,
    testId = "sd-claim-checkbox",
    readOnly = false,
    label,
}) => {
    if (readOnly) {
        if (selected) {
            return (
                <div
                    className={SdClaimInputStyles.sdClaimCheckboxSelected}
                    data-testid={`${testId}-selected`}
                    aria-hidden
                >
                    <img src={SelectedTickIcon} alt="" />
                </div>
            );
        }

        return (
            <div
                className={SdClaimInputStyles.sdClaimCheckboxUnselected}
                data-testid={`${testId}-unselected`}
                aria-hidden
            />
        );
    }

    if (selected) {
        return (
            <button
                type="button"
                onClick={onToggle}
                className={SdClaimInputStyles.sdClaimCheckboxSelected}
                aria-pressed="true"
                aria-label={label}
                data-testid={`${testId}-selected`}
            >
                <img src={SelectedTickIcon} alt="" />
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onToggle}
            className={SdClaimInputStyles.sdClaimCheckboxUnselected}
            aria-pressed="false"
            aria-label={label}
            data-testid={`${testId}-unselected`}
        />
    );
};
