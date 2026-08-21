import React from "react";
import {SearchCredential} from "../../Credentials/SearchCredential";
import {NavBackArrowButton} from "../../Common/Buttons/NavBackArrowButton";
import {useTranslation} from "react-i18next";
import {HeaderStyles} from "./HeaderStyles";

interface HeaderPops {
    onBackClick: () => void,
}

export const Header: React.FC<HeaderPops> = (props) => {
    const {t} = useTranslation(['CredentialsPage', 'IssuersPage']);
    return <div className={HeaderStyles.headerContainer}>
        <button
            type="button"
            data-testid="CredentialTypes-Back-Button"
            className={HeaderStyles.backButtonContainer}
            onClick={props.onBackClick}
        >
            <NavBackArrowButton/>
            <span className={HeaderStyles.backText}>
                {t('IssuersPage:back')}
            </span>
        </button>

        <div className={HeaderStyles.headerTitleSection}>
            <h1
                data-testid="CredentialTypes-Page-Title"
                className={HeaderStyles.pageTitle}
            >
                {t('CredentialsPage:containerHeading')}
            </h1>
            <p
                data-testid="CredentialTypes-Page-Description"
                className={HeaderStyles.pageDescription}
            >
                {t('CredentialsPage:containerSubHeading')}
            </p>
        </div>

        <div className={HeaderStyles.searchBarContainer}>
            <SearchCredential
                fullWidth
                issuerContainerBorderRadius={"rounded-lg"}
            />
        </div>
    </div>;
}
