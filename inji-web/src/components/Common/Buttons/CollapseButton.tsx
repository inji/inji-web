import { useSelector } from "react-redux";
import { isRTL } from "../../../utils/i18n";
import { RootState } from "../../../types/redux";
import CollapseIcon from '../../../assets/CollapseIcon.svg';

type CollapseButtonProps = {
    isCollapsed: boolean;
    onClick: () => void;
    className?: string;
};

export const CollapseButton: React.FC<CollapseButtonProps> = ({isCollapsed, onClick, className}) => {
    const language = useSelector((state: RootState) => state.common.language);

    return (
        <button
            type="button"
            onClick={onClick}
            className={className}
        >
            <img
                src={CollapseIcon}
                alt="Collapse"
                className={`transform ${
                    isCollapsed
                        ? isRTL(language)
                            ? ''
                            : 'rotate-180'
                        : isRTL(language)
                        ? 'rotate-180'
                        : ''
                } transition-transform duration-300 min-w-[26px] min-h-[26px]`}
            />
        </button>
    );
};