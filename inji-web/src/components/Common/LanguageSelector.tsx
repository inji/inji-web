import React, {useState} from "react";
import ReactDOM from "react-dom";
import {VscGlobe} from "react-icons/vsc";
import {useTranslation} from "react-i18next";
import {LanguagesSupported, switchLanguage} from "../../utils/i18n";
import {useDispatch, useSelector} from "react-redux";
import {storeLanguage} from "../../redux/reducers/commonReducer";
import {RootState} from "../../types/redux";
import {LanguageObject} from "../../types/data";
import {GradientWrapper} from './GradientWrapper';
import {Clickable} from './Clickable';
import DropdownArrowIcon from './DropdownArrowIcon';

export const LanguageSelector: React.FC<{ "data-testid"?: string }> = ({ "data-testid": testId }) => {
    const dispatch = useDispatch();
    const {t} = useTranslation('LanguageSelector');
    let language = useSelector((state: RootState) => state.common.language);
    language = language ?? window._env_.DEFAULT_LANG;
    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (item: LanguageObject) => {
        setIsOpen(false);
        switchLanguage(item.value);
        dispatch(storeLanguage(item.value));
    }

    return <div className={"flex flex-row justify-center items-center"}
                data-testid={testId ?? "LanguageSelector-Outer-Div"}>

        <div className="inline-block ms-1 ml-3">
            <button
                type="button"
                className="flex flex-row items-center w-full h-[3rem] px-2 rounded-xl border border-gray-200 bg-white shadow-sm font-semibold focus:outline-none"
                data-testid={"Language-Selector-Button"}
                onClick={() => setIsOpen(true)}>

                <GradientWrapper>
                    <VscGlobe
                    data-testid="Language-Selector-Icon"
                    size={30} color={'var(--iw-color-languageGlobeIcon)'} className="mr-3" />
                </GradientWrapper>

                <span className="flex-1 text-iw-languageArrowIcon font-normal text-left pr-2">
                        {LanguagesSupported.find(lang => lang.value === language)?.label}
                </span>
                <DropdownArrowIcon isOpen={isOpen} />

            </button>
        </div>

        {isOpen && ReactDOM.createPortal(
            <Clickable
                className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex justify-center items-center p-4"
                onClick={() => setIsOpen(false)}
                testId="Language-Selector-Modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="Language-Selector-Modal-Title">
                <div
                    className="bg-iw-background rounded-2xl shadow-2xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto p-6 sm:p-10"
                    onClick={(event) => event.stopPropagation()}>

                    <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
                        <GradientWrapper>
                            <VscGlobe size={48} color={'var(--iw-color-languageGlobeIcon)'} />
                        </GradientWrapper>
                        <h2
                            id="Language-Selector-Modal-Title"
                            data-testid="Language-Selector-Modal-Title"
                            className="mt-4 text-[20px] sm:text-[24px] font-semibold text-iw-title font-montserrat">
                            {t('title')}
                        </h2>
                        <p className="mt-1 text-[14px] sm:text-[16px] text-iw-dropdownText font-montserrat font-light">
                            {t('subTitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {LanguagesSupported.map((item) => {
                            const isSelected = language === item.value;
                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    data-testid={`Language-Selector-Modal-Item-${item.value}`}
                                    aria-pressed={isSelected}
                                    onClick={() => handleChange(item)}
                                    className={`flex flex-col items-center justify-center text-center rounded-xl border px-3 py-5 sm:py-6 transition-colors
                                        ${isSelected
                                        ? "border-iw-primary bg-iw-dropdownActiveBg text-iw-primary"
                                        : "border-gray-200 text-iw-dropdownText hover:border-iw-primary hover:bg-iw-dropdownActiveBg hover:text-iw-primary"}`}>
                                    <span className="font-semibold text-[16px] sm:text-[18px]">{item.label}</span>
                                    {item.englishName && (
                                        <span className="text-[13px] sm:text-[14px] font-normal mt-1">
                                            ({item.englishName})
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </Clickable>,
            document.body
        )}
    </div>
}
