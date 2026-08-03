import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation, useNavigate} from 'react-router-dom';
import {NavBackArrowButton} from '../../../components/Common/Buttons/NavBackArrowButton';
import {InfoField} from '../../../components/Common/InfoField';
import {navigateToUserHome} from "../../../utils/navigationUtils";
import {TertiaryButton} from '../../../components/Common/Buttons/TertiaryButton';
import {CircleSkeleton} from '../../../components/Common/CircleSkeleton';
import {InfoFieldSkeleton} from '../../../components/Common/InfoFieldSkeleton';
import {ProfilePageStyles} from "./ProfilePageStyles";
import {useApi} from "../../../hooks/useApi";
import {User} from "../../../types/data";
import {RequestStatus} from "../../../utils/constants";
import {api} from "../../../utils/api";
import {ErrorDisplay} from "../../../components/Error/ErrorDisplay";
import {BorderedButton} from "../../../components/Common/Buttons/BorderedButton";

const getProfileInitials = (displayName?: string): string => {
    const parts = (displayName ?? "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
};

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const {t} = useTranslation('User', {
        keyPrefix: "ProfilePage"
    });
    const {t: commonTranslation} = useTranslation('common');
    const location = useLocation();
    const previousPagePath = location.state?.from;
    const {state, data, fetchData, error} = useApi<User>()

    useEffect(() => {
        async function fetchProfileInfo() {
            await fetchData({
                apiConfig: api.fetchUserProfile
            })
        }

        void fetchProfileInfo()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleBackClick = () => {
        if (previousPagePath) {
            navigate(previousPagePath);
        } else {
            navigateToUserHome(navigate);
        }
    };

    // Always an initials avatar (per design): Google accounts without a photo
    // return a generated single-letter image, so the photo URL can't be trusted
    // to look like the mock's two-letter monogram.
    const renderProfilePicture = () => {
        if (state === RequestStatus.LOADING) {
            return (
                <CircleSkeleton
                    size={ProfilePageStyles.profilePictureSkeleton}
                    className="flex-shrink-0"
                />
            );
        }
        return (
            <div
                data-testid="profile-page-picture-initials"
                className={ProfilePageStyles.profileInitials}
            >
                {getProfileInitials(data?.displayName)}
            </div>
        );
    };

    const renderInfoFields = () => {
        return state === RequestStatus.LOADING ? (
            <>
                <InfoFieldSkeleton width="w-2/4" height="h-3" className="mb-12"/>
                <InfoFieldSkeleton width="w-3/4" height="h-3" className="my-4"/>
            </>
        ) : (
            <>
                <InfoField
                    testId="full-name"
                    label={t('fullName')}
                    value={data?.displayName}
                />
                <InfoField
                    testId="email"
                    label={t('emailAddress')}
                    value={data?.email}
                />
            </>
        );
    };

    const handleGoToHome = () => {
        navigateToUserHome(navigate)
    };

    const renderProfile = () => <div
        className={ProfilePageStyles.contentContainer}>
        <div>{renderProfilePicture()}</div>

        <hr
            data-testid="profile-page-horizontal-rule"
            className={ProfilePageStyles.horizontalDivider}
        />

        <div className={ProfilePageStyles.infoContainer}>
            {renderInfoFields()}
        </div>
    </div>;

    return (
        <div className={ProfilePageStyles.container}>
            <div className={ProfilePageStyles.headerContainer}>
                <div className={ProfilePageStyles.headerLeftSection}>
                    <NavBackArrowButton onBackClick={handleBackClick}/>
                    <div className={ProfilePageStyles.headerTitleContainer}>
            <span data-testid="profile-page" className={ProfilePageStyles.pageTitle}>
              {t('title')}
            </span>
                        <TertiaryButton
                            testId="home"
                            onClick={() => navigateToUserHome(navigate)}
                            title={t('homeTitle')}
                        />
                    </div>
                </div>
            </div>

            {/* Main profile section */}
            {error ? (<ErrorDisplay message={t('error.title')}
                                    helpText={t('error.message')}
                                    testId={"profile"}
                                    action={<BorderedButton title={commonTranslation('goToHome')}
                                                            onClick={handleGoToHome}
                                                            testId={"btn-go-to-home"}
                                    />}
            />) : renderProfile()}
        </div>
    )
};
