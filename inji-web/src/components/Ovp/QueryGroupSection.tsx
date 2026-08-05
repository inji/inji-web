import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { DcqlQueryGroup } from "../../types/dcql";
import { SelectedSdClaimsMap } from "../../types/data";
import {
    formatQueryIdLabel,
    isCredentialDeselectionDisabled,
} from "../../utils/dcqlSelectionUtils";
import { DcqlQueryGroupsStyles } from "./OvpPageStyles";
import { QueryGroupCredentialList } from "./QueryGroupCredentialList";

interface QueryGroupSectionProps {
    group: DcqlQueryGroup;
    selectedCredentialIds: string[];
    defaultExpanded?: boolean;
    refreshCredentials?: () => void;
    selectedSdClaimsByCredential?: SelectedSdClaimsMap;
    onCredentialSelect: (
        queryId: string,
        credentialId: string,
        isSelected: boolean
    ) => void;
    onSdClaimsConfirm?: (credentialId: string, selectedClaimPaths: string[]) => void;
}

export function QueryGroupSection({
    group,
    selectedCredentialIds,
    defaultExpanded = true,
    refreshCredentials,
    selectedSdClaimsByCredential,
    onCredentialSelect,
    onSdClaimsConfirm,
}: QueryGroupSectionProps) {
    const { t } = useTranslation("VerifierTrustPage");
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const sectionTitle = formatQueryIdLabel(group.queryId);
    const sectionLabel = group.required
        ? t("dcql.mandatorySection")
        : t("dcql.optionalSection");
    const hasCredentials = group.availableCredentials.length > 0;

    return (
        <section
            className={DcqlQueryGroupsStyles.sectionContainer}
            data-testid={`query-group-section-${group.queryId}`}
        >
            <button
                type="button"
                className={DcqlQueryGroupsStyles.sectionHeader}
                onClick={() => {
                    if (!group.required) {
                        setIsExpanded((prev) => !prev);
                    }
                }}
                data-testid={`query-group-header-${group.queryId}`}
            >
                <div className="flex flex-col items-start text-left">
                    <span className={DcqlQueryGroupsStyles.sectionBadge}>
                        {sectionLabel}
                    </span>
                    <h2 className={DcqlQueryGroupsStyles.sectionTitle}>
                        {sectionTitle}
                    </h2>
                </div>
                {!group.required && (
                    <span className="ml-2">
                        {isExpanded ? (
                            <IoIosArrowUp size={18} color="#04051D" />
                        ) : (
                            <IoIosArrowDown size={18} color="#04051D" />
                        )}
                    </span>
                )}
            </button>

            {(group.required || isExpanded) && (
                <div className={DcqlQueryGroupsStyles.sectionBody}>
                    {hasCredentials && (
                        <QueryGroupCredentialList
                            queryId={group.queryId}
                            credentials={group.availableCredentials}
                            selectedCredentialIds={selectedCredentialIds}
                            multiple={group.multiple}
                            deselectionDisabled={isCredentialDeselectionDisabled(
                                group
                            )}
                            refreshCredentials={refreshCredentials}
                            selectedSdClaimsByCredential={
                                selectedSdClaimsByCredential
                            }
                            onCredentialSelect={onCredentialSelect}
                            onSdClaimsConfirm={onSdClaimsConfirm}
                        />
                    )}
                </div>
            )}
        </section>
    );
}
