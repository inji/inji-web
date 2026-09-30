import React from "react";
import {DSFooterProps} from "../../types/components";
import {BorderedButton} from "../Common/Buttons/BorderedButton";
import {SolidButton} from "../Common/Buttons/SolidButton";

export const DataShareFooter: React.FC<DSFooterProps> = (props) => {
    return (
        <div
            className="flex items-center justify-between p-6 rounded-b gap-x-2"
            data-testid={`DataShareFooter-Outer-Container${
                props.parent ? `-${props.parent}` : ""
            }`}
        >
            <BorderedButton
                testId={"DataShareFooter-Cancel-Button"}
                onClick={props.onCancel}
                title={props.cancelText}
                fullWidth={true}
            />
            <SolidButton
                testId={"DataShareFooter-Success-Button"}
                onClick={() => props.onSuccess()}
                title={props.successText}
                fullWidth={true}
            />
        </div>
    );
};
