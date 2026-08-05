import { useNavigate } from "react-router-dom";
import {
    DcqlCredentialSet,
    DcqlOptionSelectionState,
    DcqlQueryGroup,
} from "../../types/dcql";
import { SelectedSdClaimsMap } from "../../types/data";
import { NoMatchingCredentialsModal } from "../../modals/NoMatchingCredentialsModal";
import { ROUTES } from "../../utils/constants";
import {
    formatQueryIdLabel,
    isCredentialDeselectionDisabled,
} from "../../utils/dcqlSelectionUtils";
import {
    getSatisfiableOptions,
    isOptionSelected,
    toggleCredentialSetOption,
    updateCredentialSetVcSelection,
} from "../../utils/dcqlCredentialSetUtils";
import {
    CredentialSetSectionHeader,
} from "./CredentialSetSectionHeader";
import { RequirementInfoVerifier } from "../../modals/CredentialRequirementInfoModal";
import { DcqlDesignStyles } from "./Dcql/dcqlDesignStyles";
import { DcqlQueryCredentials } from "./Dcql/DcqlQueryCredentials";
import { MultipleCardsSection } from "./MultipleCardsSection";

interface CredentialSetSectionProps {
    credentialSet: DcqlCredentialSet;
    setIndex: number;
    queryGroups: DcqlQueryGroup[];
    optionSelection: DcqlOptionSelectionState;
    showSectionHeader?: boolean;
    embedInParentGrid?: boolean;
    refreshCredentials?: () => void;
    selectedSdClaimsByCredential?: SelectedSdClaimsMap;
    presentationId?: string;
    redirectUri?: string | null;
    verifier?: RequirementInfoVerifier | null;
    onOptionSelectionChange: (optionSelection: DcqlOptionSelectionState) => void;
    onSdClaimsConfirm?: (credentialId: string, selectedClaimPaths: string[]) => void;
}

export function CredentialSetSection({
    credentialSet,
    setIndex,
    queryGroups,
    optionSelection,
    showSectionHeader = true,
    embedInParentGrid = false,
    refreshCredentials,
    selectedSdClaimsByCredential,
    presentationId,
    redirectUri,
    verifier,
    onOptionSelectionChange,
    onSdClaimsConfirm,
}: CredentialSetSectionProps) {
    const navigate = useNavigate();
    const testId = `credential-set-${setIndex}`;
    const satisfiableOptions = getSatisfiableOptions(
        credentialSet,
        queryGroups
    );
    const queryGroupMap = new Map(
        queryGroups.map((group) => [group.queryId, group])
    );
    const sectionSatisfied = satisfiableOptions.some((option, optionIndex) =>
        isOptionSelected(option, optionIndex, optionSelection)
    );
    const hasAnySelection = Object.keys(optionSelection).length > 0;

    const handleOptionToggle = (option: string[], optionIndex: number) => {
        const nextSelection = toggleCredentialSetOption(
            credentialSet,
            setIndex,
            option,
            optionIndex,
            { [setIndex]: optionSelection },
            queryGroups
        );
        onOptionSelectionChange(nextSelection[setIndex] ?? {});
    };

    const handleCredentialSelect = (
        optionIndex: number,
        queryId: string,
        credentialId: string,
        isSelected: boolean
    ) => {
        const nextSelection = updateCredentialSetVcSelection(
            setIndex,
            optionIndex,
            queryId,
            credentialId,
            isSelected,
            { [setIndex]: optionSelection },
            queryGroups
        );
        onOptionSelectionChange(nextSelection[setIndex] ?? {});
    };

    const renderQueryCredentials = (
        queryId: string,
        optionIndex: number,
        isMultipleCardsOption: boolean
    ) => {
        const group = queryGroupMap.get(queryId);
        if (!group) {
            return null;
        }

        const selectedCredentialIds =
            optionSelection[optionIndex]?.[queryId] ?? [];

        if (!group.availableCredentials.length) {
            return (
                <NoMatchingCredentialsModal
                    isVisible
                    missingClaims={group.missingClaims}
                    verifier={verifier}
                    onGoToHome={() => navigate(ROUTES.ROOT)}
                    redirectUri={redirectUri ?? null}
                    presentationId={presentationId}
                />
            );
        }

        return (
            <DcqlQueryCredentials
                key={`${optionIndex}-${queryId}`}
                queryId={queryId}
                credentials={group.availableCredentials}
                selectedCredentialIds={selectedCredentialIds}
                multiple={group.multiple}
                deselectionDisabled={isCredentialDeselectionDisabled(group)}
                optional={!credentialSet.required}
                compact={isMultipleCardsOption}
                flatGrid={!isMultipleCardsOption}
                refreshCredentials={refreshCredentials}
                selectedSdClaimsByCredential={selectedSdClaimsByCredential}
                onCredentialSelect={(selectedQueryId, credentialId, selected) =>
                    handleCredentialSelect(
                        optionIndex,
                        selectedQueryId,
                        credentialId,
                        selected
                    )
                }
                onSdClaimsConfirm={onSdClaimsConfirm}
            />
        );
    };

    const renderOptions = () => {
        if (satisfiableOptions.length === 0) {
            return null;
        }

        return satisfiableOptions.map((option, optionIndex) => {
            const isMultipleCardsOption = option.length > 1;
            const optionSelected = isOptionSelected(
                option,
                optionIndex,
                optionSelection
            );

            return (
                <div
                    key={optionIndex}
                    className={
                        isMultipleCardsOption
                            ? DcqlDesignStyles.credentialOptionFullWidth
                            : DcqlDesignStyles.gridContents
                    }
                    data-testid={`${testId}-option-${optionIndex}`}
                >
                    {isMultipleCardsOption ? (
                        <MultipleCardsSection
                            testId={testId}
                            optionIndex={optionIndex}
                            checked={optionSelected}
                            credentialCount={option.length}
                            onToggle={() =>
                                handleOptionToggle(option, optionIndex)
                            }
                        >
                            {option.map((queryId) => (
                                <div
                                    key={`${optionIndex}-${queryId}`}
                                    data-testid={`${testId}-option-${optionIndex}-query-${queryId}`}
                                >
                                    <p className="mb-2 text-sm font-semibold text-[#0F172A]">
                                        {formatQueryIdLabel(queryId)}
                                    </p>
                                    {renderQueryCredentials(
                                        queryId,
                                        optionIndex,
                                        true
                                    )}
                                </div>
                            ))}
                        </MultipleCardsSection>
                    ) : (
                        renderQueryCredentials(
                            option[0],
                            optionIndex,
                            false
                        )
                    )}
                </div>
            );
        });
    };

    const optionsContent = embedInParentGrid ? (
        renderOptions()
    ) : (
        <div className={DcqlDesignStyles.credentialCardsGrid}>
            {renderOptions()}
        </div>
    );

    if (embedInParentGrid) {
        return <>{optionsContent}</>;
    }

    return (
        <section
            className={DcqlDesignStyles.sectionBlock}
            data-testid={testId}
        >
            {showSectionHeader && (
            <CredentialSetSectionHeader
                required={credentialSet.required}
                sectionSatisfied={sectionSatisfied}
                optionalCount={
                    !credentialSet.required
                        ? satisfiableOptions.length
                        : undefined
                }
                showClearAll={!credentialSet.required && hasAnySelection}
                onClearAll={() => onOptionSelectionChange({})}
                testId={testId}
                verifier={verifier}
            />
            )}

            {optionsContent}
        </section>
    );
}