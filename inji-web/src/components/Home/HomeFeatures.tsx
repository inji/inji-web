import React, { useState } from "react";
import { HomeFeatureItem } from "./HomeFeatureItem";
import { useTranslation } from "react-i18next";
import { IoArrowForwardCircleOutline, IoArrowBackCircleOutline } from "react-icons/io5";
import { isRTL } from "../../utils/i18n";

export const HomeFeatures: React.FC = () => {
  const { t, i18n } = useTranslation("HomePage");
  const [currentFeature, setCurrentFeature] = useState(1);
  const totalFeatures = 5;
  const rtl = isRTL(i18n.language);

  const handleNext = () => {
    setCurrentFeature((prev) => (prev + 1) % totalFeatures);
  };

  const handlePrev = () => {
    setCurrentFeature((prev) => (prev - 1 + totalFeatures) % totalFeatures);
  };

  return (
    <div data-testid="HomeFeatures-Container" className="flex justify-center items-center flex-col">
      <div data-testid="HomeFeatures-Heading" className="font-bold text-[36px] leading-[44px] tracking-[-0.02em] m-5">
        {t("Features.heading")}
      </div>
      <div data-testid="HomeFeatures-Description1" className="font-extralight text-[20px] leading-[30px] text-center">
        {t("Features.description1")}
      </div>
      <div data-testid="HomeFeatures-Description2" className="font-extralight text-[20px] leading-[30px] text-center pb-5">
        {t("Features.description2")}
      </div> 

      <img data-testid="HomeFeatures-MobileImage" className="mx-auto container scale-[80%] block sm:hidden" src={require("../../assets/InjiWebMobilePreview.png")} alt="Inji Web Mobile Preview" />
      <img data-testid="HomeFeatures-DesktopImage" className="mx-auto container max-h-[700px] max-w-[1000px] hidden sm:block pb-8" src={require("../../assets/InjiWebDesktopPreview.png")} alt="Inji Web Preview" />

      <div data-testid="HomeFeatures-ItemsContainer" className="flex flex-wrap gap-8 container mx-auto pb-3 md:pb-7 justify-center">
        <div data-testid="HomeFeatures-Items" className="hidden md:flex flex-wrap gap-8 justify-center">
          {[1, 2, 3, 4, 5].map((itemNo) => (
            <HomeFeatureItem key={itemNo} itemno={itemNo} />
          ))}
        </div>
        <div data-testid="HomeFeatures-MobileItem" className="md:hidden mx-9 my-6 h-[32rem] w-full flex justify-center">
          <HomeFeatureItem itemno={currentFeature + 1} />
        </div>
      </div>
      <div data-testid="HomeFeatures-Navigation" className="flex justify-between w-full px-5 md:hidden items-center">
        <div data-testid="HomeFeatures-NavButtons" className="flex">
          <button type="button" onClick={handlePrev} className="bg-grey-300 p-1" aria-label="Previous feature">
            {rtl ? (
              <IoArrowForwardCircleOutline size={50} className="text-gray-500" color={"var(--iw-color-searchIcon)"} />
            ) : (
              <IoArrowBackCircleOutline size={50} className="text-gray-500" color={"var(--iw-color-searchIcon)"} />
            )}
          </button>
          <button type="button" onClick={handleNext} className="bg-grey-300 rounded mr-1" aria-label="Next feature">
            {rtl ? (
              <IoArrowBackCircleOutline size={50} className="text-gray-500" color={"var(--iw-color-searchIcon)"} />
            ) : (
              <IoArrowForwardCircleOutline size={50} className="text-gray-500" color={"var(--iw-color-searchIcon)"} />
            )}
          </button>
        </div>
        <div data-testid="HomeFeatures-Pagination" className="flex items-center px-5">
          {Array.from({ length: totalFeatures }, (_, index) => (
            <span
              key={index}
              className={`w-2 h-2 rounded-md mx-1 transition duration-300 ${
                index === currentFeature ? "scale-125 bg-gradient-to-r from-orange-500 to-purple-700 w-7 h-2 rounded-full" : "bg-gray-300"
              }`}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
};
