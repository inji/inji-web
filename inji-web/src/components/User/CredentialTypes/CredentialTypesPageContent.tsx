import React from "react";
import {DownloadResult} from "../../Redirection/DownloadResult";
import {CredentialTypesPageStyles} from "../../../pages/User/CredentialTypes/CredentialTypesPageStyles";
import {useTranslation} from "react-i18next";
import {CredentialListWrapper} from "../../Credentials/CredentialListWrapper";
import {RequestStatus} from "../../../utils/constants";

interface CredentialTypesPageContentProps {
    downloadStatus: RequestStatus | null;
    state: RequestStatus;
}

export const CredentialTypesPageContent: React.FC<CredentialTypesPageContentProps> = (
    props
) => {
    const {t} = useTranslation('CredentialTypesPage');

    if (props.downloadStatus === RequestStatus.LOADING) {
        return (
            <DownloadResult
                title={t('CredentialTypesPage:download.loading.header')}
                subTitle={t('CredentialTypesPage:download.loading.subHeader')}
                state={RequestStatus.LOADING}
            />
        );
    }

    if (props.downloadStatus === RequestStatus.ERROR) {
        return <DownloadResult
            title={t('CredentialTypesPage:download.error.header')}
            subTitle={t('CredentialTypesPage:download.error.subHeader')}
            state={RequestStatus.ERROR}
        />
    }

    return (
        <div className={CredentialTypesPageStyles.contentContainer}>
            <CredentialListWrapper
                state={props.state}
                className={CredentialTypesPageStyles.credentialListContainer}
                showHeader={false}
            />
        </div>
    );
};
