import React from "react";
import {EmptyListContainerProps} from "../../types/components";

export const EmptyListContainer: React.FC<EmptyListContainerProps> = ({content}) => {
    return <React.Fragment>
        <div data-testid="EmptyList-Outer-Container"
             className="flex justify-center items-center w-full mx-auto bg-iw-background my-auto flex-col h-72 shadow-md shadow-iw-shadow border-t-iw-shadow px-10">
            <p data-testid="EmptyList-Text"
               className="text-center text-light-title dark:text-dark-title">{content}</p>
        </div>
    </React.Fragment>
}
