/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
    darkMode: 'selector',
    content: ['./src/**/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            screens: {
                'sm-md': {min: '640px', max: '1024px'},
                '3xl': '1800px',
            },
            fontFamily: {
                base: 'var(--iw-font-montserrat)',
                montserrat: 'var(--iw-font-montserrat)'
            },
            fontSize: {
                'sm-plus': '15px',
                '2xl-plus': '28px',
            },
            zIndex: {
                '50': '50',
                '40': '40',
                '30': '30'
            },
            colors: {
                iw: {
                    background: 'var(--iw-color-background)',
                    header: 'var(--iw-color-header)',
                    footer: 'var(--iw-color-footer)',
                    title: 'var(--iw-color-title)',
                    subTitle: 'var(--iw-color-subTitle)',
                    searchTitle: 'var(--iw-color-searchTitle)',
                    primary: 'var(--iw-color-primary)',
                    secondary: 'var(--iw-color-secondary)',
                    tertiary: 'var(--iw-color-tertiary)',
                    lightPrimary: 'var(--iw-color-lightPrimary)',
                    lightSecondary: 'var(--iw-color-lightSecondary)',
                    faqAccordionHover: 'var(--iw-color-faqAccordionHover)',
                    shadow: 'var(--iw-color-shadow)',
                    selectedShadow: 'var(--iw-color-selected-shadow)',
                    spinningLoaderPrimary:
                        'var(--iw-color-spinningLoaderPrimary)',
                    spinningLoaderSecondary:
                        'var(--iw-color-spinningLoaderSecondary)',
                    navigationBar: 'var(--iw-color-navigationBar)',
                    languageGlobeIcon: 'var(--iw-color-languageGlobeIcon)',
                    languageArrowIcon: 'var(--iw-color-languageArrowIcon)',
                    languageCheckIcon: 'var(--iw-color-languageCheckIcon)',
                    closeIcon: 'var(--iw-color-closeIcon)',
                    searchIcon: 'var(--iw-color-searchIcon)',
                    tileBackground: 'var(--iw-color-tileBackground)',
                    shieldSuccessIcon: 'var(--iw-color-shieldSuccessIcon)',
                    shieldErrorIcon: 'var(--iw-color-shieldErrorIcon)',
                    shieldLoadingIcon: 'var(--iw-color-shieldLoadingIcon)',
                    shieldSuccessShadow: 'var(--iw-color-shieldSuccessShadow)',
                    shieldErrorShadow: 'var(--iw-color-shieldErrorShadow)',
                    shieldLoadingShadow: 'var(--iw-color-shieldLoadingShadow)',
                    backDrop: 'var(--iw-color-backDrop)',
                    borderLight: 'var(--iw-color-borderLight)',
                    borderDark: 'var(--iw-color-borderDark)',
                    arrowDown: 'var(--iw-color-arrowDown)',
                    hoverBackGround: 'var(--iw-color-hoverBackGround)',
                    text: 'var(--iw-color-text)',
                    subText: 'var(--iw-color-subText)',
                    disclaimerBackGround:
                        'var(--iw-color-disclaimerBackGround)',
                    disclaimerText: 'var(--iw-color-disclaimerText)',
                    textSecondary: 'var(--iw-color-textSecondary)',
                    textTertiary: 'var(--iw-color-textTertiary)',
                    grayLight: 'var(--iw-color-grayLight)',
                    grayMedium: 'var(--iw-color-grayMedium)',
                    darkRed: 'var(--iw-color-darkRed)',
                    brightRed: 'var(--iw-color-brightRed)',
                    red: `var(--iw-color-red)`,
                    deepVioletIndigo: 'var(--iw-color-deepVioletIndigo)',
                    pink50: 'var(--iw-color-pink50)',
                    darkGrayishBlue: 'var(--iw-color-darkGrayishBlue)',
                    paleGray: 'var(--iw-color-paleGray)',
                    avatarPlaceholder: 'var(--iw-color-avatarPlaceholder)',
                    avatarText: 'var(--iw-color-avatarText)',
                    darkgreen: 'var(--iw-color-darkGreen)',
                    disabled: 'var(--iw-color-disabled)',
                    dropdownActiveBg: 'var(--iw-color-dropdown-active-bg)',
                    dropdownText: 'var(--iw-color-dropdown-text)',
                    borderGrayLight: 'var(--iw-color-borderGrayLight)',
                    lightGrayBg: 'var(--iw-color-lightGrayBg)',
                    mediumGrayText: 'var(--iw-color-mediumGrayText)',
                    lightGrayBorder: 'var(--iw-color-lightGrayBorder)',
                    successBg: 'var(--iw-color-successBg)',
                    successText: 'var(--iw-color-successText)',
                    consentDescription: 'var(--iw-color-consentDescription)'
                }
            },
            boxShadow: {
                'iw': '0 3px 8px rgba(24, 71, 147, 0.15)',
                'iw-hover': '0 5px 8px rgba(24, 71, 147, 0.2)',
                'iw-sidebar': '2px 0 8px rgb(0,0,0,0.051)',
                'iw-pin-page-container': `0px 4px 8px rgba(16, 24, 40, 0.1), -0px -0.01px 0.5px rgba(16, 24, 40, 0.1)`,
                'iw-layout': `0px -2px 4px -2px rgba(16, 24, 40, 0.06), 0px 4px 8px -2px rgba(16, 24, 40, 0.10)`,
                'iw-hamburger-dropdown': `0px 3px 6px rgb(0,0,0,0.07), 0px -1px 6px rgb(0,0,0,0.07)`
            },
            backgroundImage: {
                'credential-share-card': 'url("./assets/credentialShareCardBG.png")',
                'selected-credential-info-tile':
                    'linear-gradient(90deg, rgba(255, 83, 0, 0.1) 0%, rgba(251, 81, 3, 0.1) 16%, rgba(240, 76, 15, 0.1) 31%, rgba(222, 67, 34, 0.1) 46%, rgba(197, 54, 60, 0.1) 61%, rgba(164, 38, 95, 0.1) 75%, rgba(124, 19, 137, 0.1) 90%, rgba(91, 3, 173, 0.1) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
                'selected-credential-check-icon':
                    'linear-gradient(90deg, #FF5300 0%, #FB5103 16%, #F04C0F 31%, #DE4322 46%, #C5363C 61%, #A4265F 75%, #7C1389 90%, #5B03AD 100%)',
                'iw-brand-horizontal': 'var(--iw-gradient-brand-horizontal)'
            }
        }
    },
    plugins: [
        require('tailwindcss-rtl'),
        plugin(function ({addComponents}) {
            addComponents({
                '.pin-input-box-style': {
                    width: '2.37rem',
                    height: '2.25rem',
                    textAlign: 'center',
                    borderRadius: '0.5rem',
                    fontSize: '1.125rem',
                    '@screen sm': {
                        width: '3.1rem',
                        height: '2.94rem',
                        fontSize: '1.25rem'
                    }
                },
                '.pin-input-box-border': {
                    border: '1.81px solid var(--iw-color-grayLight)'
                },
                '.pin-input-focus-box-border': {
                    border: '1.81px solid var(--iw-color-grayDark)'
                },
                '.pin-page-warning-text-border': {
                    border: '0.8px solid var(--iw-color-grayTransparent)'
                }
            });
        })
    ]
};
