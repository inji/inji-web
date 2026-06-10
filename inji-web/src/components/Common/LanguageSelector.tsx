import React, {useState} from "react";
import {VscGlobe} from "react-icons/vsc";
import {isRTL, LanguagesSupported, switchLanguage} from "../../utils/i18n";
import {useDispatch, useSelector} from "react-redux";
import {storeLanguage} from "../../redux/reducers/commonReducer";
import {RootState} from "../../types/redux";
import {FaCheck} from "react-icons/fa6";
import {GradientWrapper} from './GradientWrapper';
import DropdownArrowIcon from './DropdownArrowIcon';

export const LanguageSelector: React.FC<{ "data-testid"?: string }> = ({ "data-testid": testId }) => {
    const dispatch = useDispatch();
    let language = useSelector((state: RootState) => state.common.language);
    language = language ?? window._env_.DEFAULT_LANG;
    const [isOpen, setIsOpen] = useState(false);

    interface DropdownItem {
        label: string;
        value: string;
    }

    const handleChange = (item: DropdownItem) => {
        setIsOpen(false);
        switchLanguage(item.value);
        dispatch(storeLanguage(item.value));
    }

    return <div className={"flex flex-row justify-center items-center"}
                data-testid={testId ?? "LanguageSelector-Outer-Div"} 
                onBlur={(e)=>{
                    // relatedTarget = where focus is going. If it's still inside this
                    // component, don't close — only close when focus truly leaves.
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setIsOpen(false);
                    }
                }}
                tabIndex={0}
                role="button">
        

        <div className="relative inline-block ms-1 ml-3">
            <button
                type="button"
                className="flex flex-row items-center w-full h-[3rem] px-2 rounded-xl border border-gray-200 bg-white shadow-sm font-semibold focus:outline-none"
                data-testid={"Language-Selector-Button"}
                onMouseDown={() => setIsOpen(open => !isOpen)}>
            
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

            {isOpen && (
                <div
                    className={`absolute w-60 z-40 ${isRTL(language) ? "left-0" : "right-0"} mt-2 rounded-xl shadow-lg bg-iw-background overflow-hidden font-normal border border-gray-200`}>
                    <ul className="py-1">
                        {LanguagesSupported.map((item) => (
                            <li key={item.value}
                                data-testid={`Language-Selector-DropDown-Item-${item.value}`}>
                                <button
                                    type="button"
                                    className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between flex-row
                                        ${language === item.value
                                        ? "bg-iw-dropdownActiveBg text-iw-primary font-semibold"
                                        : "text-iw-dropdownText hover:bg-iw-dropdownActiveBg hover:text-iw-primary"} transition-colors`}
                                    onMouseDown={(event) => {event.stopPropagation();handleChange(item)}}>
                                    {language === item.value ? <span className="text-iw-primary font-semibold">{item.label}</span> : item.label}
                                    {language === item.value && <FaCheck className="text-iw-primary" /> }
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </div>
}