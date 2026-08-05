import React from "react";
import {IconProps} from "../../../types/components";

export function DownloadIcon({gradient = false, style, testId, ...props}: IconProps) {
    if (gradient) {
        return <GradientDownloadIcon/>
    }

    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={"currentColor"}
            xmlns="http://www.w3.org/2000/svg"
            style={style}
            aria-label="icon-download"
            data-testid={testId}
            {...props}
        >
            <path
                d="M12 15.7885L7.73075 11.5192L8.78475 10.4348L11.25 12.9V4.5H12.75V12.9L15.2153 10.4348L16.2693 11.5192L12 15.7885ZM6.30775 19.5C5.80258 19.5 5.375 19.325 5.025 18.975C4.675 18.625 4.5 18.1974 4.5 17.6923V14.9808H6V17.6923C6 17.7692 6.03208 17.8398 6.09625 17.9038C6.16025 17.9679 6.23075 18 6.30775 18H17.6923C17.7692 18 17.8398 17.9679 17.9038 17.9038C17.9679 17.8398 18 17.7692 18 17.6923V14.9808H19.5V17.6923C19.5 18.1974 19.325 18.625 18.975 18.975C18.625 19.325 18.1974 19.5 17.6923 19.5H6.30775Z"
            />
        </svg>
    );
}

const GradientDownloadIcon = () => {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M9 13.5462L3.8769 8.4231L5.1417 7.1217L8.1 10.08V0H9.9V10.08L12.8583 7.1217L14.1231 8.4231L9 13.5462ZM2.1693 18C1.5631 18 1.05 17.79 0.63 17.37C0.21 16.95 0 16.4369 0 15.8307V12.5769H1.8V15.8307C1.8 15.9231 1.8385 16.0077 1.9155 16.0845C1.9923 16.1615 2.0769 16.2 2.1693 16.2H15.8307C15.9231 16.2 16.0077 16.1615 16.0845 16.0845C16.1615 16.0077 16.2 15.9231 16.2 15.8307V12.5769H18V15.8307C18 16.4369 17.79 16.95 17.37 17.37C16.95 17.79 16.4369 18 15.8307 18H2.1693Z"
                fill="url(#paint0_linear_862_1366)"/>
            <defs>
                <linearGradient id="paint0_linear_862_1366" x1="0" y1="9" x2="18" y2="9" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF5300"/>
                    <stop offset="0.16" stopColor="#FB5103"/>
                    <stop offset="0.31" stopColor="#F04C0F"/>
                    <stop offset="0.46" stopColor="#DE4322"/>
                    <stop offset="0.61" stopColor="#C5363C"/>
                    <stop offset="0.75" stopColor="#A4265F"/>
                    <stop offset="0.9" stopColor="#7C1389"/>
                    <stop offset="1" stopColor="#5B03AD"/>
                </linearGradient>
            </defs>
        </svg>
    );
};
