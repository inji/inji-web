import {WalletCredential} from "../../types/data";
import {Modal} from "../../modals/Modal";
import {PDFViewer} from "../Preview/PDFViewer";
import React from "react";
import {ResponsiveIconButtonWithText} from "../Common/Buttons/ResponsiveIconButtonWithText";
import {DownloadIcon} from "../Common/Icons/DownloadIcon";
import {useTranslation} from "react-i18next";
import {CredentialPreviewStatusBar} from "../CredentialStatus/CredentialPreviewStatusBar";
import {hasCredentialStatus} from "../../utils/credentialStatus";


export function VCDetailView(props: Readonly<{
    previewContent: Blob,
    onClose: () => void,
    onDownload: () => Promise<void>,
    onCheckStatus?: () => void,
    onDelete?: () => void,
    checkingStatus?: boolean,
    credential: WalletCredential
}>) {
    const {t} = useTranslation('StoredCards', {
        keyPrefix: "cardView"
    })
    const supportsStatus = hasCredentialStatus(props.credential) && !!props.onCheckStatus;

    return <Modal isOpen={!!props.previewContent}
                  onClose={props.onClose}
                  action={supportsStatus ? undefined : <ResponsiveIconButtonWithText text={t('download')}
                                                        icon={<DownloadIcon
                                                            testId={"icon-download"}
                                                        />}
                                                        testId={"download"}
                                                        onClick={props.onDownload}
                  />}
                  title={props.credential.credentialTypeDisplayName}
                  testId={"vc-card-detail-view"}
                  titleTestId={"credential-type-display-name"}
    >
        {supportsStatus ? (
            <CredentialPreviewStatusBar
                statusChecks={props.credential.statusChecks}
                lastCheckedAt={props.credential.lastCheckedAt}
                isExpired={props.credential.isExpired}
                onDownload={() => {
                    void props.onDownload();
                }}
                onCheckStatus={props.onCheckStatus!}
                onDelete={props.onDelete}
                checkingStatus={props.checkingStatus}
            >
                <PDFViewer
                    previewContent={props.previewContent}
                />
            </CredentialPreviewStatusBar>
        ) : (
            <PDFViewer
                previewContent={props.previewContent}
            />
        )}
    </Modal>;
}
