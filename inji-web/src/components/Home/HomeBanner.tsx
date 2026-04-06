import React from "react";
import Login from "../Login/Login"; // Import your existing login component
import { useTranslation } from "react-i18next";

interface HomeBannerProps {
  isOpenIdVpLogin?: boolean;
}

export const HomeBanner: React.FC<HomeBannerProps> = ({ isOpenIdVpLogin = false }) => {
  const { t } = useTranslation("HomePage");

  return (
    <div className="pb-10">
      {/* Banner content */}
      <div
        data-testid="HomeBanner-Content"
        className="mx-auto sm:w-[86.9vw] max-w-[1400px] sm:rounded-xl sm:mt-6 sm:pt-24 pt-16 sm:pb-12 
          px-3 flex flex-col sm:flex-row sm:gap-10 justify-between items-center bg-home-banner bg-cover bg-center"
      >
        {/* Left side: Text Component*/}
        <div className="sm:px-10 flex flex-col sm:w-1/2 items-start text-center sm:text-left">
  
          {/* Banner heading */}
          <span 
            data-testid="HomeBanner-Heading"  
            className="text-[48px] leading-[60px] tracking-[-0.02em] text-iw-text font-bold sm:font-semibold text-wrap text-center sm:text-left sm:pb-4"
          >
            {t("Banner.heading")}
          </span>
  
          {/* Banner description */}
          <h2 className="text-[18px] leading-[28px] w-full my-6 sm:my-6 text-iw-text font-extralight">
            {t("Banner.description")}
          </h2>
        </div>
  
        {/* Right side: Login Component */}
        <div className="px-6 flex flex-col sm:flex-row w-full sm:w-[35%] bg-white mb-14 mx-14 py-6 sm:py-8 rounded-xl shadow-md items-center">
          <Login isOpenIdVpLogin={isOpenIdVpLogin}/>
        </div>
      </div>
    </div>
  );
};

export default HomeBanner;
