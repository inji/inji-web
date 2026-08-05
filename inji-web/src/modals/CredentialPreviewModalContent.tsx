import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { getDirCurrentLanguage } from "../utils/i18n";
import { ModalStyles } from "./ModalStyles";
import { WalletCredential } from "../types/data";
import { RootState } from "../types/redux";
import { CloseIconButton } from "../components/Common/Buttons/CloseIconButton";
import { PDFViewer } from "../components/Preview/PDFViewer";
import { SpinningLoader } from "../components/Common/SpinningLoader";
import { useApi } from "../hooks/useApi";
import { api } from "../utils/api";

export interface CredentialPreviewModalContentProps {
    credential: WalletCredential | null;
    onClose: () => void;
}

export function CredentialPreviewModalContent({
    credential,
    onClose,
}: CredentialPreviewModalContentProps) {
    const { t, i18n } = useTranslation("SDClaimsSelectionModal");
    const dir = getDirCurrentLanguage(i18n.language);
    const language = useSelector((state: RootState) => state.common.language);
    const previewApi = useApi<Blob>();
    const styles = ModalStyles.credentialPreviewModal;

    const [previewContent, setPreviewContent] = useState<Blob | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    useEffect(() => {
        if (!credential?.credentialId) {
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
                        credential.credentialId
                    ),
                    headers: api.fetchWalletCredentialPreview.headers(language),
                    apiConfig: api.fetchWalletCredentialPreview,
                });

                if (!cancelled && response.ok()) {
                    setPreviewContent(response.data);
                }
            } catch {
                // Fetch failure — previewContent stays null
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
    }, [credential?.credentialId, language]);

    const handleClose = () => {
        setPreviewContent(null);
        onClose();
    };

    const renderPreview = () => {
        if (isPreviewLoading) {
            return (
                <div
                    className={styles.previewLoading}
                    data-testid="credential-preview-loading"
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

    return (
        <div
            className={styles.content}
            dir={dir}
            data-testid="credential-preview-modal"
        >
            <div className={styles.headerRow}>
                <div className="min-w-0 flex-1 text-start">
                    <h1 className={styles.title}>
                        {credential?.credentialTypeDisplayName}
                    </h1>
                </div>
                <CloseIconButton
                    onClick={handleClose}
                    btnClassName={styles.closeButton}
                    iconClassName="h-4 w-4"
                    btnTestId="btn-close-credential-preview-modal"
                />
            </div>

            <section
                className={styles.previewPanel}
                data-testid="credential-preview-panel"
                aria-label={t("credentialPreview")}
            >
                <div className={styles.previewScrollArea}>
                    {renderPreview()}
                </div>
            </section>
        </div>
    );
}
