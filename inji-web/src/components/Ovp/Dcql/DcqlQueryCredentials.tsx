import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectedSdClaimsMap, WalletCredential } from "../../../types/data";
import SDClaimsSelectionModal from "../../../modals/SDClaimsSelectionModal";
import CredentialPreviewModal from "../../../modals/CredentialPreviewModal";
import { DcqlCredentialOptionCard } from "./DcqlCredentialOptionCard";
import { getCredentialActionVariant, isSdJwtCredential } from "./credentialCardUtils";
import { DcqlDesignStyles } from "./dcqlDesignStyles";

interface DcqlQueryCredentialsProps {
    queryId: string;
    credentials: WalletCredential[];
    selectedCredentialIds: string[];
    multiple: boolean;
    deselectionDisabled: boolean;
    optional?: boolean;
    compact?: boolean;
    flatGrid?: boolean;
    refreshCredentials?: () => void;
    selectedSdClaimsByCredential?: SelectedSdClaimsMap;
    onCredentialSelect: (
        queryId: string,
        credentialId: string,
        isSelected: boolean
    ) => void;
    onSdClaimsConfirm?: (credentialId: string, selectedClaimPaths: string[]) => void;
}

export function DcqlQueryCredentials({
    queryId,
    credentials,
    selectedCredentialIds,
    multiple,
    deselectionDisabled,
    optional = false,
    compact = false,
    flatGrid = false,
    selectedSdClaimsByCredential = {},
    onCredentialSelect,
    onSdClaimsConfirm,
}: DcqlQueryCredentialsProps) {
    const { t } = useTranslation("VerifierTrustPage");
    const [previewCredential, setPreviewCredential] =
        useState<WalletCredential | null>(null);
    const [selectedSDJWT, setSelectedSDJWT] = useState<WalletCredential | null>(null);
    const [showSDClaimsModal, setShowSDClaimsModal] = useState(false);
    const [showAll, setShowAll] = useState(false);

    const shouldCollapseExtras =
        multiple && !optional && credentials.length > 1;

    const visibleCredentials =
        !shouldCollapseExtras || showAll
            ? credentials
            : credentials.slice(0, 1);

    const containerClassName = compact
        ? "flex flex-col gap-3"
        : flatGrid
          ? DcqlDesignStyles.gridContents
          : DcqlDesignStyles.credentialCardsGrid;

    const handleCredentialSelect = (credential: WalletCredential) => {
        const isSelected = selectedCredentialIds.includes(credential.credentialId);

        if (
            isSelected &&
            deselectionDisabled &&
            selectedCredentialIds.length === 1
        ) {
            return;
        }

        if (multiple) {
            onCredentialSelect(queryId, credential.credentialId, !isSelected);
            return;
        }

        onCredentialSelect(queryId, credential.credentialId, true);
    };

    const handleActionClick = (credential: WalletCredential) => {
        if (isSdJwtCredential(credential)) {
            // In DCQL mode show the claims modal as read-only (all claims pre-selected).
            setSelectedSDJWT(credential);
            setShowSDClaimsModal(true);
            return;
        }
        setPreviewCredential(credential);
    };

    return (
        <>
            <div
                className={containerClassName}
                data-testid={`dcql-query-credentials-${queryId}`}
            >
                {visibleCredentials.map((credential, index) => {
                    const credentialKey =
                        credential.credentialId || String(index);
                    const isSelected = selectedCredentialIds.includes(
                        credential.credentialId
                    );
                    const actionVariant = getCredentialActionVariant(credential);

                    return (
                        <div
                            key={credentialKey}
                            className={flatGrid ? "min-w-0" : undefined}
                        >
                            <DcqlCredentialOptionCard
                                credential={credential}
                                isSelected={isSelected}
                                onSelect={() => handleCredentialSelect(credential)}
                                actionVariant={actionVariant}
                                onActionClick={() => handleActionClick(credential)}
                                compact={compact}
                                testId={`dcql-credential-${credentialKey}`}
                            />
                        </div>
                    );
                })}

                {shouldCollapseExtras && !showAll && (
                    <div className={DcqlDesignStyles.credentialOptionFullWidth}>
                        <button
                            type="button"
                            className={DcqlDesignStyles.showMoreLink}
                            onClick={() => setShowAll(true)}
                            data-testid={`dcql-query-credentials-${queryId}-show-more`}
                        >
                            {t("dcql.showAllCards", { count: credentials.length })}
                        </button>
                    </div>
                )}
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

            {previewCredential && (
                <CredentialPreviewModal
                    credential={previewCredential}
                    onClose={() => setPreviewCredential(null)}
                />
            )}
        </>
    );
}
