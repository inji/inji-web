import {ApiRequest, ApiResult, WalletCredential} from "../../types/data";
import {VCStyles} from "./VCStyles";
import React, {useEffect, useState} from "react";
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
import {showToast} from "../Common/toast/ToastWrapper";
import {useApi} from "../../hooks/useApi";
import { useLocation } from "react-router-dom";
import { Pages } from "../../utils/constants";

export function VCCardView(props: Readonly<{
    credential: WalletCredential,
    refreshCredentials: () => void
}>) {
    const language = useSelector((state: RootState) => state.common.language);
    const [error, setError] = useState<string>()
    const [previewContent, setPreviewContent] = useState<Blob>();
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const {t} = useTranslation('StoredCards', {
        keyPrefix: "cardView"
    })
    const previewApi = useApi()
    const downloadApi = useApi()
    const deleteApi = useApi()
    const location = useLocation();
    const isOvpFlow = location.pathname.includes(Pages.AUTHORIZE);
    
    useEffect(() => {
        if (error) {
            showToast({
                type: "error",
                message: t(`error.${error}`),
                testId: error === "downloadError" ? "download-failure" : "delete-failure"
            })
            setError("")
        }
    }, [error, t])

    const executeCredentialApiRequest = async (
        apiConfig: ApiRequest,
        onSuccess: (response: ApiResult<any>) => Promise<void>,
        apiInstance: ReturnType<typeof useApi>,
        errorType: string = "downloadError"
    ) => {
        try {
            const response = await apiInstance.fetchData({
                url: apiConfig.url(props.credential.credentialId),
                headers: apiConfig.headers(language),
                apiConfig: apiConfig,
            })

            if (!response.ok()) {
                console.error(`Failed to fetch request, got ${errorType} with response - `, response);
                setError(errorType);
                return;
            }

            await onSuccess(response);
        } catch (error) {
            console.error("API request failed:", error);
            setError(errorType);
        }
    };

    const preview = async () => {
        await executeCredentialApiRequest(
            api.fetchWalletCredentialPreview,
            async (response) => {
                const pdfContent: Blob = response.data;
                setPreviewContent(pdfContent);
            },
            previewApi,
        );
    };

    const handleDownload = async (event: React.MouseEvent) => {
        event.stopPropagation();
        await download();
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

    const handleDelete = () => {
        setShowDeleteConfirmation(true)
    }

    const deleteCredential = async () => {
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
    };

    const clearPreview = () => {
        setPreviewContent(undefined);
    }

    const menuItems = [
        {
            label: t('menu.view'),
            onClick: () => {
                void preview();
            },
            id: "view",
            icon: <BsBoxArrowRight data-testid={"icon-view"} size={18}
                                   className={VCStyles.cardView.menuIcon}/>
        },
        {
            label: t('download'),
            onClick: () => {
                void download();
            },
            id: "download",
            icon: <DownloadIcon testId={"icon-download"}/>
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
        <Clickable onClick={preview} testId={"vc-card-view"}
                   className={VCStyles.cardView.container}>
            <VCDetailView previewContent={previewContent!} onClose={clearPreview} onDownload={download}
                          credential={props.credential}/>
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
                <span
                    className={VCStyles.cardView.credentialName}
                    data-testid="credential-type-display-name"
                >
                    {props.credential.credentialTypeDisplayName}
                </span>
            </div>
            <div className={VCStyles.cardView.actionsContainer}>
                <DownloadIcon onClick={handleDownload}
                              testId={"icon-download"}
                              style={{color: "var(--iw-color-grayMedium)"}}
                              className={VCStyles.cardView.downloadIcon}/>
                <EllipsisMenu
                    testId={"mini-view-card"}
                    menuItems={menuItems}
                />
            </div>
        </Clickable>
    );
}