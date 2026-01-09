import React, { useState } from "react";
import {useNavigate, useLocation} from "react-router-dom";
import '../../index.css';
import {useTranslation} from "react-i18next";
import {BorderedButton} from "../Common/Buttons/BorderedButton";
import {GoogleSignInButton} from "../Common/Buttons/GoogleSignInButton";

export const Login: React.FC = () => {
  const { t } = useTranslation("HomePage");
  const navigate = useNavigate();
  const [guestClicked, setGuestClicked] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);
  const location = useLocation();

  const handleGoogleLogin = () => {
      window.location.href = `${window._env_.MIMOTO_URL}/oauth2/authorize/google`;
  };

  const handleGuestLogin = () => {
    if (guestClicked) return; // guard against double click
    const fromPath = location.state?.from?.pathname;
    if (fromPath === "/user/authorize") {
      setGuestError("To continue this verification request, please sign in to your wallet instead of continuing as guest.");
      return;
    }
    setGuestClicked(true);
    const redirectPath = fromPath || "/issuers";
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
          {t("Login.loginDescription")}
        </div>

        <div data-testid="login-note" className="sm:my-3 text-[14px] leading-[20px] font-medium text-ellipsis text-center pb-1">
          {t("Login.loginNote")}
        </div >

        {guestError && (
          <div
            data-testid="login-guest-error"
            className="mb-3 text-[12px] leading-[18px] text-red-600 text-center"
          >
            {guestError}
          </div>
        )}

        <GoogleSignInButton handleGoogleLogin={handleGoogleLogin} loadingText={t("Login.loggingIn")} text={t("Login.loginGoogle")}/>

        <Separator/>

        <div className="w-full">
          <BorderedButton
              testId="home-banner-guest-login"
              onClick={handleGuestLogin}
              title={
                t("Login.loginGuest")
              }
              disabled={guestClicked}
          />
        </div>
    </div>
  );
};

export default Login;
