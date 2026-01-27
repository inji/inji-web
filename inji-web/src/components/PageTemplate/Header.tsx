import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {LanguageSelector} from '../Common/LanguageSelector';
import {GiHamburgerMenu} from 'react-icons/gi';
import OutsideClickHandler from 'react-outside-click-handler';
import {RootState} from '../../types/redux';
import {useSelector} from 'react-redux';
import {isRTL} from '../../utils/i18n';
import { PlainButton } from '../Common/Buttons/PlainButton';
import {ROUTES} from "../../utils/constants";

type HeaderProps = {
    headerRef: React.RefObject<HTMLDivElement>;
};

export const Header: React.FC<HeaderProps> = ({headerRef}) => {
    const language = useSelector((state: RootState) => state.common.language);
    const {t} = useTranslation('PageTemplate');
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <header
            ref={headerRef}
            className="fixed top-0 left-0 right-0 bg-iw-background py-7 z-10 shadow-[0_4px_5px_0_rgba(0,0,0,0.051)]"
        >
            <div
                data-testid="Header-Container"
                className="w-full px-4 flex justify-between items-center"
            >
                <div
                    data-testid="Header-InjiWeb-Logo-Container"
                    className={`flex flex-row ${
                        isRTL(language) ? 'space-x-reverse' : 'space-x-9'
                    } justify-center items-center`}
                >
                    <div
                        role="button"
                        tabIndex={0}
                        className={`sm:hidden ${
                            isRTL(language) ? 'ml-4' : ''
                        }`}
                        onMouseDown={() => setIsOpen((open) => !open)}
                        onKeyUp={() => setIsOpen((open) => !open)}
                    >
                        <GiHamburgerMenu size={32} />
                    </div>
                    <div
                        role={'button'}
                        tabIndex={0}
                        onMouseDown={() => navigate(ROUTES.ROOT)}
                        onKeyUp={() => navigate(ROUTES.ROOT)}
                    >
                        <img
                            src={require('../../assets/InjiWebLogo.png')}
                            className={`h-6 w-36 flex-shrink-0 sm:h-8 sm:w-48 cursor-pointer
                                ${isRTL(language) ? 'mr-4' : ''}`}
                            data-testid="Header-InjiWeb-Logo"
                            alt="Inji Web Logo"
                        />
                    </div>
                </div>

                <div
                    className="flex flex-row space-x-4"
                    data-testid="Header-FAQ-LanguageSelector-Container"
                >
                    <div className="hidden sm:block">
                        <PlainButton
                            fullWidth={true}
                            onClick={() => navigate(ROUTES.FAQ)}
                            testId="Header-Menu-FAQ"
                            title={t('Header.faq')}
                            disableGradient={true}
                        />
                    </div>
                    <LanguageSelector data-testid="Header-Menu-LanguageSelector" />
                </div>
            </div>
            {isOpen && (
                <OutsideClickHandler onOutsideClick={() => setIsOpen(false)}>
                    <div
                        className="w-full sm:hidden px-4 flex flex-col justify-start items-start font-semibold"
                        role="button"
                        tabIndex={0}
                        onMouseDown={() => setIsOpen(false)}
                        onBlur={() => setIsOpen(false)}
                    >
                        <div
                            data-testid="Header-Menu-Faq"
                            role="button"
                            tabIndex={0}
                            onKeyUp={() => {
                                navigate(ROUTES.FAQ);
                                setIsOpen(false);
                            }}
                            onMouseDown={() => {
                                navigate(ROUTES.FAQ);
                                setIsOpen(false);
                            }}
                            className="text-iw-title cursor-pointer py-5 w-full inline-block"
                        >
                            {t('Header.faq')}
                        </div>
                    </div>
                </OutsideClickHandler>
            )}
        </header>
    );
};
