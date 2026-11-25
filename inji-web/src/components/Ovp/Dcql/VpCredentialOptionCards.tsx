import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectedSdClaimsMap, WalletCredential } from "../../../types/data";
import SDClaimsSelectionModal from "../../../modals/SDClaimsSelectionModal";
import CredentialPreviewModal from "../../../modals/CredentialPreviewModal";
import {
    DcqlCredentialOptionCard,
} from "./DcqlCredentialOptionCard";
import { getCredentialActionVariant, isSelectivelyDisclosableCredential } from "./credentialCardUtils";
import { DcqlDesignStyles } from "./dcqlDesignStyles";

interface VpCredentialOptionCardsProps {
    credentials: WalletCredential[];
    selectedCredentialIds: string[];
    refreshCredentials?: () => void;
    selectedSdClaimsByCredential?: SelectedSdClaimsMap;
    optional?: boolean;
    getTestId?: (credential: WalletCredential, index: number) => string;
    onCredentialSelect: (credentialId: string, isSelected: boolean) => void;
    onSdClaimsConfirm?: (credentialId: string, selectedClaimPaths: string[]) => void;
}

export function VpCredentialOptionCards({
    credentials,
    selectedCredentialIds,
    selectedSdClaimsByCredential = {},
    optional = false,
    getTestId,
    onCredentialSelect,
    onSdClaimsConfirm,
}: VpCredentialOptionCardsProps) {
    const { t } = useTranslation("VerifierTrustPage");
    const [showSDClaimsSelectionModal, setShowSDClaimsSelectionModal] =
        useState(false);
    const [previewCredential, setPreviewCredential] =
        useState<WalletCredential | null>(null);
    const [selectedCredential, setSelectedCredential] = useState<WalletCredential | null>(
        null
    );

    const handleCredentialSelect = (credential: WalletCredential) => {
        const isSelected = selectedCredentialIds.includes(credential.credentialId);
        onCredentialSelect(credential.credentialId, !isSelected);
    };

    const handleActionClick = (credential: WalletCredential) => {
        if (isSelectivelyDisclosableCredential(credential)) {
            setSelectedCredential(credential);
            setShowSDClaimsSelectionModal(true);
            return;
        }

        setPreviewCredential(credential);
    };

    return (
        <>
            <div
                className={DcqlDesignStyles.credentialCardsGrid}
                data-testid="matching-credentials-list"
            >
                {credentials.map((credential, index) => {
                    const credentialKey =
                        credential.credentialId || String(index);
                    const isSelected = selectedCredentialIds.includes(
                        credential.credentialId
                    );
                    const testId =
                        getTestId?.(credential, index) ??
                        `matching-credentials-tile-${credentialKey}`;

                    const actionVariant = getCredentialActionVariant(credential);
                    const hasClaimSelection = isSelectivelyDisclosableCredential(credential);

                    return (
                        <DcqlCredentialOptionCard
                            key={credentialKey}
                            credential={credential}
                            isSelected={isSelected}
                            onSelect={() => handleCredentialSelect(credential)}
                            actionVariant={actionVariant}
                            actionLabel={hasClaimSelection ? t("dcql.selectRequiredClaims") : undefined}
                            onActionClick={() => handleActionClick(credential)}
                            testId={testId}
                        />
                    );
                })}
            </div>

            {showSDClaimsSelectionModal && (
                <SDClaimsSelectionModal
                    key={selectedCredential?.credentialId}
                    selectedCredential={selectedCredential}
                    closeModal={setShowSDClaimsSelectionModal}
                    initialSelectedSdClaims={
                        selectedCredential
                            ? selectedSdClaimsByCredential[
                                  selectedCredential.credentialId
                              ]
                            : undefined
                    }
                    onConfirm={(credentialId, selectedClaimPaths) => {
                        onSdClaimsConfirm?.(credentialId, selectedClaimPaths);
                        onCredentialSelect(credentialId, true);
                    }}
                />
            )}

            {previewCredential && (
                <CredentialPreviewModal
                    credential={previewCredential}
                    onClose={() => setPreviewCredential(null)}
                />
            )}
        </>
    );
}
