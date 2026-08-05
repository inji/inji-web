import React from "react";
import {SolidButtonStyles} from "./SolidButtonStyles";

export const SolidButton: React.FC<SolidButtonProps> = ({iconTwo, ...props}) => {
    return <div className={props.fullWidth ? "w-full" : ""}>
        <button
            data-testid={props.testId}
            className={`${SolidButtonStyles.baseStyles} ${!props.disabled && 'hover:shadow-lg cursor-pointer'} ${props.disabled ? 'bg-gray-400 cursor-not-allowed' : ' bg-gradient-to-r from-iw-primary to-iw-secondary hover:bg-none hover:bg-[#E64E4E] hover:text-white'} ${props.className || ''}`}
            disabled={props.disabled}
            onClick={!props.disabled ? props.onClick : undefined}>
            <div className={"flex items-center justify-center gap-1.5 md:gap-1"}>
                {props.icon && <span>{props.icon}</span>}
                <span>{props.title}</span>
                {iconTwo && <span>{iconTwo}</span>}
            </div>
        </button>
    </div>
}

export type SolidButtonProps = {
    fullWidth?: boolean | false;
    testId: string;
    onClick: (() => void) | undefined;
    title: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    className?: string;
    iconTwo?: React.ReactNode;
}
