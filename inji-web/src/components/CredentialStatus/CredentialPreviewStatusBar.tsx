import React from "react";
import {useTranslation} from "react-i18next";
import {RiDeleteBin6Line} from "react-icons/ri";
import {CredentialStatusCheck} from "../../types/data";
import {formatPreviewLastChecked} from "../../utils/dateUtils";
import {resolveCredentialStatus} from "../../utils/credentialStatus";
import {DownloadIcon} from "../Common/Icons/DownloadIcon";
import {VCStyles} from "../VC/VCStyles";
import {CredentialStatusIcon} from "./CredentialStatusIcon";
import {CredentialStatusLoading} from "./CredentialStatusLoading";
import {StatusInformationControl} from "./StatusInformationControl";

export function CredentialPreviewStatusBar(props: Readonly<{
    statusChecks?: CredentialStatusCheck[] | null;
    lastCheckedAt?: string | null;
    isExpired?: boolean | null;
    onDownload: () => void;
    onCheckStatus: () => void;
    onDelete?: () => void;
    checkingStatus?: boolean;
    children: React.ReactNode;
}>) {
    const {t, i18n} = useTranslation("StoredCards", {keyPrefix: "cardView"});
    const status = resolveCredentialStatus(props.statusChecks, props.isExpired, props.lastCheckedAt);
    const lastChecked = props.lastCheckedAt
        ? formatPreviewLastChecked(props.lastCheckedAt, i18n.language)
        : "";

    const keepPreviewOpen = (event: React.SyntheticEvent) => {
        event.stopPropagation();
    };

    const renderActionButtons = () => (
        <>
            <button
                type="button"
                className={VCStyles.cardView.previewActionButton}
                data-testid="btn-preview-download"
                onClick={(event) => {
                    keepPreviewOpen(event);
                    props.onDownload();
                }}
            >
                <DownloadIcon gradient testId="icon-preview-download"/>
                <span className={VCStyles.cardView.previewActionLabel}>{t("download")}</span>
            </button>
            <button
                type="button"
                className={VCStyles.cardView.previewActionButton}
                data-testid="btn-preview-check-status"
                onClick={(event) => {
                    keepPreviewOpen(event);
                    props.onCheckStatus();
                }}
            >
                <GradientReloadIcon/>
                <span className={VCStyles.cardView.previewActionLabel}>{t("status.check")}</span>
            </button>
        </>
    );

    const renderDeleteButton = () => {
        if (!props.onDelete) {
            return null;
        }
        return (
            <button
                type="button"
                className={VCStyles.cardView.previewDeleteButton}
                data-testid="btn-preview-delete"
                onClick={(event) => {
                    keepPreviewOpen(event);
                    props.onDelete?.();
                }}
            >
                <RiDeleteBin6Line size={16} aria-hidden="true"/>
                <span>{t("menu.delete")}</span>
            </button>
        );
    };

    return (
        <div
            className={VCStyles.cardView.previewLayout}
            data-testid="credential-preview-status"
            aria-busy={props.checkingStatus || undefined}
            onClick={keepPreviewOpen}
        >
            <div className={VCStyles.cardView.previewStatusHeader}>
                <div className="min-w-0 flex-1">
                    <div className={VCStyles.cardView.previewStatusLine} role="status">
                        {props.checkingStatus ? (
                            <CredentialStatusLoading testId="credential-preview-status-loader"/>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                {status && (
                                    <>
                                        <p className={VCStyles.cardView.previewStatusPrefix}>{t("status.label")}</p>
                                        <CredentialStatusIcon status={status} testId="credential-preview-status-icon"/>
                                        <p
                                            className={VCStyles.cardView.statusInfoTitle}
                                            data-testid="credential-preview-status-label"
                                        >
                                            {t(`status.${status}`)}
                                        </p>
                                        <StatusInformationControl testId="credential-preview-status-info"/>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    {lastChecked && (
                        <p
                            className={VCStyles.cardView.previewLastChecked}
                            data-testid="credential-preview-last-checked"
                        >
                            <span className="block">{t("status.lastCheckedLabel")}</span>
                            <span>{lastChecked}</span>
                        </p>
                    )}
                </div>
                <div className={VCStyles.cardView.previewHeaderActions}>
                    {props.onDelete && (
                        <div className={VCStyles.cardView.previewDeleteMobile}>
                            {renderDeleteButton()}
                        </div>
                    )}
                    <div className={VCStyles.cardView.previewActionsDesktop}>
                        {renderActionButtons()}
                    </div>
                </div>
            </div>

            <section
                className={VCStyles.cardView.previewPanel}
                data-testid="credential-preview-panel"
            >
                <div className={VCStyles.cardView.previewScrollArea}>
                    {props.children}
                </div>
            </section>

            <div className={VCStyles.cardView.previewActionsMobile}>
                {renderActionButtons()}
            </div>
            {props.onDelete && (
                <div className={VCStyles.cardView.previewDeleteDesktop}>
                    {renderDeleteButton()}
                </div>
            )}
        </div>
    );
}

function GradientReloadIcon() {
    const gradientId = React.useId().replace(/:/g, "");
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d={`M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8`}
                stroke={`url(#${gradientId})`}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M3 3v5h5"
                stroke={`url(#${gradientId})`}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"
                stroke={`url(#${gradientId})`}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M21 21v-5h-5"
                stroke={`url(#${gradientId})`}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <defs>
                <linearGradient id={gradientId} x1="3" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF5300"/>
                    <stop offset="0.46" stopColor="#DE4322"/>
                    <stop offset="1" stopColor="#5B03AD"/>
                </linearGradient>
            </defs>
        </svg>
    );
}
