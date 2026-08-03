import React, { useState } from "react";
import {useNavigate, useLocation} from "react-router-dom";
import '../../index.css';
import {useTranslation} from "react-i18next";
import {BorderedButton} from "../Common/Buttons/BorderedButton";
import {GoogleSignInButton} from "../Common/Buttons/GoogleSignInButton";
import {ThirdPartyRedirectModal} from "./ThirdPartyRedirectModal";

interface LoginProps {
  isOpenIdVpLogin?: boolean;
}

export const Login: React.FC<LoginProps> = ({ isOpenIdVpLogin = false }) => {
  const { t } = useTranslation("HomePage");
  const navigate = useNavigate();
  const [guestClicked, setGuestClicked] = useState(false);
  const [showThirdPartyAlert, setShowThirdPartyAlert] = useState(false);
  const [isRedirectingToGoogle, setIsRedirectingToGoogle] = useState(false);
  const location = useLocation();

  // Warn about the language hand-off first; the redirect happens on confirm.
  const handleGoogleLogin = () => setShowThirdPartyAlert(true);

  const redirectToGoogle = () => {
      setIsRedirectingToGoogle(true);
      // Use replace() instead of href to prevent adding Google IdP to browser history
      // This way, pressing back won't navigate to Google's OAuth page
      window.location.replace(`${window._env_.MIMOTO_URL}/oauth2/authorize/google`);
  };

  const handleGuestLogin = () => {
    if (guestClicked) return; // guard against double click
    setGuestClicked(true);
    const redirectPath = location.state?.from?.pathname || "/issuers";
    navigate(redirectPath, { replace: true });
  };

  const Separator:React.FC=()=>{
    return (
      <div className="flex items-center w-full my-2 sm:my-5">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="px-4 text-gray-500 font-medium text-[14px] leading-[20px]">OR</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-[100%] max-w-[400px] mx-auto rounded-2xl">
        <div data-testid="login-logo" className="flex justify-center items-center">
          <img src={require("../../assets/Logomark.png")} alt="Inji Web Logo" />
        </div>

        <div data-testid="login-title" className="text-[36px] leading-[44px] tracking-[-0.02em] text-black font-bold text-center py-4">
          {t("Login.loginTitle")}
        </div>

        <div data-testid="login-description" className="sm:mt-3 text-[18px] leading-[28px] text-muted text-ellipsis text-center pb-0">
          {t(isOpenIdVpLogin ? "Login.loginDescriptionOVP" : "Login.loginDescription")}
        </div>

        <div data-testid="login-note" className="sm:my-3 text-[14px] leading-[20px] font-medium text-ellipsis text-center pb-4">
          {t(isOpenIdVpLogin ? "Login.loginNoteOVP" : "Login.loginNote")}
        </div >

        <GoogleSignInButton handleGoogleLogin={handleGoogleLogin} isLoading={isRedirectingToGoogle} loadingText={t("Login.loggingIn")} text={t("Login.loginGoogle")}/>

        {showThirdPartyAlert && (
          <ThirdPartyRedirectModal
            onContinue={redirectToGoogle}
            onClose={() => setShowThirdPartyAlert(false)}
          />
        )}

        {!isOpenIdVpLogin && (
          <>
            <Separator/>
            {/* Tour spotlight anchor: the inner button only wraps its text, so the
                tour highlights this full-width container instead. */}
            <div className="w-full" data-testid="home-banner-guest-login-container">
              <BorderedButton
                  testId="home-banner-guest-login"
                  onClick={handleGuestLogin}
                  title={
                    t("Login.loginGuest")
                  }
                  disabled={guestClicked}
              />
            </div>
          </>
        )}
    </div>
  );
};

export default Login;
