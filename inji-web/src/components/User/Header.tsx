import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {LanguageSelector} from '../Common/LanguageSelector';
import {AboutPlatform} from '../Common/AboutPlatform';
import {api} from '../../utils/api';
import {toast} from 'react-toastify';
import {useUser} from '../../hooks/User/useUser';
import HamburgerMenu from '../../assets/HamburgerMenu.svg';
import {isRTL} from '../../utils/i18n';
import {useSelector} from 'react-redux';
import {RootState} from '../../types/redux';
import {useTranslation} from 'react-i18next';
import DropdownArrowIcon from '../Common/DropdownArrowIcon';
import {MdLogout, MdOutlineAccountCircle} from 'react-icons/md';
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
    disableProfileDropdown?: boolean;
    disableLogoNavigation?: boolean;
};

export const Header: React.FC<UserHeaderProps> = ({
    headerRef,
    headerHeight,
    disableProfileDropdown = false,
    disableLogoNavigation = false,
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
    const mobileMenuRef = useRef<HTMLDivElement>(null);
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

            // The icon, the menu it opens, and any dialog that menu renders
            // through a portal are one interaction region. hamburgerMenuRef is
            // the <img> alone, so without the other two checks a click on a
            // menu item - or anywhere in the portaled AboutPlatform modal -
            // counted as outside and unmounted the modal.
            const insideIcon = hamburgerMenuRef.current?.contains(target);
            const insideMenu = mobileMenuRef.current?.contains(target);
            const insideDialog =
                target instanceof Element && target.closest('[role="dialog"]') !== null;

            if (!insideIcon && !insideMenu && !insideDialog) {
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
        } catch {
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
            key: 'Profile-Dropdown-Profile',
            icon: <MdOutlineAccountCircle size={18}/>
        },
        {
            label: t('ProfileDropdown.logout'),
            onClick: handleLogout,
            textColor: 'text-red-700',
            key: 'Profile-Dropdown-Logout',
            icon: <MdLogout size={18}/>
        }
    ];

    const toggleProfileDropdown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation(); // Prevent global click handler from immediately closing the dropdown
        if (disableProfileDropdown) return;
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

        if (!user) {
            return null;
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
              {displayName && (
                <span className="font-semibold text-gray-800">
                  {convertStringIntoPascalCase(displayName)}
                </span>
              )}
            </div>
          );
        };

    const handleLogoNavigate = () => {
        if (disableLogoNavigation) {
            return;
        }
        navigateToUserHome(navigate);
    };

    const handleLogoKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disableLogoNavigation) {
            return;
        }
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            navigateToUserHome(navigate);
        }
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
                        className={`w-[130px] sm:w-[160px] md:w-[170px] ${
                            disableLogoNavigation ? "" : "cursor-pointer"
                        }`}
                        role={disableLogoNavigation ? "img" : "button"}
                        tabIndex={disableLogoNavigation ? undefined : 0}
                        onClick={
                            disableLogoNavigation ? undefined : handleLogoNavigate
                        }
                        onKeyDown={
                            disableLogoNavigation ? undefined : handleLogoKeyDown
                        }
                        aria-disabled={disableLogoNavigation || undefined}
                    >
                        <img
                            src={require('../../assets/InjiWebLogo.png')}
                            className={`max-w-full h-auto object-contain ${
                                disableLogoNavigation ? "" : "cursor-pointer"
                            } ${isRTL(language) ? 'mr-4' : ''}`}
                            data-testid="header-injiWeb-logo"
                            alt="Inji Web Logo"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="hidden sm:block">
                        <AboutPlatform data-testid="header-about-platform" />
                    </div>
                    <LanguageSelector />

                    {(isLoading || user) && (
                    <div
                        data-testid="profile-details"
                        className="hidden sm:block relative"
                        ref={dropdownRef}
                    >
                        <div className="flex items-center space-x-2">
                            {getUserProfileIconWithName()}
                            {!isLoading && user && !disableProfileDropdown && (
                                <div
                                className="relative inline-block cursor-pointer"
                                onClick={toggleProfileDropdown}
                                >
                                <DropdownArrowIcon isOpen={isProfileDropdownOpen} />
                                </div>
                            )}
                        </div>

                        {isProfileDropdownOpen && !disableProfileDropdown && (
                            <div
                                data-testid="profile-dropdown"
                                className="absolute -right-7 top-100 mt-8 w-56 bg-white rounded-lg shadow-lg z-50 font-medium"
                            >
                                <div className="absolute top-[-0.3rem] right-8 w-3 h-3 bg-white transform rotate-45" />
                                <div className="py-2">
                                    {dropdownItems.map((item) => (
                                        <button
                                            key={item.key}
                                            type="button"
                                            className={`w-full text-left px-4 py-3 text-sm ${item.textColor} cursor-pointer hover:bg-iw-dropdownActiveBg hover:text-iw-primary flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-iw-primary focus-visible:ring-inset`}
                                            onClick={item.onClick}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    )}
                </div>
            </div>
            <div
                data-testid="hamburger-menu-dropdown"
                className="block sm:hidden w-full"
            >
                {isHamburgerMenuOpen && (isLoading || user) && (
                    <div
                        ref={mobileMenuRef}
                        style={{marginTop: headerHeight}}
                        className="absolute top-1 bg-white shadow-iw-hamburger-dropdown p-2 w-full"
                    >
                        <div>
                            <div className="flex items-center px-4 py-2">
                                {getUserProfileIconWithName()}
                            </div>
                            <div className="px-4 py-2">
                                <AboutPlatform data-testid="header-mobile-about-platform" />
                            </div>
                            {!disableProfileDropdown && user && dropdownItems.map((item, index) => (
                                <React.Fragment key={item.key}>
                                    <button
                                        type="button"
                                        className={`w-full text-left px-4 py-2 text-sm ${item.textColor} hover:bg-gray-100 cursor-pointer font-medium flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-iw-primary focus-visible:ring-inset`}
                                        onClick={item.onClick}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </button>
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
