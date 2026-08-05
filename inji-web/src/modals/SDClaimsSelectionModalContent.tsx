import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { getDirCurrentLanguage } from "../utils/i18n";
import { ModalStyles } from "./ModalStyles";
import { WalletCredential } from "../types/data";
import { RootState } from "../types/redux";
import { SolidButton } from "../components/Common/Buttons/SolidButton";
import { CloseIconButton } from "../components/Common/Buttons/CloseIconButton";
import { ClaimLeafRow } from "../components/Common/Input/SdClaims/ClaimLeafRow";
import { PDFViewer } from "../components/Preview/PDFViewer";
import { SpinningLoader } from "../components/Common/SpinningLoader";
import { useApi } from "../hooks/useApi";
import { api } from "../utils/api";
import {
    buildClaimTree,
    collectClaimLeaves,
    collectSdClaimPaths,
    ClaimLeaf,
} from "../utils/sdClaimsTree";

export interface SDClaimsSelectionModalContentProps {
    seletedSDJWT: WalletCredential | null;
    closeModal: (isOpen: boolean) => void;
    onConfirm: (credentialId: string, selectedClaimPaths: string[]) => void;
    initialSelectedSdClaims?: string[];
    readOnly?: boolean;
}

export function SDClaimsSelectionModalContent({
    seletedSDJWT,
    closeModal,
    onConfirm,
    initialSelectedSdClaims = [],
    readOnly = false,
}: SDClaimsSelectionModalContentProps) {
    const { t, i18n } = useTranslation("SDClaimsSelectionModal");
    const dir = getDirCurrentLanguage(i18n.language);
    const language = useSelector((state: RootState) => state.common.language);
    const previewApi = useApi<Blob>();
    const styles = ModalStyles.sdClaimsSelectionModal;

    const claims = seletedSDJWT?.claims ?? [];
    const sdClaims = seletedSDJWT?.sdClaims ?? [];
    const claimTree = useMemo(
        () => buildClaimTree(claims, sdClaims),
        [claims, sdClaims]
    );
    const allSdClaimPaths = useMemo(
        () => collectSdClaimPaths(claimTree),
        [claimTree]
    );
    const allLeaves = useMemo(() => collectClaimLeaves(claimTree), [claimTree]);
    const disclosableLeaves = useMemo(
        () => allLeaves.filter((leaf) => leaf.claimType === "sdClaim"),
        [allLeaves]
    );
    const defaultShareableLeaves = useMemo(
        () => allLeaves.filter((leaf) => leaf.claimType === "claim"),
        [allLeaves]
    );

    const [selectedSdClaims, setSelectedSdClaims] = useState<Set<string>>(
        () => new Set(readOnly ? allSdClaimPaths : initialSelectedSdClaims)
    );
    const [previewContent, setPreviewContent] = useState<Blob | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    useEffect(() => {
        if (!seletedSDJWT?.credentialId) {
            setPreviewContent(null);
            return;
        }

        let cancelled = false;

        const loadPreview = async () => {
            setIsPreviewLoading(true);
            setPreviewContent(null);

            try {
                const response = await previewApi.fetchData({
                    url: api.fetchWalletCredentialPreview.url(
                        seletedSDJWT.credentialId
                    ),
                    headers: api.fetchWalletCredentialPreview.headers(language),
                    apiConfig: api.fetchWalletCredentialPreview,
                });

                if (!cancelled && response.ok()) {
                    setPreviewContent(response.data);
                }
            } finally {
                if (!cancelled) {
                    setIsPreviewLoading(false);
                }
            }
        };

        void loadPreview();

        return () => {
            cancelled = true;
        };
    }, [language, seletedSDJWT?.credentialId]);

    const allDisclosableSelected =
        disclosableLeaves.length > 0 &&
        disclosableLeaves.every((leaf) => selectedSdClaims.has(leaf.path));

    const resetSelectionState = () => {
        setSelectedSdClaims(new Set());
        setPreviewContent(null);
    };

    const handleClose = () => {
        resetSelectionState();
        closeModal(false);
    };

    const toggleSdClaim = (path: string) => {
        setSelectedSdClaims((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    const handleCheckAll = () => {
        if (allDisclosableSelected) {
            setSelectedSdClaims(new Set());
            return;
        }
        setSelectedSdClaims(new Set(allSdClaimPaths));
    };

    const handleConfirm = () => {
        if (!seletedSDJWT) {
            return;
        }
        if (!readOnly) {
            onConfirm(seletedSDJWT.credentialId, Array.from(selectedSdClaims));
        }
        closeModal(false);
    };

    const renderPreviewPanel = () => {
        if (isPreviewLoading) {
            return (
                <div
                    className={styles.previewLoading}
                    data-testid="sd-claims-preview-loading"
                >
                    <SpinningLoader />
                </div>
            );
        }

        if (previewContent) {
            return <PDFViewer previewContent={previewContent} />;
        }

        return null;
    };

    const renderClaimLeaf = (leaf: ClaimLeaf, isSelected: boolean, onToggle?: () => void) => (
        <ClaimLeafRow
            key={leaf.path}
            node={leaf}
            variant="modal"
            isSelected={isSelected}
            onToggle={onToggle}
        />
    );

    return (
        <div
            className={styles.content}
            dir={dir}
            data-testid="sd-claims-modal-content"
        >
            <div className={styles.headerRow}>
                <div className="min-w-0 flex-1 text-start">
                    <h1 className={styles.title}>
                        {seletedSDJWT?.credentialTypeDisplayName}
                    </h1>
                    <p className={styles.subtitle}>
                        {readOnly ? t("subtitleReadOnly") : t("subtitle")}
                    </p>
                </div>
                <CloseIconButton
                    onClick={handleClose}
                    btnClassName={styles.closeButton}
                    iconClassName="h-4 w-4"
                    btnTestId="btn-close-sd-claims-modal"
                />
            </div>

            <div className={styles.splitContainer}>
                <section
                    className={styles.previewPanel}
                    data-testid="sd-claims-preview-panel"
                    aria-label={t("credentialPreview")}
                >
                    <div className={styles.previewScrollArea}>
                        {renderPreviewPanel()}
                    </div>
                </section>

                <section
                    className={styles.claimsPanel}
                    data-testid="sd-claims-details-panel"
                    aria-label={t("shareableFields")}
                >
                    <div className={styles.claimsScrollArea}>
                        {disclosableLeaves.length > 0 && (
                            <div className={styles.fieldsSection}>
                                <div className={styles.sectionHeader}>
                                    <span className={styles.sectionTitle}>
                                        {t("disclosableFields")}
                                    </span>
                                    {!readOnly && (
                                        <button
                                            type="button"
                                            data-testid="checkAllClaims"
                                            className={styles.checkAllButton}
                                            onClick={handleCheckAll}
                                        >
                                            {allDisclosableSelected
                                                ? t("clearAll")
                                                : t("checkAll")}
                                        </button>
                                    )}
                                </div>
                                <div className={styles.fieldsSectionCard}>
                                    {disclosableLeaves.map((leaf) =>
                                        renderClaimLeaf(
                                            leaf,
                                            selectedSdClaims.has(leaf.path),
                                            readOnly
                                                ? undefined
                                                : () => toggleSdClaim(leaf.path)
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {defaultShareableLeaves.length > 0 && (
                            <div className={styles.fieldsSection}>
                                <div className={styles.sectionHeader}>
                                    <span className={styles.sectionTitle}>
                                        {t("defaultShareable")}
                                    </span>
                                </div>
                                <div
                                    className={styles.defaultShareableSectionCard}
                                >
                                    {defaultShareableLeaves.map((leaf) =>
                                        renderClaimLeaf(leaf, true)
                                    )}
                                </div>
                                <p className={styles.defaultShareableNote}>
                                    {t("defaultShareableNote")}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className={styles.footerRow}>
                        <SolidButton
                            testId="show-consent-modal-button"
                            onClick={handleConfirm}
                            title={readOnly ? t("done") : t("confirmProceed")}
                            className={styles.confirmButton}
                            fullWidth
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}
