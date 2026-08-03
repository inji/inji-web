import React from "react";
import {IoAlertCircleOutline} from "react-icons/io5";
import {EmptyListContainerProps} from "../../types/components";

export const EmptyListContainer: React.FC<EmptyListContainerProps> = ({content, subContent}) => {
    return <React.Fragment>
        <div data-testid="EmptyList-Outer-Container"
             className="flex justify-center items-center w-full mx-auto my-auto flex-col h-72 px-10
             rounded-xl border-2 border-dashed border-iw-grayLight">
            <div data-testid="EmptyList-Icon"
                 className="flex items-center justify-center w-14 h-14 rounded-2xl bg-iw-paleGray">
                <IoAlertCircleOutline size={28} className="text-iw-subTitle"/>
            </div>
            <p data-testid="EmptyList-Text"
               className="mt-4 text-center font-semibold text-iw-title">{content}</p>
            {subContent && (
                <p data-testid="EmptyList-SubText"
                   className="mt-1 text-center text-sm text-iw-subTitle">{subContent}</p>
            )}
        </div>
    </React.Fragment>
}
