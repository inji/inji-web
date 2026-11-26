import {ApiRequest, ApiResult, CredentialStatusResponse, WalletCredential} from "../../types/data";
import {VCStyles} from "./VCStyles";
import React, {useEffect, useRef, useState} from "react";
import {Clickable} from "../Common/Clickable";
import {api} from "../../utils/api";
import {downloadCredentialPDF} from "../../utils/misc";
import {useSelector} from "react-redux";
import {RootState} from "../../types/redux";
import {EllipsisMenu} from "../Common/Menu/EllipsisMenu";
import {ConfirmationModal} from "../../modals/ConfirmationModal";
import {useTranslation} from "react-i18next";
import {VCDetailView} from "./VCDetailView";
import {DownloadIcon} from "../Common/Icons/DownloadIcon";
import {RiDeleteBin6Line} from "react-icons/ri";
import {BsBoxArrowRight} from "react-icons/bs";
import {IoReloadOutline} from "react-icons/io5";
import {showToast} from "../Common/toast/ToastWrapper";
import {useApi} from "../../hooks/useApi";
import { useLocation } from "react-router-dom";
import { Pages } from "../../utils/constants";
import {CredentialStatusBadge} from "../CredentialStatus/CredentialStatusBadge";
import {hasCredentialStatus} from "../../utils/credentialStatus";
import {useCredentialCardActions} from "./CredentialCardActionsLock";

