import { SelectedSdClaimsMap, WalletCredential } from "../../types/data";
import { VpCredentialOptionCards } from "./Dcql/VpCredentialOptionCards";

interface MatchingCredentialsProps {
    credentials?: WalletCredential[] | null;
    refreshCredentials?: () => void;
    selectedCredentialIds?: string[];
    onCredentialSelect?: (id: string, isSelected: boolean) => void;
    onSdClaimsConfirm?: (credentialId: string, selectedClaimPaths: string[]) => void;
    selectedSdClaimsByCredential?: SelectedSdClaimsMap;
    presentationId?: string;
    redirectUri?: string | null;
    missingClaims?: string[];
}

function MatchingCredentials({
    credentials,
    refreshCredentials,
    selectedCredentialIds = [],
    onCredentialSelect,
    onSdClaimsConfirm,
    selectedSdClaimsByCredential = {},
}: MatchingCredentialsProps) {
    if (!credentials?.length) {
        return null;
    }

    return (
        <div className="my-[20px]" data-testid="matching-credentials-container">
            <VpCredentialOptionCards
                    credentials={credentials ?? []}
                    selectedCredentialIds={selectedCredentialIds}
                    refreshCredentials={refreshCredentials}
                    selectedSdClaimsByCredential={selectedSdClaimsByCredential}
                    onCredentialSelect={(credentialId, isSelected) =>
                        onCredentialSelect?.(credentialId, isSelected)
                    }
                    onSdClaimsConfirm={onSdClaimsConfirm}
            />
        </div>
    );
}

export default MatchingCredentials;
