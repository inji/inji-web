import checkCircle from "../../../assets/checkCircleTwo.svg";
import { DcqlDesignStyles } from "./dcqlDesignStyles";
import SelectedTickIcon from "../../../assets/SelectedTickIcon.svg";

interface DcqlSelectionRadioProps {
    checked: boolean;
    testId?: string;
    onClick?: () => void;
    "aria-label"?: string;
}

export function DcqlSelectionRadio({
    checked,
    testId,
    onClick,
    "aria-label": ariaLabel,
}: DcqlSelectionRadioProps) {
    const className = `${DcqlDesignStyles.radioOuter} ${
        checked
            ? DcqlDesignStyles.radioOuterSelected
            : DcqlDesignStyles.radioOuterDefault
    }`;

    if (onClick) {
        return (
            <button
                type="button"
                className={className}
                onClick={onClick}
                data-testid={testId}
                aria-pressed={checked}
                aria-label={ariaLabel}
            >
                {checked && (
                    <img
                        src={checkCircle}
                        alt=""
                        className="h-3.5 w-3.5"
                    />
                )}
            </button>
        );
    }

    return (
        <div className={className} data-testid={testId} aria-hidden>
            {checked && <img src={SelectedTickIcon} alt="" className="h-3 w-3" />}
        </div>
    );
}
