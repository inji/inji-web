import React from "react";
import {IoInformationCircleOutline} from "react-icons/io5";

export function StatusInformationButton(props: Readonly<{
    testId: string;
    label: string;
    open: boolean;
    describedBy?: string;
    buttonRef: React.Ref<HTMLButtonElement>;
    className?: string;
    onClick: (event: React.SyntheticEvent) => void;
    onMouseDown: (event: React.SyntheticEvent) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}>) {
    return (
        <button
            ref={props.buttonRef}
            type="button"
            className={props.className}
            aria-label={props.label}
            aria-expanded={props.open}
            aria-describedby={props.describedBy}
            data-testid={props.testId}
            onClick={props.onClick}
            onMouseDown={props.onMouseDown}
            onKeyDown={props.onKeyDown}
        >
            <IoInformationCircleOutline size={16} color="var(--iw-color-grayMedium)"/>
        </button>
    );
}
