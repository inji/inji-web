import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {LanguageSelector} from '../Common/LanguageSelector';
import {api} from '../../utils/api';
import {toast} from 'react-toastify';
import {useUser} from '../../hooks/User/useUser';
import HamburgerMenu from '../../assets/HamburgerMenu.svg';
import {isRTL} from '../../utils/i18n';
import {useSelector} from 'react-redux';
import {RootState} from '../../types/redux';
import {useTranslation} from 'react-i18next';
import DropdownArrowIcon from '../Common/DropdownArrowIcon';
import {ROUTES} from '../../utils/constants';
import {convertStringIntoPascalCase} from "../../utils/misc";
import {navigateToUserHome} from "../../utils/navigationUtils";
import {CircleSkeleton} from '../Common/CircleSkeleton';
import {InfoFieldSkeleton} from '../Common/InfoFieldSkeleton';
import {ApiError, DropdownItem, ResponseTypeObject} from "../../types/data";
import {useApi} from "../../hooks/useApi";

type UserHeaderProps = {
    headerRef: React.RefObject<HTMLDivElement>;
    headerHeight: number;
};

export const Header: React.FC<UserHeaderProps> = ({
    headerRef,
    headerHeight
}) => {
    const language = useSelector((state: RootState) => state.common.language);
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState<string | undefined>(
        undefined
    );
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const hamburgerMenuRef = useRef<HTMLImageElement>(null);
    const {user, removeUser,isLoading} = useUser();
    const displayNameFromLocalStorage = user?.displayName;
    const hasProfilePictureUrl = user?.profilePictureUrl;
    const {t} = useTranslation('User');
    const logoutRequestApi = useApi()

    useEffect(() => {
        setDisplayName(displayNameFromLocalStorage);
    }, [displayNameFromLocalStorage]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (dropdownRef.current && !dropdownRef.current.contains(target)) {
                setIsProfileDropdownOpen(false);
            }

            if (
                hamburgerMenuRef.current &&
                !hamburgerMenuRef.current.contains(target)
            ) {
                setIsHamburgerMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () =>
            document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            const response = await logoutRequestApi.fetchData({
                apiConfig: api.userLogout,
            })

            if (response.ok()) {
                removeUser();
                window.location.replace(ROUTES.ROOT);
            } else {
                const parsedResponse = ((response.error as ApiError)?.response?.data as ResponseTypeObject).errors
                const errorCode = parsedResponse?.[0].errorCode;
                if (errorCode === 'user_logout_error') {
                    removeUser();
                    window.location.replace(ROUTES.ROOT);
                }
                throw new Error(parsedResponse?.[0]?.errorMessage);
            }
        } catch (error) {
            console.error('Logout failed with error:', error);
            toast.error('Unable to logout. Please try again.');
        }
    };

    const dropdownItems: DropdownItem[] = [
        {
            label: t('ProfileDropdown.profile'),
            onClick: () => {
                setIsProfileDropdownOpen(false);    
                navigate(ROUTES.USER_PROFILE,{state: {from: window.location.pathname}});
            },
            textColor: 'text-gray-700',
            key: 'Profile-Dropdown-Profile'
        },
        {
            label: t('ProfileDropdown.faq'),
            onClick: () => {
                setIsProfileDropdownOpen(false);
                navigate(ROUTES.USER_FAQ, {state: {from: window.location.pathname}});
            },
            textColor: 'text-gray-700',
            key: 'Profile-Dropdown-FAQ'
        },
        {
            label: t('ProfileDropdown.logout'),
            onClick: handleLogout,
            textColor: 'text-red-700',
            key: 'Profile-Dropdown-Logout'
        }
    ];

    const toggleProfileDropdown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation(); // Prevent global click handler from immediately closing the dropdown
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const toggleHamburgerMenu = () => {
        setIsHamburgerMenuOpen(!isHamburgerMenuOpen);
    };

    const getProfileInitials = (displayName: string | undefined) => {
        return displayName ? displayName.charAt(0).toUpperCase(): 'U';
    };

    const getUserProfileIconWithName = () => {
        if (isLoading) {
            return (
              <div className="flex gap-2 items-center">
                <CircleSkeleton size="w-12 h-12" />
                <InfoFieldSkeleton width="w-24" height="h-2" />
              </div>
            );
          }
        
          return (
            <div className="flex gap-2 items-center">
              <div
                className={`aspect-square w-12 rounded-full bg-iw-avatarPlaceholder overflow-hidden flex items-center justify-center text-iw-avatarText font-medium text-lg ${
                  !hasProfilePictureUrl && 'p-2 sm:p-3 md:p-4'
                }`}
              >
                {hasProfilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt="Profile Pic"
                    className="w-12 h-12 object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  getProfileInitials(displayName)
                )}
              </div>
              <span className="font-semibold text-gray-800">
                {convertStringIntoPascalCase(displayName)}
              </span>
            </div>
          );
        };

    return (
        <header
            ref={headerRef}
            data-testid="dashboard-header-container"
            className="fixed top-0 left-0 right-0 z-20 bg-iw-background bg-transparent shadow-[0_4px_5px_0_rgba(0,0,0,0.051)]"
        >
            <div className="w-full px-4 py-4 flex justify-between items-center">
                <div className="flex justify-start items-center gap-2">
                    <div
                        data-testid="hamburger-menu"
                        className="block sm:hidden"
                    >
                        <img
                            data-testid="icon-hamburger-menu"
                            ref={hamburgerMenuRef}
                            src={HamburgerMenu}
                            alt="Hamburger Menu"
                            onClick={toggleHamburgerMenu}
                            className="cursor-pointer"
                        />
                    </div>
                    <div
                        className="w-[130px] sm:w-[160px] md:w-[170px]"
                        role={'button'}
                        tabIndex={0}
                        onMouseDown={() => navigateToUserHome(navigate)}
                        onKeyUp={() => navigateToUserHome(navigate)}
                    >
                        <img
                            src={require('../../assets/InjiWebLogo.png')}
                            className={`max-w-full h-auto object-contain cursor-pointer ${
                                isRTL(language) ? 'mr-4' : ''
                            }`}
                            data-testid="header-injiWeb-logo"
                            alt="Inji Web Logo"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <LanguageSelector />

                    <div
                        data-testid="profile-details"
                        className="hidden sm:block relative"
                        ref={dropdownRef}
                    >
                        <div className="flex items-center space-x-2">
                            {getUserProfileIconWithName()}
                            {!isLoading && (
                                <div
                                className="relative inline-block cursor-pointer"
                                onClick={toggleProfileDropdown}
                                >
                                <DropdownArrowIcon isOpen={isProfileDropdownOpen} />
                                </div>
                            )}
                        </div>

                        {isProfileDropdownOpen && (
                            <div
                                data-testid="profile-dropdown"
                                className="absolute -right-7 top-100 mt-8 w-56 bg-white rounded-lg shadow-lg z-50 font-medium"
                            >
                                <div className="absolute top-[-0.3rem] right-8 w-3 h-3 bg-white transform rotate-45" />
                                <div className="py-2">
                                    {dropdownItems.map((item) => (
                                        <div
                                            key={item.key}
                                            className={`px-4 py-3 text-sm ${item.textColor} cursor-pointer hover:bg-iw-dropdownActiveBg hover:text-iw-primary`}
                                            onClick={item.onClick}
                                        >
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div
                data-testid="hamburger-menu-dropdown"
                className="block sm:hidden w-full"
            >
                {isHamburgerMenuOpen && (
                    <div
                        style={{marginTop: headerHeight}}
                        className="absolute top-1 bg-white shadow-iw-hamburger-dropdown p-2 w-full"
                    >
                        <div>
                            <div className="flex items-center px-4 py-2">
                                {getUserProfileIconWithName()}
                            </div>
                            {dropdownItems.map((item, index) => (
                                <React.Fragment key={item.key}>
                                    <div
                                        className={`px-4 py-2 text-sm ${item.textColor} hover:bg-gray-100 cursor-pointer font-medium`}
                                        onClick={item.onClick}
                                    >
                                        {item.label}
                                    </div>
                                    {index !== dropdownItems.length - 1 && (
                                        <hr className="border-gray-200 my-1 mx-2" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};
