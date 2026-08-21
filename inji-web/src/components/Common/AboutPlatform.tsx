import React, {useCallback, useState} from "react";
import ReactDOM from "react-dom";
import {useTranslation} from "react-i18next";
import {FiInfo, FiDownload, FiLock, FiShare2, FiCheck, FiX} from "react-icons/fi";
import {Clickable} from "./Clickable";
import {useModalDialog} from "../../hooks/useModalDialog";

type Step = {
    key: string;
    icon: React.ReactNode;
    iconBg: string;
};

const steps: Step[] = [
    {key: "receive", icon: <FiDownload size={20} className="text-white" />, iconBg: "bg-iw-primary"},
    {key: "store", icon: <FiLock size={20} className="text-white" />, iconBg: "bg-iw-tertiary"},
    {key: "share", icon: <FiShare2 size={20} className="text-white" />, iconBg: "bg-iw-secondary"}
];

export const AboutPlatform: React.FC<{ "data-testid"?: string }> = ({ "data-testid": testId }) => {
    const {t} = useTranslation("AboutPlatform");
    const [isOpen, setIsOpen] = useState(false);
    const closeModal = useCallback(() => setIsOpen(false), []);
    const dialogRef = useModalDialog<HTMLDivElement>(isOpen, closeModal);

    const highlights = ["encryption", "offline", "ownership"];
    const credentialTypes = [
        "nationalIds",
        "driversLicenses",
        "professionalLicenses",
        "passports",
        "insuranceCards",
        "diplomas"
    ];

    return (
        <React.Fragment>
            <button
                type="button"
                data-testid={testId ?? "About-Platform-Button"}
                onClick={() => setIsOpen(true)}
                className="flex flex-row items-center gap-2 h-[3rem] px-5 rounded-xl text-white font-semibold shadow-sm
                           bg-gradient-to-r from-iw-primary to-iw-secondary focus:outline-none whitespace-nowrap">
                <FiInfo size={18} />
                {t("button")}
            </button>

            {isOpen && ReactDOM.createPortal(
                <Clickable
                    className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex justify-center items-center p-4"
                    onClick={closeModal}
                    testId="About-Platform-Modal">
                    <div
                        ref={dialogRef}
                        tabIndex={-1}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="About-Platform-Modal-Title"
                        className="relative bg-iw-background rounded-3xl shadow-2xl w-full max-w-[1040px] max-h-[90vh] overflow-y-auto
                                   flex flex-col md:flex-row"
                        onClick={(event) => event.stopPropagation()}>

                        <button
                            type="button"
                            data-testid="About-Platform-Modal-Close-Button"
                            aria-label={t("close")}
                            onClick={closeModal}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full text-white/90 bg-black/20 hover:bg-black/30
                                       focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2">
                            <FiX size={20} />
                        </button>

                        {/* Left gradient hero panel */}
                        <div className="md:w-1/2 min-w-0 p-8 sm:p-10 text-white flex flex-col break-words bg-gradient-to-r from-iw-primary from-[65%] via-iw-tertiary via-[85%] to-iw-secondary">
                            <h2
                                id="About-Platform-Modal-Title"
                                data-testid="About-Platform-Modal-Title"
                                className="mt-12 sm:mt-16 text-[28px] sm:text-[34px] font-bold leading-[1.2] font-montserrat">
                                {t("hero.title")}
                            </h2>
                            <p className="mt-5 text-[15px] sm:text-[17px] leading-relaxed font-light text-white/90 font-montserrat">
                                {t("hero.subTitle")}
                            </p>

                            <ul className="mt-14 space-y-6">
                                {highlights.map((key) => (
                                    <li key={key} className="flex items-center gap-4 text-[15px] sm:text-[17px] text-white">
                                        <span className="flex w-6 h-6 shrink-0 items-center justify-center rounded-full bg-white/30">
                                            <FiCheck size={14} strokeWidth={3} className="text-white" />
                                        </span>
                                        {t(`hero.highlights.${key}`)}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto pt-10">
                                <div className="bg-white rounded-2xl p-5 sm:p-6 text-iw-title">
                                    <p className="text-[11px] sm:text-[12px] font-normal uppercase text-black">
                                        {t("hero.compatibility.label")}
                                    </p>
                                    <p className="text-[15px] sm:text-[16px] font-medium leading-tight mb-5 text-iw-title">
                                        {t("hero.compatibility.title")}
                                    </p>
                                    <div className="grid grid-cols-[repeat(3,minmax(0,auto))] gap-2">
                                        {credentialTypes.map((key) => (
                                            <span
                                                key={key}
                                                className="flex w-full min-w-0 rounded-full p-[1.5px] bg-gradient-to-r from-iw-primary/60 to-iw-secondary/60">
                                                <span className="flex w-full min-w-0 items-center justify-center rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-neutral-700 text-center leading-tight break-words">
                                                    {t(`hero.compatibility.types.${key}`)}
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right "how it works" panel */}
                        <div className="md:w-1/2 min-w-0 p-8 sm:p-10 break-words">
                            <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-iw-dropdownText mb-8">
                                {t("howItWorks.label")}
                            </p>
                            <div>
                                {steps.map((step, index) => (
                                    <div key={step.key} className="relative flex gap-5 pb-10 last:pb-0">
                                        {index < steps.length - 1 && (
                                            <span className="absolute left-6 top-14 bottom-2 w-px bg-gray-200" />
                                        )}
                                        <div className={`relative shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${step.iconBg}`}>
                                            {step.icon}
                                        </div>
                                        <div className="pt-1">
                                            <h3 className="text-[17px] font-bold text-iw-title font-montserrat">
                                                {t(`howItWorks.steps.${step.key}.title`)}
                                            </h3>
                                            <p className="mt-2 text-[14px] leading-relaxed font-light text-iw-dropdownText font-montserrat">
                                                {t(`howItWorks.steps.${step.key}.description`)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Clickable>,
                document.body
            )}
        </React.Fragment>
    );
};
