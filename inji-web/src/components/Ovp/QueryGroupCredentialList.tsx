import { useState } from "react";
import { VCCardView } from "../VC/VCCardView";
import { useTranslation } from "react-i18next";
import { SelectedSdClaimsMap, WalletCredential } from "../../types/data";
import { MatchingCredentialsStyles } from "./OvpPageStyles";
import checkCircle from "../../assets/checkCircleTwo.svg";
import { isSdJwtCredential } from "./Dcql/credentialCardUtils";
import SDClaimsSelectionModal from "../../modals/SDClaimsSelectionModal";

interface QueryGroupCredentialListProps {
    queryId: string;
    credentials: WalletCredential[];
    selectedCredentialIds: string[];
    multiple: boolean;
    deselectionDisabled: boolean;
    refreshCredentials?: () => void;
    selectedSdClaimsByCredential?: SelectedSdClaimsMap;
    onCredentialSelect: (
        queryId: string,
        credentialId: string,
        isSelected: boolean
    ) => void;
    onSdClaimsConfirm?: (credentialId: string, selectedClaimPaths: string[]) => void;
}

export function QueryGroupCredentialList({
    queryId,
    credentials,
    selectedCredentialIds,
    multiple,
    deselectionDisabled,
    refreshCredentials,
    selectedSdClaimsByCredential = {},
    onCredentialSelect,
    onSdClaimsConfirm,
}: QueryGroupCredentialListProps) {
    const { t } = useTranslation("VerifierTrustPage");
    const [showSDClaimsModal, setShowSDClaimsModal] = useState(false);
    const [selectedSDJWT, setSelectedSDJWT] = useState<WalletCredential | null>(null);

    const handleCredentialSelect = (credential: WalletCredential) => {
        const isSelected = selectedCredentialIds.includes(credential.credentialId);

        if (
            isSelected &&
            deselectionDisabled &&
            selectedCredentialIds.length === 1
        ) {
            return;
        }

        // Select the credential first, then open the read-only claims modal for SD-JWT.
        if (multiple) {
            onCredentialSelect(queryId, credential.credentialId, !isSelected);
        } else {
            onCredentialSelect(queryId, credential.credentialId, true);
        }

        if (isSdJwtCredential(credential)) {
            setSelectedSDJWT(credential);
            setShowSDClaimsModal(true);
        }
    };

    return (
        <>
            <div
                className={MatchingCredentialsStyles.mainContainer}
                data-testid={`query-group-credentials-${queryId}`}
            >
                {credentials.map((credential, index) => {
                    const credentialKey = credential.credentialId || String(index);
                    const isSelected = selectedCredentialIds.includes(
                        credential.credentialId
                    );
                    const controlClassName = isSelected
                        ? MatchingCredentialsStyles.credentialCheckbox
                        : MatchingCredentialsStyles.credentialEmptyCheckbox;

                    return (
                        <div
                            key={credentialKey}
                            data-testid={`query-group-credential-tile-${credentialKey}`}
                            className={`${MatchingCredentialsStyles.outerCredentialTile} ${
                                isSelected
                                    ? MatchingCredentialsStyles.outerCredentialTileSelected
                                    : MatchingCredentialsStyles.outerCredentialTileUnselected
                            }`}
                        >
                            <button
                                type="button"
                                data-testid={`query-group-credential-header-${credentialKey}`}
                                className={`w-full ${MatchingCredentialsStyles.innerCredentialTile}`}
                                onClick={() => handleCredentialSelect(credential)}
                            >
                                {isSelected ? (
                                    <>
                                        <div className={controlClassName}>
                                            <img
                                                data-testid={`query-group-credential-selected-icon-${credentialKey}`}
                                                src={checkCircle}
                                                alt="success"
                                                className={MatchingCredentialsStyles.checkIconSize}
                                            />
                                        </div>
                                        <span className={MatchingCredentialsStyles.selectedTileLabel}>
                                            {t("credentialTile.selectedTitle")}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <div className={controlClassName} />
                                        <span className={MatchingCredentialsStyles.unselectedTileLabel}>
                                            {t("credentialTile.unselectedTitle")}
                                        </span>
                                    </>
                                )}
                            </button>
                            <div className={MatchingCredentialsStyles.vcViewCard}>
                                <VCCardView
                                    credential={credential}
                                    refreshCredentials={
                                        refreshCredentials || (() => {})
                                    }
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            {showSDClaimsModal && (
                <SDClaimsSelectionModal
                    key={selectedSDJWT?.credentialId}
                    seletedSDJWT={selectedSDJWT}
                    closeModal={setShowSDClaimsModal}
                    readOnly={true}
                    initialSelectedSdClaims={
                        selectedSDJWT
                            ? selectedSdClaimsByCredential[selectedSDJWT.credentialId]
                            : undefined
                    }
                    onConfirm={() => {}}
                />
            )}
        </>
    );
}
