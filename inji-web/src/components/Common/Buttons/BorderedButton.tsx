import React from "react";
import {renderGradientText} from "../../../utils/builder";
import {BorderedButtonStyles} from "./BorderedButtonStyles.ts";

export const BorderedButton:React.FC<BorderedButtonProps> = (props) => {
  const isDisabled = !!props.disabled;

  return <div className={props.fullWidth ? "w-full" : ""}>
    <div className={"bg-gradient-to-r text-center cursor-pointer from-iw-primary to-iw-secondary p-0.5 rounded-lg"}>
            <div className={`py-1 px-2 bg-white justify-center center rounded-lg ${!isDisabled ? 'hover:bg-none hover:bg-[#FFF2F2] hover:text-[#E64E4E]' : ''} ${props.className}`}>
                <button
                    type="button"
                    id={props.testId}
                    data-testid={props.testId}
                    className={`w-full ${BorderedButtonStyles.baseStyles} ${props.disabled ? BorderedButtonStyles.disabledClasses : ""}`}
                    disabled={props.disabled}
                    onClick={isDisabled ? undefined : props.onClick}>
                    {renderGradientText(props.title)}
                </button>
            </div>
    </div>
  </div>
}

export type BorderedButtonProps = {
    fullWidth?: boolean | false;
    testId: string;
    onClick: (event: React.MouseEvent)=> void;
    title: string;
    className?: string;
    disabled?: boolean;
}
