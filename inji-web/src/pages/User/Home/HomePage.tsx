import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {FaPlus} from 'react-icons/fa';
import {useUser} from '../../../hooks/User/useUser';
import {useWalletCredentials} from '../../../hooks/User/useWalletCredentials';
import {convertStringIntoPascalCase} from "../../../utils/misc";
import {renderGradientText} from "../../../utils/builder";
import {SolidButton} from "../../../components/Common/Buttons/SolidButton";
import {BorderedButton} from "../../../components/Common/Buttons/BorderedButton";
import {SearchBar} from "../../../components/Common/SearchBar/SearchBar";
import {FlatList} from "../../../components/Common/List/FlatList";
import {VCCardView} from "../../../components/VC/VCCardView";
import {InfoSection} from "../../../components/Common/Info/InfoSection";
import {DocumentIcon} from "../../../components/Common/Icons/DocumentIcon";
import {SpinningLoader} from "../../../components/Common/SpinningLoader";
import {ErrorDisplay} from "../../../components/Error/ErrorDisplay";
import {WalletCredential} from "../../../types/data";
import {ROUTES} from "../../../utils/constants";
import {HomePageStyles} from "./HomePageStyles";

export const HomePage: React.FC = () => {
    const {t} = useTranslation('User');
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState<string | undefined>(undefined);
    const {user} = useUser();
    const userDisplayName = user?.displayName;
    const {credentials, filteredCredentials, loading, error, filterCredentials, refreshCredentials} =
        useWalletCredentials();

    useEffect(() => {
        setDisplayName(userDisplayName);
    }, [userDisplayName]);

    const navigateToAddCard = () => navigate(ROUTES.USER_ISSUERS);

    // "Welcome Abigail Thompson!" with the last name in gradient (per design)
    const renderWelcomeText = () => {
        const name = convertStringIntoPascalCase(displayName) ?? '';
        const words = name.trim() ? name.trim().split(/\s+/) : [];
        const lastName = words.length > 1 ? words[words.length - 1] : undefined;
        const leadingNames = lastName ? words.slice(0, -1).join(' ') : name;

        return (
            <h1 className={HomePageStyles.welcomeText} data-testid="home-welcome-text">
                {t('Home.welcome')} {leadingNames}
                {lastName && <> {renderGradientText(lastName)}</>}!
            </h1>
        );
    };

    const addCardButton = () => (
        <SolidButton
            testId="btn-add-card"
            onClick={navigateToAddCard}
            title={t('Home.addCard')}
            icon={<FaPlus size={12}/>}
        />
    );

    const renderEmptyState = () => (
        <div className={HomePageStyles.emptyStateContainer} data-testid="no-credentials-downloaded-container">
            <DocumentIcon/>
            <h2 className={HomePageStyles.emptyStateTitle} data-testid="no-credentials-downloaded-title">
                {t('Home.emptyScreen.title')}
            </h2>
            <p className={HomePageStyles.emptyStateMessage} data-testid="no-credentials-downloaded-message">
                {t('Home.emptyScreen.message')}
            </p>
        </div>
    );

    const renderCredentials = () => {
        if (credentials.length === 0) {
            return renderEmptyState();
        }
        return (
            <div className={HomePageStyles.listContainer}>
                <FlatList
                    onEmpty={<InfoSection message={t('Home.search.noResults')} testId={"no-search-cards-found"}/>}
                    data={filteredCredentials}
                    renderItem={(item: WalletCredential) => (
                        <VCCardView
                            key={item.credentialId}
                            credential={item}
                            refreshCredentials={refreshCredentials}
                        />
                    )}
                    keyExtractor={(credential: WalletCredential) => credential.credentialId}
                    testId={"credentials"}
                />
            </div>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className={HomePageStyles.loaderContainer} data-testid={"loader-credentials"}>
                    <SpinningLoader/>
                </div>
            );
        }
        if (error) {
            return (
                <ErrorDisplay
                    message={t(`Common:error.${error}.title`)}
                    helpText={t(`Common:error.${error}.message`)}
                    testId={"home-credentials"}
                    action={<BorderedButton testId={"btn-try-again"} onClick={refreshCredentials}
                                            title={t('Common:tryAgain')}/>}
                />
            );
        }
        return renderCredentials();
    };

    return (
        <div className={HomePageStyles.container}>
            {renderWelcomeText()}
            <h4 className={HomePageStyles.subtitle} data-testid="home-sub-text">
                {/* Gradient span is inlined rather than using renderGradientText:
                    that helper hardcodes font-bold and is shared with the button
                    components, so it can't be lightened for this heading alone. */}
                {t('Home.subtitle')}{" "}
                <span className="inline-block bg-gradient-to-r from-iw-primary to-iw-secondary bg-clip-text font-normal text-transparent">
                    {t('Home.subtitle2')}
                </span>
            </h4>

            <div className={HomePageStyles.actionBar}>
                {addCardButton()}
            </div>

            <div className={HomePageStyles.searchContainer}>
                <SearchBar
                    testId={"search-credentials"}
                    placeholder={t('Home.search.placeholder')}
                    filter={filterCredentials}
                />
            </div>

            {renderContent()}
        </div>
    );
};
