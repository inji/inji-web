import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {FaSearch} from 'react-icons/fa';
import {useDispatch, useSelector} from "react-redux";
import {storeFilteredIssuers} from "../../redux/reducers/issuersReducer";
import {IssuerObject} from "../../types/data";
import {IoCloseCircleSharp} from "react-icons/io5";
import {RootState} from "../../types/redux";
import {getIssuerDisplayObjectForCurrentLanguage} from "../../utils/i18n";
import { SearchIssuerStyles } from "./SearchIssuerStyles.ts";

type SearchIssuerProps = {
    placeholder?: string;
    showHelpText?: boolean;
};

export const SearchIssuer: React.FC<SearchIssuerProps> = ({placeholder, showHelpText = true}) => {

    const {t} = useTranslation("IssuersPage");
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState("");
    const issuers = useSelector((state:RootState) => state.issuers.issuers);
    const language = useSelector((state:RootState) => state.common.language);
    const filterIssuers = async (searchText: string) => {
        setSearchText(searchText);
        setIsSearchValid(issuerRegex.test(searchText));
        const filteredIssuers = issuers.filter( (issuer:IssuerObject) => {
            const displayObject = getIssuerDisplayObjectForCurrentLanguage(issuer.display, language);
            return (displayObject?.name?.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 && issuer.protocol !== 'OTP')
        })
        dispatch(storeFilteredIssuers(filteredIssuers));
    }
    const issuerRegex = /^(?!_)(?!.*__)(?!\s{1,}$)[a-zA-Z0-9\s\-_()]*$/;
    const [isSearchValid, setIsSearchValid] = useState(true);

    return (
        <div className={SearchIssuerStyles.mainContainer}>
            <div
                data-testid="Search-Issuer-Container"
                className={SearchIssuerStyles.searchContainer}
            >
                <FaSearch
                    data-testid="Search-Issuer-Search-Icon"
                    color={"var(--iw-color-searchIcon)"}
                    className={SearchIssuerStyles.searchIcon}
                    size={20}
                />
                <input
                    data-testid="Search-Issuer-Input"
                    type="text"
                    value={searchText}
                    placeholder={placeholder ?? t("Intro.searchText")}
                    onChange={(event) => filterIssuers(event.target.value)}
                    className={SearchIssuerStyles.searchInput}
                />
                {searchText.length > 0 && (
                    <IoCloseCircleSharp
                        data-testid="Search-Issuer-Clear-Icon"
                        onClick={() => filterIssuers("")}
                        className={SearchIssuerStyles.clearSearchIcon}
                        color={"var(--iw-color-closeIcon)"}
                        size={20}
                    />
                )}
            </div>
            <div className={SearchIssuerStyles.helperAndErrorTextContainer} data-testid="Search-Issuer-HelperAndError-Text">
            {!isSearchValid && (
                <p className={SearchIssuerStyles.regexError}>
                    { t("searchIssuer.helpText.error") }
                </p>)
            }
            {isSearchValid && showHelpText && (
                <p className={SearchIssuerStyles.infoMsg}>
                    { t("searchIssuer.helpText.info") }
                </p>)
            }
            </div>
        </div>
    );
}

