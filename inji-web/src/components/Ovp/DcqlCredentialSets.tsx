import {
    DcqlCredentialSet,
    DcqlCredentialSetSelectionState,
    DcqlQueryGroup,
} from "../../types/dcql";
import { SelectedSdClaimsMap } from "../../types/data";
import {
    isCredentialSetSatisfied,
    updateCredentialSetSelectionForSet,
} from "../../utils/dcqlCredentialSetUtils";
import { CredentialSetSection } from "./CredentialSetSection";
import { RequirementInfoVerifier } from "../../modals/CredentialRequirementInfoModal";
import { CredentialSetSectionHeader } from "./CredentialSetSectionHeader";
import { DcqlDesignStyles } from "./Dcql/dcqlDesignStyles";
import { DcqlInstructionBanner } from "./Dcql/DcqlInstructionBanner";

interface DcqlCredentialSetsProps {
    credentialSets: DcqlCredentialSet[];
    queryGroups: DcqlQueryGroup[];
    selectionState: DcqlCredentialSetSelectionState;
    refreshCredentials?: () => void;
    selectedSdClaimsByCredential?: SelectedSdClaimsMap;
    presentationId?: string;
    redirectUri?: string | null;
    verifier?: RequirementInfoVerifier | null;
    onSelectionStateChange: (
        selectionState: DcqlCredentialSetSelectionState
    ) => void;
    onSdClaimsConfirm?: (credentialId: string, selectedClaimPaths: string[]) => void;
}

function DcqlCredentialSets({
    credentialSets,
    queryGroups,
    selectionState,
    refreshCredentials,
    selectedSdClaimsByCredential,
    presentationId,
    redirectUri,
    verifier,
    onSelectionStateChange,
    onSdClaimsConfirm,
}: DcqlCredentialSetsProps) {
    const requiredSets = credentialSets
        .map((set, index) => ({ set, index }))
        .filter(({ set }) => set.required);
    const optionalSets = credentialSets
        .map((set, index) => ({ set, index }))
        .filter(({ set }) => !set.required);

    const mandatorySectionSatisfied = requiredSets.every(({ set, index }) =>
        isCredentialSetSatisfied(set, index, selectionState, queryGroups)
    );

    const renderSet = (
        credentialSet: DcqlCredentialSet,
        setIndex: number,
        showSectionHeader: boolean,
        embedInParentGrid = false
    ) => (
        <CredentialSetSection
            key={setIndex}
            credentialSet={credentialSet}
            setIndex={setIndex}
            queryGroups={queryGroups}
            optionSelection={selectionState[setIndex] ?? {}}
            showSectionHeader={showSectionHeader}
            embedInParentGrid={embedInParentGrid}
            refreshCredentials={refreshCredentials}
            selectedSdClaimsByCredential={selectedSdClaimsByCredential}
            presentationId={presentationId}
            redirectUri={redirectUri}
            verifier={verifier}
            onOptionSelectionChange={(optionSelection) => {
                onSelectionStateChange(
                    updateCredentialSetSelectionForSet(
                        setIndex,
                        optionSelection,
                        selectionState
                    )
                );
            }}
            onSdClaimsConfirm={onSdClaimsConfirm}
        />
    );

    return (
        <div
            className={DcqlDesignStyles.pageContainer}
            data-testid="dcql-credential-sets"
        >
            {requiredSets.length > 0 && (
                <section
                    className={DcqlDesignStyles.sectionBlock}
                    data-testid="mandatory-credential-sets"
                >
                    <CredentialSetSectionHeader
                        required
                        sectionSatisfied={mandatorySectionSatisfied}
                        testId="mandatory-credential-sets"
                        verifier={verifier}
                    />
                    <DcqlInstructionBanner
                        credentialSets={credentialSets}
                        queryGroups={queryGroups}
                    />
                    <div className={DcqlDesignStyles.credentialCardsGrid}>
                        {requiredSets.map(({ set, index }) =>
                            renderSet(set, index, false, true)
                        )}
                    </div>
                </section>
            )}
            {optionalSets.map(({ set, index }) => renderSet(set, index, true))}
        </div>
    );
}

export default DcqlCredentialSets;
