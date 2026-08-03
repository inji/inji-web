import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import {GoogleSolidButtonStyles} from "./GoogleSignInButtonStyles.ts";

export const GoogleSignInButton:React.FC<GoogleSignInButtonProps> = (props) => {
  const [internalLoading, setInternalLoading] = useState(false);
  // When the parent supplies isLoading it owns the state, because the click may
  // no longer lead straight to a redirect (e.g. it opens a confirmation modal
  // first). Latching internally would leave the button stuck on "logging in"
  // if that modal is dismissed.
  const isControlled = props.isLoading !== undefined;
  const isLoading = isControlled ? !!props.isLoading : internalLoading;

  const onClickHandler = () => {
    if (!isControlled) {
      setInternalLoading(true);
    }
    props.handleGoogleLogin();
  };

  return (
    <button
      onClick={onClickHandler}
      disabled={isLoading}
      data-testid="google-login-button"
      className={`${GoogleSolidButtonStyles.baseStyles} ${isLoading ? GoogleSolidButtonStyles.disabledClasses : ""}`}
    >
      <FcGoogle size={24} className="flex-shrink-0" />
      {isLoading ? props.loadingText : props.text}
    </button>
  );
};

export type GoogleSignInButtonProps = {
    handleGoogleLogin: () => void;
    loadingText: string;
    text:string
    /** Optional. When provided, the parent controls the loading state. */
    isLoading?: boolean;
  };