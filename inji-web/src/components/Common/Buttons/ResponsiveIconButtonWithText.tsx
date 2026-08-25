import React, {useState} from 'react';
import {SolidButton} from "./SolidButton";
import {IconProps} from "../../../types/components";
import {ButtonStyles} from "./ButtonStyles";

interface ResponsiveIconButtonWithTextProps {
    icon: React.ReactElement<IconProps>;
    text: string;
    onClick: () => void;
    testId: string;
}

/**
 * On small screens:
 * [ICON] [TEXT]
 * On large screens:
 * [Separate TEXT Button on the left of it, visible on hover] [Gradient ICON BUTTON]
 */
export const ResponsiveIconButtonWithText: React.FC<ResponsiveIconButtonWithTextProps> = ({
                                                                                              icon,
                                                                                              text,
                                                                                              onClick,
                                                                                              testId
                                                                                          }) => {
    const [isHovered, setIsHovered] = useState(false);
    const enhancedIcon = React.isValidElement(icon) ? React.cloneElement(icon, {
        gradient: !isHovered,
        style: {
            color: isHovered ? "#FFFFFF" : "var(--iw-color-grayMedium)",
        }
    }) : icon;

    return (
        <div className={ButtonStyles.responsiveButtonWithText.container}>
            {/* Small screens: icon + text */}
            <span data-testid={"small-device-view"} className={ButtonStyles.responsiveButtonWithText.smallDeviceView}>
                <SolidButton
                    className={ButtonStyles.responsiveButtonWithText.smallDeviceButton}
                    testId={`btn-${testId}`}
                    onClick={onClick}
                    title={text}
                    icon={icon}
                    fullWidth
                />
            </span>

            {/* Large screens: icon button + text as separate element */}
            <div className={ButtonStyles.responsiveButtonWithText.largeDeviceContainer} data-testid={`non-small-device-view`}>
                {isHovered && (
                    <SolidButton testId={`btn-${testId}-hover-view`} onClick={onClick} title={text}/>
                )}

                <div className={ButtonStyles.responsiveButtonWithText.gradientContainer}>
                    <button
                        type="button"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className={`${ButtonStyles.responsiveButtonWithText.iconButton} ${isHovered ? ButtonStyles.responsiveButtonWithText.hoveredIconButton : ""}`}
                        aria-label="Gradient Icon Button"
                        onClick={onClick}
                        data-testid={`btn-${testId}`}
                        onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                event.stopPropagation()
                                onClick();
                            }
                        }}
                    >
                        {enhancedIcon}
                    </button>
                </div>
            </div>
        </div>
    );
};
