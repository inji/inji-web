import React from "react";
import {FAQAccordionItemProps} from "../../types/components";
import {IoIosArrowDown, IoIosArrowUp} from "react-icons/io";
import {renderContent} from "../../utils/builder";

export const FAQAccordionItem: React.FC<FAQAccordionItemProps> = (props) => {
    const isOpen = props.id === props.open;

    return (
        <div
            className="w-full rounded-md mb-4 transition-all duration-300 bg-white shadow-[-1px_-0.5px_6px_rgba(0,0,0,0.07),1px_4px_6px_rgba(0,0,0,0.07)]"
            data-testid="Faq-Item-Container"
        >
            <button
                data-testid="Faq-Item-Title-Button"
                className={`w-full px-4 sm:px-6 py-6 sm:py-8 text-left font-semibold text-base sm:text-lg text-iw-title flex justify-between items-center hover:bg-iw-faqAccordionHover ${
                    isOpen ? 'hover:rounded-t-md' : 'hover:rounded-md'
                } focus:outline-none transition-colors`}
                onClick={() => props.setOpen(isOpen ? -1 : props.id)}
            >
                <span data-testid="Faq-Item-Title-Text" className="text-[16px] leading-[32px] font-bold">{props.title}</span>
                <span className="ml-2 sm:ml-4">
                    {isOpen ? (
                        <IoIosArrowUp
                            size={18}
                            className="sm:size-[20px]"
                            color="#04051D"
                            data-testid="Faq-Item-UpArrow"
                        />
                    ) : (
                        <IoIosArrowDown
                            size={18}
                            className="sm:size-[20px]"
                            color="#04051D"
                            data-testid="Faq-Item-DownArrow"
                        />
                    )}
                </span>
            </button>

            {isOpen && (
                <div className="bg-iw-background rounded-b-md">
                    <div className="px-4 sm:px-6">
                        <div
                            className="border-t border-gray-200 py-5 sm:py-6 text-sm sm:text-base text-iw-title leading-relaxed"
                            data-testid="Faq-Item-Content-Text"
                        >
                            {props.content.map((content) => (
                                <p key={props.key} className="mb-3 last:mb-0 text-[14px] leading-[20px]">
                                    {renderContent(content)}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
