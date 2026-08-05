import React from "react";
import { renderGradientText } from "../../../utils/builder";
import { PlainButtonStyles } from "./PlainButtonStyles";

export type PlainButtonProps = {
    fullWidth?: boolean;
    testId: string;
    onClick: () => void;
    title: string;
    disableGradient?: boolean;
    variant?: "default" | "neutral";
    className?: string;
    disabled?: boolean;
};

export const PlainButton: React.FC<PlainButtonProps> = (props) => {
    const isGradient = !props.disableGradient;
    const isDisabled = !!props.disabled;

    if (props.variant === "neutral") {
        return (
            <div className={props.fullWidth ? "w-full" : ""}>
                <button
                    type="button"
                    data-testid={props.testId}
                    className={`${PlainButtonStyles.neutral} ${props.className ?? ""}`}
                    onClick={props.onClick}
                    disabled={isDisabled}
                >
                    {props.title}
                </button>
            </div>
        );
    }

    const innerClass = [
        PlainButtonStyles.inner,
        isGradient ? PlainButtonStyles.innerGradientHover : "",
        props.className ?? "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={props.fullWidth ? PlainButtonStyles.wrapperFull : PlainButtonStyles.wrapper}>
            <div
                className={PlainButtonStyles.clickable}
                onClick={isDisabled ? undefined : props.onClick}
            >
                <div className={innerClass}>
                    <button
                        type="button"
                        data-testid={props.testId}
                        className={PlainButtonStyles.button}
                        disabled={isDisabled}
                    >
                        {props.disableGradient
                            ? props.title
                            : renderGradientText(props.title)}
                    </button>
                </div>
            </div>
        </div>
    );
};
