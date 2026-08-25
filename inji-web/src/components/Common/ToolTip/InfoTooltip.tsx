import React, { useState, useId } from 'react';
import InfoIcon from "../../../assets/infoIconWhite.svg";
import { InfoTooltipStyles } from './InfoTooltipStyles';

interface InfoTooltipProps {
    infoButtonText: string;
    tooltipText: string;
    className?: string;
    testId?: string;
}


export const InfoTooltip: React.FC<InfoTooltipProps> = ({
                                                                          infoButtonText,
                                                                          tooltipText,
                                                                          className = '',
                                                                          testId = ''
                                                                      }) => {

    const uniqueId = useId();
    const [showTooltip, setShowTooltip] = useState(false);


    const handleToggle = () => setShowTooltip(prev => !prev);

    const handleMouseEnter = () => setShowTooltip(true);
    const handleMouseLeave = () => setShowTooltip(false);

    return (
        <div data-testid={testId} className={`${InfoTooltipStyles.wrapper} ${className}`}>

            <button
                type="button"
                onClick={handleToggle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleMouseEnter}
                onBlur={handleMouseLeave}
                onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleToggle(); } }}
                className={InfoTooltipStyles.button}
                data-testid="btn-info-tooltip-trigger-button"
                aria-describedby={showTooltip ? `tooltip-${uniqueId}` : undefined}
            >
                <img
                    src={InfoIcon}
                    alt="Information icon"
                    aria-hidden="true"
                    className={InfoTooltipStyles.icon}
                    data-testid="text-info-icon"
                />
                <span data-testid="text-info-button-label">{infoButtonText}</span>
            </button>
            {showTooltip && (
                <div
                    id={`tooltip-${uniqueId}`}
                    role="tooltip"
                    className={InfoTooltipStyles.tooltipContainer}
                    style={{
                        filter: InfoTooltipStyles.tooltipShadow,
                    }}
                    data-testid="text-tooltip-content"
                >
                    <div className={InfoTooltipStyles.tooltipTriangleWrapper}>
                        <svg
                            className={InfoTooltipStyles.tooltipTriangle}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <polygon points="0,0 10,20 20,0" />
                        </svg>
                    </div>

                    <p data-testid="text-tooltip-message" className={InfoTooltipStyles.tooltipText}>
                        {tooltipText}
                    </p>
                </div>
            )}
        </div>
    );
};
