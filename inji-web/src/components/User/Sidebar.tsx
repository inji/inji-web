import React, {useState} from 'react';
import {Location, useLocation, useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {isRTL} from '../../utils/i18n';
import {useSelector} from 'react-redux';
import {RootState} from '../../types/redux';
import {CollapseButton} from '../Common/Buttons/CollapseButton';
import {SidebarItemType} from "../../types/data";
import {ROUTES} from "../../utils/constants";

type SidebarItemProps = {
    icon: React.ReactNode;
    text: string;
    path: string;
    isActive: boolean;
    isCollapsed: boolean;
    disabled?: boolean;
};

export const SidebarItem: React.FC<SidebarItemProps> = ({
                                                     icon,
                                                     text,
                                                     path,
                                                     isActive,
                                                     isCollapsed,
                                                     disabled = false
                                                 }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const language = useSelector((state: RootState) => state.common.language);

    const handleClick = () => {
        if (!disabled) {
            // Pass the origin so destination pages (e.g. FAQ) can navigate back.
            navigate(path, {state: {from: location.pathname}});
        }
    };

    return (
        <div
            className={`relative flex items-center w-full h-12 transition-all duration-200 rounded-lg ${
                disabled 
                    ? 'cursor-not-allowed opacity-50' 
                    : 'cursor-pointer'
            } ${isRTL(language) ? 'pl-2' : 'pr-2'}`}
            onClick={handleClick}
        >
            <div
                className={`${
                    isCollapsed ? 'hidden sm:block' : 'block'
                } flex items-center justify-center p-2 rounded-lg shadow-[0_-0.5px_4px_-1px_rgba(0,0,0,0.078),_0_4px_4px_-1px_rgba(0,0,0,0.078)] ${
                    isRTL(language) ? 'mr-6 ml-4' : 'ml-6 mr-4'
                }`}
            >
                {icon}
            </div>

            {isActive && (
                <div
                    data-testid="active-indicator"
                    className={`${
                        isCollapsed ? 'hidden sm:block' : 'block'
                    } absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-[#2B011C] rounded-r-md ${
                        isRTL(language)
                            ? 'right-0 rounded-l-md rounded-r-none'
                            : 'left-0'
                    }`}
                />
            )}

            {!isCollapsed && (
                <span
                    className={`font-medium text-md ${
                        isActive ? 'text-[#2B011C]' : 'text-[#6F6F6F]'
                    } flex-1 truncate ${isRTL(language) ? 'text-right' : ''}`}
                >
                    {text}
                </span>
            )}
        </div>
    );
};

type SidebarProps = {
    disabled?: boolean;
    forceLeftPosition?: boolean;
    topOffset?: number;
};

export const Sidebar: React.FC<SidebarProps> = ({ disabled = false, forceLeftPosition = false, topOffset = 0 }) => {
    const {t} = useTranslation('User');
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const language = useSelector((state: RootState) => state.common.language);

    const toggleSidebar = () => {
        const newCollapsedState = !isCollapsed;
        setIsCollapsed(newCollapsedState);
    };

    const sidebarItems: SidebarItemType[] = [
        {
            // TODO: Can we avoid usage of ROUTES.USER_HOME linking in two places?
            icon: (
                <SideBarSvgIcon
                    outline="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
                    navUrl={ROUTES.USER_HOME}
                    location={location}
                />
            ),
            text: t('Home.title'),
            path: ROUTES.USER_HOME,
            key: 'Sidebar-Item-Home'
        },
        {
            icon: (
                <SideBarSvgIcon
                    outline="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M9 12H15M9 16H15"
                    navUrl={ROUTES.USER_ISSUERS}
                    location={location}
                />
            ),
            text: t('IssuersPage:containerHeading'),
            path: ROUTES.USER_ISSUERS,
            key: 'Sidebar-Item-Issuers'
        }
    ];

    return (
        <div
            data-testid="sidebar-container"
            className={`bg-white h-full transition-all duration-300 shadow-iw-sidebar flex flex-col items-start ${
                forceLeftPosition 
                    ? 'relative' 
                    : 'absolute z-30 sm:relative sm:w-64'
            } ${
                isRTL(language) ? 'right-0' : 'left-0'
            } ${isCollapsed ? 'w-5 sm:w-[96px]' : 'w-64'}`}
            style={
                forceLeftPosition
                    ? undefined
                    : { top: topOffset }
            }
        >
            <CollapseButton
                isCollapsed={isCollapsed}
                onClick={toggleSidebar}
                className={`absolute top-1/4 sm:top-9 p-2 z-10 ${
                    isRTL(language) ? 'left-[-20px]' : 'right-[-20px]'
                }`}
            />
            <div
                className={`flex flex-col space-y-2 mt-6 sm:mt-7 w-full ${
                    isRTL(language) ? 'pl-4' : 'pr-4'
                }`}
            >
                {sidebarItems.map((item) => (
                    <SidebarItem
                        key={item.key}
                        icon={item.icon}
                        text={item.text}
                        path={item.path}
                        isActive={location.pathname === item.path}
                        isCollapsed={isCollapsed}
                        disabled={disabled}
                    />
                ))}
            </div>

            <div
                data-testid="sidebar-faq"
                className={`mt-auto mb-6 w-full ${
                    isRTL(language) ? 'pl-4' : 'pr-4'
                }`}
            >
                <SidebarItem
                    icon={
                        <SideBarSvgIcon
                            outline="M8.228 9C8.777 7.835 10.258 7 12 7C14.21 7 16 8.343 16 10C16 11.4 14.722 12.575 12.994 12.907C12.452 13.011 12 13.448 12 14M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                            navUrl={ROUTES.USER_FAQ}
                            location={location}
                        />
                    }
                    text={t('ProfileDropdown.faq')}
                    path={ROUTES.USER_FAQ}
                    isActive={location.pathname === ROUTES.USER_FAQ}
                    isCollapsed={isCollapsed}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

type SideBarSvgIconProps = {
    outline: string;
    navUrl: string;
    location: Location;
}

const SideBarSvgIcon: React.FC<SideBarSvgIconProps> = ({outline, navUrl, location}) => {
    const getIconColor = (path: string, location: Location) => {
        return location.pathname === path
            ? 'var(--iw-color-dashboardSideBarMenuIconActive)'
            : 'var(--iw-color-dashboardSideBarMenuIcon)';
    };

    return <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d={outline}
            stroke={getIconColor(navUrl, location)}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
};
