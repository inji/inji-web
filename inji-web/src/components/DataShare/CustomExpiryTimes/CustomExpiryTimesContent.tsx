import React from "react";
import {RiArrowDownSLine, RiArrowUpSLine} from "react-icons/ri";
import {useTranslation} from "react-i18next";
import {CTContentProps} from "../../../types/components";

export const CustomExpiryTimesContent:React.FC<CTContentProps>= (props) => {

    const {t} = useTranslation("CustomExpiryModal");
    return <div className="relative px-6 mx-4 flex flex-col justify-between" data-testid={"CustomExpiryTimesContent-Outer-Container"}>
        <div className={"border-2 rounded-lg flex flex-row justify-between"}>
            <div className={"flex flex-col px-2"}  data-testid={"CustomExpiryTimesContent-Times-Range-Container"}>
                <button type="button" onClick={() => props.setExpiryTime(props.expiryTime + 1)} data-testid={"CustomExpiryTimesContent-Times-Range-Increase"}>
                    <RiArrowUpSLine size={20} color={'var(--iw-color-arrowDown)'}/>
                </button>
                <button type="button" onClick={() => props.expiryTime > 1 && props.setExpiryTime(props.expiryTime - 1)} data-testid={"CustomExpiryTimesContent-Times-Range-Decrease"}>
                    <RiArrowDownSLine size={20} color={'var(--iw-color-arrowDown)'} />
                </button>
            </div>
            <div className={"px-2 flex w-full"}><input type={"text"} min={0} value={props.expiryTime} onChange={event => {props.setExpiryTime(Number.isNaN(Number.parseInt(event.target.value)) ? 0 : Number.parseInt(event.target.value)); }} className={"appearance-none w-full p-2 focus:outline-none no-spinner"} placeholder={"Enter Number here"} data-testid={"CustomExpiryTimesContent-Times-Value"}/></div>
            <div className={"px-2 flex items-center justify-center bg-iw-borderLight text-iw-subText"} data-testid={"CustomExpiryTimesContent-Times-Metrics"}>{t("metrics")}</div>
        </div>
    </div>;
}

