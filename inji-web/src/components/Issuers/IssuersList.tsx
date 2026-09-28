import React from "react";
import {Issuer} from "./Issuer";
import {useSelector} from "react-redux";
import {IssuerObject} from "../../types/data";
import {RootState} from "../../types/redux";
import {useTranslation} from "react-i18next";
import {EmptyListContainer} from "../Common/EmptyListContainer";
import {SpinningLoader} from "../Common/SpinningLoader";
import {IssuersListProps} from "../../types/components";
import {HeaderTile} from "../Common/HeaderTile";
import {GradientWrapper} from "../Common/GradientWrapper";
import {RequestStatus} from "../../utils/constants";

export const IssuersList: React.FC<IssuersListProps> = ({state}) => {
    const issuers = useSelector((state: RootState) => state.issuers);
    const {t} = useTranslation("IssuersPage");

    if (state === RequestStatus.LOADING) {
    return ( <GradientWrapper><SpinningLoader /></GradientWrapper> );
    }

  if (state === RequestStatus.ERROR || !issuers?.filtered_issuers || issuers.filtered_issuers.length === 0) {
    return (<div data-testid="Issuers-List-Container" className="flex flex-col items-center justify-center">
        <HeaderTile content={t("containerHeading")} subContent={t("containerSubHeading")} />
        <EmptyListContainer content={t("emptyContainerContent")} />
      </div> );
    }
    return (
    <div data-testid="Issuers-List-Container" className="flex flex-col items-center justify-center">
            <HeaderTile content={t("containerHeading")} subContent={t("containerSubHeading")}/>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-6 md:p-8">
        {issuers.filtered_issuers.map((issuer: IssuerObject, index: number) => (
         <Issuer key={issuer.issuer_id} issuer={issuer} index={index} />
        ))}
            </div>
        </div>
  );
};