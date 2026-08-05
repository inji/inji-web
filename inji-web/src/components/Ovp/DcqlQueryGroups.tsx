import { useNavigate } from "react-router-dom";
import { DcqlQueryGroup, DcqlSelectionState } from "../../types/dcql";
import { SelectedSdClaimsMap } from "../../types/data";
import { DcqlQueryGroupsStyles } from "./OvpPageStyles";
import { QueryGroupSection } from "./QueryGroupSection";
import { RequirementInfoVerifier } from "../../modals/CredentialRequirementInfoModal";
import { NoMatchingCredentialsModal } from "../../modals/NoMatchingCredentialsModal";
import { ROUTES } from "../../utils/constants";

interface DcqlQueryGroupsProps {
    queryGroups: DcqlQueryGroup[];
    selection: DcqlSelectionState;
    refreshCredentials?: () => void;
    selectedSdClaimsByCredential?: SelectedSdClaimsMap;
    presentationId?: string;
    redirectUri?: string | null;
    verifier?: RequirementInfoVerifier | null;
    onCredentialSelect: (
        queryId: string,
        credentialId: string,
        isSelected: boolean
    ) => void;
    onSdClaimsConfirm?: (credentialId: string, selectedClaimPaths: string[]) => void;
}

function DcqlQueryGroups({
    queryGroups,
    selection,
    refreshCredentials,
    selectedSdClaimsByCredential,
    presentationId,
    redirectUri,
    verifier,
    onCredentialSelect,
    onSdClaimsConfirm,
}: DcqlQueryGroupsProps) {
    const navigate = useNavigate();
    const mandatoryGroups = queryGroups.filter((group) => group.required);
    const optionalGroups = queryGroups.filter((group) => !group.required);

    // Only block when a mandatory query cannot be satisfied. Empty optional
    // groups alone must not prevent sharing credentials that still satisfy the request.
    const firstNoMatchGroup =
        mandatoryGroups.find((g) => g.availableCredentials.length === 0) ??
        null;

    return (
        <>
            <div
                className={DcqlQueryGroupsStyles.mainContainer}
                data-testid="dcql-query-groups"
            >
                {mandatoryGroups.map((group) => (
                    <QueryGroupSection
                        key={group.queryId}
                        group={group}
                        selectedCredentialIds={selection[group.queryId] ?? []}
                        defaultExpanded
                        refreshCredentials={refreshCredentials}
                        selectedSdClaimsByCredential={selectedSdClaimsByCredential}
                        onCredentialSelect={onCredentialSelect}
                        onSdClaimsConfirm={onSdClaimsConfirm}
                    />
                ))}
                {optionalGroups.map((group) => (
                    <QueryGroupSection
                        key={group.queryId}
                        group={group}
                        selectedCredentialIds={selection[group.queryId] ?? []}
                        defaultExpanded={false}
                        refreshCredentials={refreshCredentials}
                        selectedSdClaimsByCredential={selectedSdClaimsByCredential}
                        onCredentialSelect={onCredentialSelect}
                        onSdClaimsConfirm={onSdClaimsConfirm}
                    />
                ))}
            </div>

            {firstNoMatchGroup && (
                <NoMatchingCredentialsModal
                    isVisible
                    missingClaims={firstNoMatchGroup.missingClaims}
                    verifier={verifier}
                    onGoToHome={() => navigate(ROUTES.ROOT)}
                    redirectUri={redirectUri ?? null}
                    presentationId={presentationId}
                />
            )}
        </>
    );
}

export default DcqlQueryGroups;
