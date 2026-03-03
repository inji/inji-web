import {WalletCredential} from "../../types/data";
import {Modal} from "../../modals/Modal";
import {PDFViewer} from "../Preview/PDFViewer";
import React from "react";
import {ResponsiveIconButtonWithText} from "../Common/Buttons/ResponsiveIconButtonWithText";
import {DownloadIcon} from "../Common/Icons/DownloadIcon";
import {useTranslation} from "react-i18next";

export function VCDetailView(props: Readonly<{
    previewContent: Blob,
    onClose: () => void,
    onDownload: () => Promise<void>,
    credential: WalletCredential
}>) {
    const {t} = useTranslation('StoredCards', {
        keyPrefix: "cardView"
    });

    return (
        <Modal isOpen={!!props.previewContent}
                  onClose={props.onClose}
                  action={<ResponsiveIconButtonWithText text={t('download')}
                    icon={<DownloadIcon testId={"icon-download"} 
                                                        />}
                                                        testId={"download"}
                                                        onClick={props.onDownload}
                />
            }
                  title={props.credential.credentialTypeDisplayName}
                  testId={"vc-card-detail-view"}
                  titleTestId={"credential-type-display-name"}
    >
        <PDFViewer
            previewContent={props.previewContent}
                className="overflow-y-auto overflow-x-hidden h-full"
        />
        </Modal>
         );
}