import React, {Fragment, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {NavBackArrowButton} from '../../../components/Common/Buttons/NavBackArrowButton';
import {ApiError, ErrorType, WalletCredential} from "../../../types/data";
import {useSelector} from "react-redux";
import {RootState} from "../../../types/redux";
import {api} from "../../../utils/api";
import {SolidButton} from "../../../components/Common/Buttons/SolidButton";
import {SpinningLoader} from "../../../components/Common/SpinningLoader";
import {SearchBar} from "../../../components/Common/SearchBar/SearchBar";
import {InfoSection} from "../../../components/Common/Info/InfoSection";
import {VCCardView} from "../../../components/VC/VCCardView";
import {FlatList} from "../../../components/Common/List/FlatList";
import {DocumentIcon} from "../../../components/Common/Icons/DocumentIcon";
import {PageTitle} from "../../../components/Common/PageTitle/PageTitle";
import {ErrorDisplay} from "../../../components/Error/ErrorDisplay";
import {BorderedButton} from "../../../components/Common/Buttons/BorderedButton";
import {StoredCardsPageStyles} from "./StoredCardsPageStyles";
import {TertiaryButton} from "../../../components/Common/Buttons/TertiaryButton";
import {navigateToUserHome} from "../../../utils/navigationUtils";
import {HTTP_STATUS_CODES, NETWORK_ERROR_MESSAGE} from "../../../utils/constants";
import {useApi} from "../../../hooks/useApi";

export const StoredCardsPage: React.FC = () => {
    const {t} = useTranslation('StoredCards');
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState<WalletCredential[]>([]);
    const [filteredCredentials, setFilteredCredentials] = useState<WalletCredential[]>([]);
    const walletCredentialsApi = useApi<WalletCredential[]>()
    const [loading, setLoading] = useState(true);
    const language = useSelector((state: RootState) => state.common.language);
    const [error, setError] = useState<string>();
    const credentialsRequestIdRef = useRef(0);


    const fetchWalletCredentials = async () => {
        const requestId = ++credentialsRequestIdRef.current;
        setLoading(true)
        try {
            const fetchWalletCredentials = api.fetchWalletVCs;

            const response = await walletCredentialsApi.fetchData({
                headers: fetchWalletCredentials.headers(language),
                apiConfig: fetchWalletCredentials
            })

            if (requestId !== credentialsRequestIdRef.current) {
                return;
            }

            if (response.ok()) {
                const responseData = response.data!;
                setCredentials(responseData);
                setFilteredCredentials(responseData)
                setError(undefined);
            } else {
                console.error("Error fetching credentials:", response.status, response.error,  !navigator.onLine);
                if (response.error?.message === (NETWORK_ERROR_MESSAGE) &&  !navigator.onLine) {
                    console.error('Network error: Please check your internet connection.');
                    setError("networkError");
                    return;
                }

                switch (response.status) {
                    case HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR:
                        setError("internalServerError");
                        break;
                    case HTTP_STATUS_CODES.SERVICE_UNAVAILABLE:
                        setError("serviceUnavailable");
                        break;
                    case HTTP_STATUS_CODES.BAD_REQUEST: {
                        const errorMessage = ((response.error as ApiError)?.response?.data as ErrorType).errorMessage ?? "";
                        const invalidWalletRequests = [
                            "Wallet key not found in session",
                            "Wallet is locked",
                            "Invalid Wallet ID. Session and request Wallet ID do not match"
                        ];
                        setError(
                            invalidWalletRequests.includes(errorMessage)
                                ? "invalidWalletRequest"
                                : "invalidRequest"
                        );
                        break;
                    }
                    default:
                        setError("unknownError");
                }
            }
        } catch (error) {
            if (requestId !== credentialsRequestIdRef.current) {
                return;
            }
            console.error("An unknown error occurred. Failed to fetch credentials:", error);
            setError("unknownError");
        } finally {
            if (requestId === credentialsRequestIdRef.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        void fetchWalletCredentials();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);

    const filterCredentials = (searchText: string) => {
        if (searchText === "") {
            setFilteredCredentials(credentials);
        } else {
            const filteredCredentialsToBeUpdated = credentials.filter((credential: WalletCredential) =>
                credential.credentialTypeDisplayName.toLowerCase().includes(searchText.toLowerCase())
            )
            setFilteredCredentials(filteredCredentialsToBeUpdated);
        }
    };

    const navigateToHome = () => navigateToUserHome(navigate);

    const refreshCredentials = async () => {
        await fetchWalletCredentials()
    }

    const loader =
        <div className={StoredCardsPageStyles.loaderContainer} data-testid={"loader-credentials"}>
            <SpinningLoader/>
        </div>

    function displayCredentials() {
        // In case of no credentials, show empty screen with action to add cards in mobile view
        if (credentials.length === 0) {
            return <InfoSection title={t('emptyScreen.title')}
                                message={t('emptyScreen.actionText')}
                                icon={<DocumentIcon/>}
                                testId={"no-credentials-downloaded"}
                                mobileAction={addCard()}
            />;
        }
        return (
            <Fragment>
                <div className={StoredCardsPageStyles.searchContainer}>
                    <SearchBar
                        testId={"search-credentials"}
                        placeholder={t('search.placeholder')}
                        filter={filterCredentials}
                    />
                </div>
                <div className={StoredCardsPageStyles.listContainer}>
                    <FlatList
                        onEmpty={<InfoSection message={t('search.noResults')} testId={"no-search-cards-found"}/>}
                        data={filteredCredentials}
                        renderItem={(item: WalletCredential) => {
                            return <VCCardView
                                key={item.credentialId}
                                credential={item}
                                refreshCredentials={refreshCredentials}
                            />;
                        }
                        }
                        keyExtractor={(credential: WalletCredential) => credential.credentialId}
                        testId={"credentials"}
                    />
                </div>
            </Fragment>
        )
    }

    const showContent = () => {
        if (loading) {
            return loader;
        }

        if (error) {
            return (
                <ErrorDisplay
                    message={t(`Common:error.${error}.title`)}
                    helpText={t(`Common:error.${error}.message`)}
                    testId={"stored-credentials"}
                    action={<BorderedButton testId={"btn-go-home"} onClick={navigateToHome}
                                            title={t('Common:goToHome')}/>}
                />
            );
        }

        return displayCredentials();
    };

    const addCard = () => <SolidButton testId={"btn-add-cards"} onClick={navigateToHome}
                                       title={t('header.addCards')}/>;

    return (
        <div className={StoredCardsPageStyles.container}>
            <div className={StoredCardsPageStyles.headerContainer} data-testid={"page-title-container"}>
                <div className={StoredCardsPageStyles.navContainer}>
                    <div className={StoredCardsPageStyles.navContainer}>
                        <NavBackArrowButton onBackClick={navigateToHome}/>
                    </div>
                    <div className={StoredCardsPageStyles.titleContainer}>
                        <PageTitle value={t('title')} testId={"stored-credentials"}/>
                        <TertiaryButton onClick={navigateToHome} title={t('Common:home')} testId={"home"}/>
                    </div>
                </div>
                <div className={`${StoredCardsPageStyles.buttonContainer.large}`}>
                    {addCard()}
                </div>
            </div>

            <div className={StoredCardsPageStyles.contentContainer} data-testid={"content-and-action-container"}>
                {showContent()}
                {!loading && credentials.length !== 0 &&
                    <div className={StoredCardsPageStyles.buttonContainer.mobile}>
                        {addCard()}
                    </div>
                }
            </div>
        </div>
    );
};