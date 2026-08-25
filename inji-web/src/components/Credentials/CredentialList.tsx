import React, {useState} from "react";
import {Credential} from "./Credential";
import {useSelector} from "react-redux";
import {RootState} from "../../types/redux";
import {EmptyListContainer} from "../Common/EmptyListContainer";
import {useTranslation} from "react-i18next";
import {SpinningLoader} from "../Common/SpinningLoader";
import {HeaderTile} from "../Common/HeaderTile";
import {DownloadResult} from "../Redirection/DownloadResult";
import {CredentialConfigurationObject} from "../../types/data";
import {defaultLanguage} from "../../utils/i18n";
import {RequestStatus} from "../../utils/constants";

interface CredentialListProps {
    state: RequestStatus;
}

export const CredentialList: React.FC<CredentialListProps> = ({state}) => {
    const [errorObj, setErrorObj] = useState({
        code: "",
        message: ""
    });
    const selectedLanguage = useSelector(
        (state: RootState) => state.common.language
    );

    const credentials = useSelector((state: RootState) => state.credentials);

    const filterCredentialsBySelectedOrDefaultLanguage = () => {
        const missingLanguageSupport: CredentialConfigurationObject[] = [];

        const filteredCredentialsList = (
            credentials?.filtered_credentials?.credentials_supported ?? []
        ).filter((credential: CredentialConfigurationObject) => {
            const display = credential.display;
            const hasMatchingDisplay = display?.some(
                ({locale}) =>
                    locale === selectedLanguage || locale === defaultLanguage
            );

            if (!hasMatchingDisplay) {
                missingLanguageSupport.push(credential);
            }

            return hasMatchingDisplay;
        });

        if (missingLanguageSupport.length) {
            console.error(
                `Language support missing for these credential types of issuer: ${missingLanguageSupport
                    .map((credential) => credential.name)
                    .join(", ")}`
            );
        }

        return filteredCredentialsList;
    };

    const filteredCredentialsWithLangSupport =
        filterCredentialsBySelectedOrDefaultLanguage();

    const {t} = useTranslation("CredentialsPage");

    if (state === RequestStatus.LOADING) {
        return <SpinningLoader />;
    }

    if (
        state === RequestStatus.ERROR ||
        filteredCredentialsWithLangSupport.length === 0 ||
        !credentials?.filtered_credentials?.credentials_supported ||
        (credentials?.filtered_credentials?.credentials_supported &&
            credentials?.filtered_credentials?.credentials_supported.length ===
                0)
    ) {
        return (
            <div>
                <HeaderTile
                    content={t("containerHeading")}
                    subContent={t("containerSubHeading")}
                />
                <EmptyListContainer content={t("emptyContainerContent")} />
            </div>
        );
    }

    if (errorObj.code) {
        return (
            <DownloadResult
                title={t(errorObj.code)}
                subTitle={t(errorObj.message)}
                state={RequestStatus.ERROR}
            />
        );
    }

    return (
        <>
            <HeaderTile
                content={t("containerHeading")}
                subContent={t("containerSubHeading")}
            />
           <div className="col-span-full flex flex-wrap gap-3 p-4 pb-20 justify-start">
                {filteredCredentialsWithLangSupport.map(
                    (
                        credentialConfig: CredentialConfigurationObject,
                        index: number
                    ) => (
                        <Credential
                            key={credentialConfig.name}
                            credentialId={credentialConfig.name}
                            credentialWellknown={credentialConfig}
                            index={index}
                            setErrorObj={setErrorObj}
                        />
                    )
                )}
            </div>
        </>
    );
};