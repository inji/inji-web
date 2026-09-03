import React, {useState} from "react";
import {MdOutlineKeyboardArrowDown} from "react-icons/md";
import {DataShareDisclaimer} from "./DataShareDisclaimer";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../types/redux";
import {storevcStorageExpiryLimitInTimes} from "../../redux/reducers/commonReducer";
import {useTranslation} from "react-i18next";
import {DSContentProps} from "../../types/components";
import { toast } from "react-toastify";

export const DataShareContent:React.FC<DSContentProps> = (props) => {

    const [timesDropDown, setTimesDropDown] = useState<boolean>(false);
    const vcStorageExpiryLimitInTimes = useSelector((state: RootState) => state.common.vcStorageExpiryLimitInTimes);
    const dispatch = useDispatch();
    const {t} = useTranslation("DataShareExpiryModal");

    const getExpiryDisplayName = (expiry: number) => {
        let expiryDisplayName = expiry.toString();
        switch(expiry){
            case 1:
                expiryDisplayName = t("content.validityTimesOptions.once");
                break;
            case 3:
                expiryDisplayName = t("content.validityTimesOptions.thrice");
                break;
            case -1:
                expiryDisplayName = t("content.validityTimesOptions.noLimit");
                break;
        }
        return expiryDisplayName;
    }


    return <div className="relative px-6 flex flex-col justify-between border-b border-solid border-iw-borderLight" data-testid={"DataShareContent-Outer-Container"}>
        <div className="relative flex border-b-2 space-x-2">
            <div className="my-4 break-words text-iw-subTitle text-lg w-1/3 leading-relaxed py-5" data-testid={"DataShareContent-Outer-Title"}>{t("content.selectedDocument")}</div>
            <div className={"my-4 text-center shadow-md rounded-lg w-2/3 flex flex-row py-5 items-center"}>
                <div className={"px-4"} data-testid={"DataShareContent-Issuer-Logo-Container"}>
                    <img data-testid={"DataShareContent-Issuer-Logo"} src={props.credentialLogo} alt="Issuer Logo"
                         className="w-12 h-12 min-w-[36px]"/>
                </div>
                <div className="text-center text-lg w-full sm:w-auto break-words min-w-[100px]" data-testid={"DataShareContent-Issuer-Name"}>{props.credentialName}</div>
            </div>
        </div>
        <div className="relative flex space-x-10">
            <div className="my-4 w-1/3 text-iw-subTitle text-lg leading-relaxed py-5" data-testid={"DataShareContent-Consent-Container"}>{t("content.consent")}</div>
            <div className={"my-4 w-2/3 flex flex-row py-5 items-center"}>
                <label className="w-1/2 flex items-center">
                    <input
                        type="radio"
                        name="consentValidity"
                        value="number"
                        checked={true}
                        data-testid={"DataShareContent-Consent-Radio"}
                        className="accent-iw-primary scale-150 mx-2"
                    />
                    <span className="font-base text-iw-subTitle" data-testid={"DataShareContent-Consent-Option"}>{t("content.validityTimesHeader")}</span>
                </label>

                <button type="button" onClick={()=>toast.warning(t("toastText"))} className="w-1/2 flex items-center" data-testid={"DataShareContent-Validity-Date"}>
                    <div className="relative inline-block">
                        <input
                            type="radio"
                            name="consentValidity"
                            value="date"
                            disabled={true}
                            className="accent-iw-primary scale-150 mx-2"
                            tabIndex={-1}
                        />
                    </div>
                    <span className="font-light text-iw-subTitle" data-testid={"DataShareContent-Validity-Date-Title"}>
                        {t("content.validityDate")}</span>
                </button>
            </div>
        </div>
        <div className="relative flex mb-4">
                    <div className={"w-1/3"}></div>
                    <button type="button" data-testid={"times-dropdown"} className={"w-2/3 py-4 px-4 rounded-lg border-2 border-iw-borderLight flex flex-row items-center"} onClick={()=>setTimesDropDown(times => !times)}>
                        <span className={"w-full h-full text-left"} data-testid={"DataShareContent-Selected-Validity-Times"}>{getExpiryDisplayName(vcStorageExpiryLimitInTimes)}</span>
                        <MdOutlineKeyboardArrowDown size={30} color={'var(--iw-color-arrowDown)'} />
                    </button>
                </div>

                {timesDropDown && <div className="relative flex mb-4">
                    <div className={"w-1/3"}></div>
                    <div
                        className={"w-2/3 py-4 px-2 border-2 border-iw-borderLight rounded-lg shadow-lg shadow-iw-shadow flex flex-col justify-center items-center"} data-testid={"DataShareContent-Validity-Times-DropDown"}>
                        <button type="button" data-testid={"DataShareContent-Validity-Times-DropDown-Once"} onClick={()=>{dispatch(storevcStorageExpiryLimitInTimes(1)); setTimesDropDown(false)}} className={"w-full h-full py-3 px-4 hover:bg-iw-borderLight hover:rounded-lg text-left"}>{t("content.validityTimesOptions.once")}</button>
                        <button type="button" data-testid={"DataShareContent-Validity-Times-DropDown-Thrice"} onClick={()=>{dispatch(storevcStorageExpiryLimitInTimes(3)); setTimesDropDown(false)}} className={"w-full h-full py-3 px-4 hover:bg-iw-borderLight hover:rounded-lg text-left"}>{t("content.validityTimesOptions.thrice")}</button>
                        <button type="button" data-testid={"DataShareContent-Validity-Times-DropDown-NoLimit"} onClick={()=>{dispatch(storevcStorageExpiryLimitInTimes(-1)); setTimesDropDown(false)}} className={"w-full h-full py-3 px-4 hover:bg-iw-borderLight hover:rounded-lg text-left"}>{t("content.validityTimesOptions.noLimit")}</button>
                        <button type="button" data-testid={"DataShareContent-Validity-Times-DropDown-Custom"} onClick={()=>{setTimesDropDown(false); props.setIsCustomExpiryInTimesModalOpen(true)}}
                               className={"w-full h-full py-3 px-4 hover:bg-iw-borderLight hover:rounded-lg text-left"}>{t("content.validityTimesOptions.custom")}</button>
                    </div>
                </div>}
        <DataShareDisclaimer content={t("disclaimer")}/>
    </div>;
}