export function VCCardView(props: Readonly<{
    credential: WalletCredential,
    refreshCredentials: () => void,
    onStatusUpdated?: (credentialId: string, status: CredentialStatusResponse) => void
}>) {
    const language = useSelector((state: RootState) => state.common.language);
    const [error, setError] = useState<string>()
    const [previewContent, setPreviewContent] = useState<Blob>();
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [isCheckingStatus, setIsCheckingStatus] = useState(false)
    const [isActionPending, setIsActionPending] = useState(false)
    const [statusOverride, setStatusOverride] = useState<Pick<WalletCredential, "statusChecks" | "lastCheckedAt" | "isExpired"> | null>(null)
    const isPreviewOpenRef = useRef(false);
    const previewRequestIdRef = useRef(0);
    const {t} = useTranslation('StoredCards', {
        keyPrefix: "cardView"
    })
    const previewApi = useApi()
    const downloadApi = useApi()
    const deleteApi = useApi()
    const statusApi = useApi<CredentialStatusResponse>()
    const location = useLocation();
    const isOvpFlow = location.pathname.includes(Pages.AUTHORIZE);
    const cardActions = useCredentialCardActions();
    
    useEffect(() => {
        setStatusOverride(null);
    }, [props.credential]);

    useEffect(() => {
        if (error) {
            const errorTestId = error === "downloadError"
                ? "download-failure"
                : error === "statusError"
                    ? "status-failure"
                    : "delete-failure";
            showToast({
                type: "error",
                message: t(`error.${error}`),
                testId: errorTestId
            })
            setError("")
        }
    }, [error, t])

    const executeCredentialApiRequest = async (
        apiConfig: ApiRequest,
        onSuccess: (response: ApiResult<any>) => Promise<void>,
        apiInstance: ReturnType<typeof useApi>,
        errorType: string = "downloadError",
        isCurrent: () => boolean = () => true
    ) => {
        try {
            const response = await apiInstance.fetchData({
                url: apiConfig.url(props.credential.credentialId),
                headers: apiConfig.headers(language),
                apiConfig: apiConfig,
            })

            if (!isCurrent()) {
                return;
            }

            if (!response.ok()) {
                console.error(`Failed to fetch request, got ${errorType} with response - `, response);
                setError(errorType);
                return;
            }

            await onSuccess(response);
        } catch (error) {
            if (!isCurrent()) {
                return;
            }
            console.error("API request failed:", error);
            setError(errorType);
        }
    };

    const isCurrentPreviewRequest = (requestId: number) =>
        requestId === previewRequestIdRef.current && isPreviewOpenRef.current;

    const preview = async () => {
        const requestId = ++previewRequestIdRef.current;
        isPreviewOpenRef.current = true;

        await executeCredentialApiRequest(
            api.fetchWalletCredentialPreview,
            async (response) => {
                if (!isCurrentPreviewRequest(requestId)) {
                    return;
                }
                setPreviewContent(response.data);
            },
            previewApi,
            "downloadError",
            () => isCurrentPreviewRequest(requestId)
        );
    };

    useEffect(() => {
        if (!isPreviewOpenRef.current) {
            return;
        }
        void preview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);

    const actionsDisabled = isActionPending || isCheckingStatus || (cardActions?.locked ?? false);

    const runExclusiveAction = async (setBusy: (busy: boolean) => void, action: () => Promise<void>) => {
        if (isActionPending || isCheckingStatus) {
            return;
        }
        const acquired = cardActions ? cardActions.tryAcquire() : true;
        if (!acquired) {
            return;
        }
        setBusy(true);
        try {
            await action();
        } finally {
            setBusy(false);
            cardActions?.release();
        }
    };

    const runMenuAction = (action: () => Promise<void>) => runExclusiveAction(setIsActionPending, action);

    const handleDownload = async (event: React.MouseEvent) => {
        event.stopPropagation();
        if (actionsDisabled) {
            return;
        }
        await runMenuAction(download);
    };

    const download = async () => {
        await executeCredentialApiRequest(
            api.downloadWalletCredentialPdf,
            async (response) => {
                const pdfContent: Blob = response.data;
                const headers = response.headers as Record<string, string>;
                const disposition = headers["content-disposition"] ?? "";
                const fileNameMatch = /filename="(.+)"/.exec(disposition ?? "");
                const fileName = fileNameMatch?.[1] ?? "download.pdf";

                await downloadCredentialPDF(pdfContent, fileName);
            },
            downloadApi,
        );
    };

    const checkStatus = () => runExclusiveAction(setIsCheckingStatus, () => executeCredentialApiRequest(
        api.fetchWalletCredentialStatus,
        async (response) => {
            const status = response.data as CredentialStatusResponse;
            if (!status || (status.statusChecks == null && status.isExpired == null)) {
                setError("statusError");
                return;
            }
            setStatusOverride({
                statusChecks: status.statusChecks,
                lastCheckedAt: status.lastCheckedAt,
                isExpired: status.isExpired,
            });
            props.onStatusUpdated?.(props.credential.credentialId, status);
        },
        statusApi,
        "statusError"
    ));

    const handleDelete = () => {
        setShowDeleteConfirmation(true)
    }

    const deleteCredential = () => runExclusiveAction(setIsActionPending, async () => {
        try {
            await executeCredentialApiRequest(
                api.deleteWalletCredential,
                async () => {
                    props.refreshCredentials();
                },
                deleteApi,
                "deleteError"
            );
        } catch (error) {
            console.error("Failed to delete credential:", error);
            setError("deleteError");
        } finally {
            setShowDeleteConfirmation(false);
        }
    });

    const clearPreview = () => {
        isPreviewOpenRef.current = false;
        previewRequestIdRef.current += 1;
        setPreviewContent(undefined);
    }

    const menuItems = [
        {
            label: t('menu.view'),
            onClick: () => {
                void runMenuAction(preview);
            },
            id: "view",
            icon: <BsBoxArrowRight data-testid={"icon-view"} size={18}
                                   className={VCStyles.cardView.menuIcon}/>
        },
        {
            label: t('download'),
            onClick: () => {
                void runMenuAction(download);
            },
            id: "download",
            icon: <DownloadIcon testId={"icon-download"}/>
        },
        {
            label: t("menu.checkStatus"),
            onClick: () => {
                void checkStatus();
            },
            id: "check-status",
            icon: <IoReloadOutline data-testid={"icon-check-status"} size={18}
                                   className={VCStyles.cardView.menuIcon}/>
        },
        ...(!isOvpFlow ? [{
            label: t('menu.delete'),
            onClick: handleDelete,
            id: "delete",
            icon: (
            <RiDeleteBin6Line
                size={18}
                className={VCStyles.cardView.menuIcon}
                color="var(--iw-color-red)"
            />
            ),
            color: "var(--iw-color-red)"
        }] : [])
    ];

    return (
        <Clickable onClick={() => {
                       void runMenuAction(preview);
                   }} testId={"vc-card-view"}
                   className={VCStyles.cardView.container}>
            <VCDetailView previewContent={previewContent!} onClose={clearPreview}
                          onDownload={() => runMenuAction(download)}
                          onCheckStatus={checkStatus}
                          onDelete={!isOvpFlow ? handleDelete : undefined}
                          checkingStatus={isCheckingStatus}
                          credential={{
                              ...props.credential,
                              statusChecks: statusOverride?.statusChecks ?? props.credential.statusChecks,
                              lastCheckedAt: statusOverride !== null
                                  ? statusOverride.lastCheckedAt
                                  : props.credential.lastCheckedAt,
                              isExpired: statusOverride !== null
                                  ? statusOverride.isExpired
                                  : props.credential.isExpired,
                          }}/>
            {
                showDeleteConfirmation && (
                    <ConfirmationModal
                        testId={"delete-card"}
                        title={t("delete.confirmation.title")}
                        message={t("delete.confirmation.message")}
                        onConfirm={deleteCredential}
                        onCancel={() => setShowDeleteConfirmation(false)}
                    />
                )
            }

            <div className={VCStyles.cardView.contentsContainer}>
                <img
                    data-testid="issuer-logo"
                    src={props.credential.credentialTypeLogo}
                    alt="Credential Type Logo"
                    className={VCStyles.cardView.logo}
                />
                <div className={VCStyles.cardView.details}>
                    <span
                        className={VCStyles.cardView.credentialName}
                        data-testid="credential-type-display-name"
                    >
                        {props.credential.credentialTypeDisplayName}
                    </span>
                    {(statusOverride !== null || hasCredentialStatus(props.credential)) && (
                        <CredentialStatusBadge
                            statusChecks={statusOverride?.statusChecks ?? props.credential.statusChecks}
                            isExpired={statusOverride !== null
                                ? statusOverride.isExpired
                                : props.credential.isExpired}
                            lastCheckedAt={statusOverride
                                ? statusOverride.lastCheckedAt
                                : props.credential.lastCheckedAt}
                            checkingStatus={isCheckingStatus}
                        />
                    )}
                </div>
            </div>
            <div className={VCStyles.cardView.actionsContainer}>
                <DownloadIcon onClick={handleDownload}
                              testId={"icon-download"}
                              aria-disabled={actionsDisabled || undefined}
                              style={{color: actionsDisabled ? "var(--iw-color-grayLight)" : "var(--iw-color-grayMedium)"}}
                              className={actionsDisabled ? `${VCStyles.cardView.downloadIcon} cursor-not-allowed` : VCStyles.cardView.downloadIcon}/>
                <EllipsisMenu
                    testId={"mini-view-card"}
                    menuItems={menuItems}
                    disabled={actionsDisabled}
                />
            </div>
        </Clickable>
    );
}