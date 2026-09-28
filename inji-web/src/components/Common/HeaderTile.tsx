import React from "react";
import {HeaderTileProps} from "../../types/components";

export const HeaderTile: React.FC<HeaderTileProps> = ({content, subContent}) => {
    return <React.Fragment>
        <div data-testid="HeaderTile-Text"
             className={"text-center font-bold text-iw-title mt-8 text-[24px] leading-[32px] "}>{content}</div>
        <div data-testid="HeaderTile-Text-SubContent"
             className={"text-center text-iw-subTitle text-[14px] leading-[20px] font-medium mb-8 mt-2 whitespace-nowrap"}>{subContent}</div>
    </React.Fragment>
}
