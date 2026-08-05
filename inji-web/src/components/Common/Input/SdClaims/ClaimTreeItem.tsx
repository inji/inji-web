import React from "react";
import { ClaimNode } from "../../../../utils/sdClaimsTree";
import { ClaimGroupRow } from "./ClaimGroupRow";
import { ClaimLeafRow } from "./ClaimLeafRow";
import { SdClaimInputStyles } from "./SdClaimInputStyles";

const groupHasSelectableSdClaims = (node: ClaimNode): boolean => {
    if (node.kind === "leaf") {
        return node.claimType === "sdClaim";
    }
    return node.children.some(groupHasSelectableSdClaims);
};

const groupHasSelectedSdClaims = (node: ClaimNode, selected: Set<string>): boolean => {
    if (node.kind === "leaf") {
        return node.claimType === "sdClaim" && selected.has(node.path);
    }
    return node.children.some((child) => groupHasSelectedSdClaims(child, selected));
};

const getLeafCount = (node: ClaimNode): number => {
    if (node.kind === "leaf") {
        return 1;
    }
    return node.children.reduce((acc, child) => acc + getLeafCount(child), 0);
};

interface ClaimTreeItemProps {
    node: ClaimNode;
    depth?: number;
    expandedGroups: Set<string>;
    selectedSdClaims: Set<string>;
    groupPathPrefix: string;
    onToggleGroup: (groupKey: string) => void;
    onToggleSdClaim: (path: string) => void;
}

export const ClaimTreeItem: React.FC<ClaimTreeItemProps> = ({
    node,
    depth = 0,
    expandedGroups,
    selectedSdClaims,
    groupPathPrefix,
    onToggleGroup,
    onToggleSdClaim,
}) => {
    if (node.kind === "leaf") {
        const isSelected =
            node.claimType === "claim" || selectedSdClaims.has(node.path);

        return (
            <ClaimLeafRow
                node={node}
                depth={depth}
                isSelected={isSelected}
                onToggle={
                    node.claimType === "sdClaim"
                        ? () => onToggleSdClaim(node.path)
                        : undefined
                }
            />
        );
    }

    const groupKey = groupPathPrefix ? `${groupPathPrefix}.${node.key}` : node.key;
    const isExpanded = expandedGroups.has(groupKey);
    const hasSelectable = groupHasSelectableSdClaims(node);
    const hasSelected = hasSelectable && groupHasSelectedSdClaims(node, selectedSdClaims);
    const fieldsCount = getLeafCount(node);

    return (
        <div className="mt-3" style={{ marginInlineStart: depth > 0 ? depth * 16 : 0 }}>
            <div
                className={`${SdClaimInputStyles.groupContainer} ${
                    isExpanded
                        ? SdClaimInputStyles.groupContainerExpanded
                        : SdClaimInputStyles.groupContainerCollapsed
                }`}
            >
                <ClaimGroupRow
                    label={node.label}
                    groupKey={groupKey}
                    isExpanded={isExpanded}
                    fieldsCount={fieldsCount}
                    selectionState={
                        !hasSelectable
                            ? "noSelectable"
                            : hasSelected
                              ? "hasSelectableSomeSelected"
                              : "hasSelectableNoneSelected"
                    }
                    onToggle={() => onToggleGroup(groupKey)}
                />
                <div
                    className={`${SdClaimInputStyles.childrenWrapper} ${
                        isExpanded
                            ? SdClaimInputStyles.childrenWrapperExpanded
                            : SdClaimInputStyles.childrenWrapperCollapsed
                    }`}
                >
                    <div className={SdClaimInputStyles.childrenInner}>
                        <div
                            className={`${SdClaimInputStyles.childrenContainer} ${
                                isExpanded ? "opacity-100 bg-[#F9FAFB]" : "opacity-0"
                            }`}
                        >
                            {node.children.map((child) => (
                                <ClaimTreeItem
                                    key={
                                        child.kind === "group"
                                            ? `${groupKey}.${child.key}`
                                            : child.path
                                    }
                                    node={child}
                                    depth={depth + 1}
                                    expandedGroups={expandedGroups}
                                    selectedSdClaims={selectedSdClaims}
                                    groupPathPrefix={groupKey}
                                    onToggleGroup={onToggleGroup}
                                    onToggleSdClaim={onToggleSdClaim}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
