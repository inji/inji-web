import React from "react";
import { useTranslation } from "react-i18next";
import SelectedTickIcon from "../../../../assets/SelectedTickIcon.svg";
import { SdClaimInputStyles } from "./SdClaimInputStyles";
import ArrowBack from "../../../../assets/ArrowBack.svg";
import ArrowOpen from "../../../../assets/ArrowOpen.svg";

interface ClaimGroupRowProps {
    label: string;
    groupKey: string;
    isExpanded: boolean;
    selectionState: "noSelectable" | "hasSelectableNoneSelected" | "hasSelectableSomeSelected";
    fieldsCount: number;
    depth?: number;
    onToggle: () => void;
}

export const ClaimGroupRow: React.FC<ClaimGroupRowProps> = ({
    label,
    groupKey,
    isExpanded,
    selectionState,
    fieldsCount,
    depth = 0,
    onToggle,
}) => {
    const { t } = useTranslation("SDClaimsSelectionModal");

    return (
    <button
        type="button"
        onClick={onToggle}
        className={`${SdClaimInputStyles.groupHeader} rounded-lg ${isExpanded ? "bg-[#7C13891A] rounded-b-none" : "border-transparent"}`}
        style={{ marginInlineStart: depth > 0 ? depth * 16 : 0 }}
        data-testid={`claim-group-${groupKey}`}
        aria-expanded={isExpanded}
    >
        <div className={SdClaimInputStyles.groupLeft}>
            {selectionState === "noSelectable" ? (
                <div className={SdClaimInputStyles.requiredCheckbox}>
                    <img src={SelectedTickIcon} alt="" />
                </div>
            ) : selectionState === "hasSelectableSomeSelected" ? (
                <div className={SdClaimInputStyles.sdClaimCheckboxSelected}>
                    <img src={SelectedTickIcon} alt="" />
                </div>
            ) : (
                <div className={SdClaimInputStyles.sdClaimCheckboxUnselected} />
            )}
            <p className={SdClaimInputStyles.groupLabel}>{label}</p>
        </div>

        <div className={SdClaimInputStyles.groupRight}>
            <span className={SdClaimInputStyles.groupBadge}>
                {t("fieldsCount", { count: fieldsCount })}
            </span>
            <img
                src={isExpanded ? ArrowOpen : ArrowBack}
                alt={isExpanded ? t("collapse") : t("expand")}
                className={SdClaimInputStyles.groupChevron}
            />
        </div>
    </button>
    );
};
