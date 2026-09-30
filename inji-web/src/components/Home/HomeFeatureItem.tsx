import React from "react";
import {FaRegCheckCircle} from "react-icons/fa";
import {GradientWrapper} from "../Common/GradientWrapper";
import { useTranslation } from "react-i18next";
import { HomeFeatureItemProps } from "../../types/components";

export const HomeFeatureItem: React.FC<HomeFeatureItemProps> = (props) => {
  const {t} = useTranslation("HomePage");

  const renderFeatureRow = (featureName: string, index: number, containerClass: string) => (
    <div data-testid={`HomeFeatureItem${props.itemno}-${featureName}`} className={`flex flex-row container mx-auto ${containerClass}`}>
      <div className="pe-3 mt-[4px]">
        <GradientWrapper>
          <FaRegCheckCircle size={20} />
        </GradientWrapper>
      </div>
      <div className="flex flex-col">
        <span data-testid={`HomeFeatureItem${props.itemno}-${featureName}-Item`} className="text-[18px] leading-[28px] font-medium">
          {t(`FeatureItem${props.itemno}.item${index}`)}
        </span>
        <span data-testid={`HomeFeatureItem${props.itemno}-${featureName}-Description`} className="text-[14px] leading-[20px] font-medium">
          {t(`FeatureItem${props.itemno}.description${index}`)}
        </span>
      </div>
    </div>
  );

  return (
    <div data-testid={"HomeFeatureItem" + props.itemno + "-Container"} className="bg-gray-50 p-7 max-w-96 shadow-sm">
      <img data-testid={"HomeFeatureItem" + props.itemno + "-Image"} src={require("../../assets/FeatureItem" + props.itemno + ".svg")} alt="feature item" />
      <div data-testid={"HomeFeatureItem" + props.itemno + "-Heading"} className="font-bold text-black text-[24px] leading-[32px] text-wrap py-7">
        {t("FeatureItem" + props.itemno + ".heading")}
      </div>
      {renderFeatureRow("FirstFeature", 1, "py-2")}
      {renderFeatureRow("SecondFeature", 2, "mt-10")}
    </div>
  );
}
