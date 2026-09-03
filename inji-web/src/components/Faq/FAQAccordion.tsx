import React, {useState} from "react";
import {FAQAccordionItem} from "./FAQAccordionItem";
import {useTranslation} from "react-i18next";
import { constructContent } from "../../utils/builder";
import {FAQAccordionItemType} from '../../types/data';

export const FAQAccordion: React.FC = () =>{
    
    const [open, setOpen] = useState(0);
    const {t} = useTranslation("FAQ");

    const itemConfig = [
        { n: 1,  descCount: 1 },
        { n: 2,  descCount: 1 },
        { n: 3,  descCount: 3 },
        { n: 4,  descCount: 1 },
        { n: 5,  descCount: 1 },
        { n: 6,  descCount: 1 },
        { n: 7,  descCount: 4 },
        { n: 8,  descCount: 5 },
        { n: 9,  descCount: 1 },
        { n: 10, descCount: 1 },
        { n: 11, descCount: 4 },
        { n: 12, descCount: 1 },
        { n: 13, descCount: 2 },
        { n: 14, descCount: 1 },
        { n: 15, descCount: 1 },
        { n: 16, descCount: 1 },
        { n: 17, descCount: 1 },
        { n: 18, descCount: 3 },
        { n: 19, descCount: 1 },
        { n: 20, descCount: 1 },
        { n: 21, descCount: 1, applyHtml: true },
        { n: 22, descCount: 1, applyHtml: true },
        { n: 23, descCount: 3 },
    ];

    const accordionItems: FAQAccordionItemType[] = itemConfig.map(
        ({ n, descCount, applyHtml = false }) => {
            const key = `item${n}`;
            const descriptions = Array.from({ length: descCount }, (_, i) =>
                t(`${key}.description${i + 1}`)
            );
            return {
                key,
                title: t(`${key}.title`),
                content: constructContent(descriptions, applyHtml)
            };
        }
    );

    return (
        <React.Fragment>
            <div data-testid="Faq-Accordion-Container">
                {accordionItems.map((item, index) => (
                    <FAQAccordionItem
                        id={index}
                        key={item.key}
                        title={item.title}
                        content={item.content}
                        open={open}
                        setOpen={setOpen}
                    />))
                }
            </div>
        </React.Fragment>
    );
};
