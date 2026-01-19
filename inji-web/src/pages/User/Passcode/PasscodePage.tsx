import React, {Fragment, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {api} from '../../../utils/api';
import {SolidButton} from '../../../components/Common/Buttons/SolidButton';
import {useTranslation} from 'react-i18next';
import {useUser} from '../../../hooks/User/useUser';
import {PasscodeInput} from '../../../components/Common/Input/PasscodeInput';
import {PasscodePageStyles} from './PasscodePageStyles';
import {HTTP_STATUS_CODES, KEYS, NETWORK_ERROR_MESSAGE, passcodeLength, ROUTES} from "../../../utils/constants";
import {PasscodePageTemplate} from "../../../components/PageTemplate/PasscodePage/PasscodePageTemplate";
import {TertiaryButton} from "../../../components/Common/Buttons/TertiaryButton";
import {useApi} from "../../../hooks/useApi";
import {ApiError, ApiResult, Wallet} from "../../../types/data";
import {AppStorage} from "../../../utils/AppStorage";

const WalletLockStatus = {
    TEMPORARILY_LOCKED: 'temporarily_locked',
    PERMANENTLY_LOCKED: 'permanently_locked',
    LAST_ATTEMPT_BEFORE_LOCKOUT: 'last_attempt_before_lockout'
};

const walletStatusToTestIdSuffix: Record<string, string> = {
    [WalletLockStatus.TEMPORARILY_LOCKED]: 'temporarily-locked',
    [WalletLockStatus.PERMANENTLY_LOCKED]: 'permanently-locked',
    [WalletLockStatus.LAST_ATTEMPT_BEFORE_LOCKOUT]: 'last-attempt-before-lockout',
};

export const PasscodePage: React.FC = () => {
    const {t} = useTranslation('PasscodePage');
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
  const [wallets, setWallets] = useState<Wallet[] | null>(null);

    const initialPasscodeArray = Array(passcodeLength).fill('');
    const [passcode, setPasscode] = useState<string[]>(initialPasscodeArray);
    const [confirmPasscode, setConfirmPasscode] = useState<string[]>(initialPasscodeArray);

    const {saveWalletId} = useUser();
    const createWalletApi = useApi<Wallet>();
    const walletsApi = useApi<Wallet[]>();
    const unlockWalletApi = useApi<Wallet>();
    const [canUnlockWallet, setCanUnlockWallet] = useState<boolean>(true);
    const [testIdSuffix, setTestIdSuffix] = useState("");
  const [remainingTime, setRemainingTime] = useState<number | null>(null); // ✅ countdown state

  const lockDuration = 60; 

    const handleWalletStatusError = (errorCode: string, fallBackError: string | undefined = undefined, httpStatusCode: number | null = null) => {
        if (
            errorCode === WalletLockStatus.TEMPORARILY_LOCKED ||
            errorCode === WalletLockStatus.PERMANENTLY_LOCKED ||
            errorCode === WalletLockStatus.LAST_ATTEMPT_BEFORE_LOCKOUT
        ) {
            setTestIdSuffix(`-${walletStatusToTestIdSuffix[errorCode]}`);
            setError(t(`error.walletStatus.${errorCode}`));
            if (errorCode !== WalletLockStatus.LAST_ATTEMPT_BEFORE_LOCKOUT) {
                setCanUnlockWallet(false);
                setPasscode(initialPasscodeArray);
                setConfirmPasscode(initialPasscodeArray);
        if (errorCode === WalletLockStatus.TEMPORARILY_LOCKED) {
          setRemainingTime(lockDuration); // start countdown immediately
        }
            }
    } else if (fallBackError && httpStatusCode === HTTP_STATUS_CODES.BAD_REQUEST) {
                setError(t(fallBackError));
            }
  };

    const handleCommonErrors = (response: ApiResult<any>, fallBackError: string | undefined = undefined) => {
    if (response.error?.message === NETWORK_ERROR_MESSAGE) {
      setError(!navigator.onLine
        ? t("Common:error.networkError.message")
        : t("Common:error.unknownError.message"));
            return true;
        }

        switch (response.status) {
            case HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR:
                setError(t("Common:error.internalServerError.message"));
                return true;
            case HTTP_STATUS_CODES.SERVICE_UNAVAILABLE:
                setError(t("Common:error.serviceUnavailable.message"));
                return true;
            default:
                if (fallBackError) {
          setError(fallBackError);
          return true;
        }
    }
    return false;
  };

    const fetchWallets = async () => {
        try {
      const response = await walletsApi.fetchData({ apiConfig: api.fetchWallets });

            if (!response.ok()) {
                console.error('Error occurred while fetching Wallets:', response.error);
                handleCommonErrors(response, t('error.fetchWalletsError'));
        return;
            }

            const wallets = response.data;
            setWallets(wallets);

            if (wallets && wallets.length > 0) {
                const walletStatus = wallets[0].walletStatus;
                handleWalletStatusError(walletStatus);
            }
        } catch (error) {
            console.error('Error occurred while fetching Wallets:', error);
            setError(t('error.fetchWalletsError'));
        }
    };

    useEffect(() => {
        void fetchWallets();

        const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'walletId') 
                void fetchWallets();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

  // ✅ countdown effect
  useEffect(() => {
    if (!canUnlockWallet && remainingTime !== null) {
      const interval = setInterval(() => {
        setRemainingTime(prev =>
          prev !== null && prev > 0 ? prev - 1 : 0
        );
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [canUnlockWallet, remainingTime]);

  const unlockWallet = async (walletId: string | undefined, pin: string) => {
        if (!walletId) {
            console.error(`Wallet not found for Wallet Id: ${walletId}`);
            setError(t('error.walletNotFoundError'));
            navigate(ROUTES.USER_PASSCODE);
        } else {
            const response = await unlockWalletApi.fetchData({
                apiConfig: api.unlockWallet,
                body: {walletPin: pin},
                url: api.unlockWallet.url(walletId),
      });

            if (!response.ok()) {
                console.error("Error occurred while unlocking Wallet:", response.error);
                const isErrorHandled = handleCommonErrors(response);
                if (!isErrorHandled) {
          const errorCode = (response.error as ApiError)?.response?.data?.errorCode;
          handleWalletStatusError(errorCode ?? "", "error.incorrectPasscodeError", response.status);
                    setPasscode(initialPasscodeArray);
                }
            } else {
        saveWalletId(walletId);
                handleUnlockSuccess();
            }
        }
    };

    const createWallet = async () => {
        const pin = passcode.join('');

        const response = await createWalletApi.fetchData({
            apiConfig: api.createWalletWithPin,
            body: {
                walletPin: pin,
                confirmWalletPin: confirmPasscode.join(''),
                walletName: null
            },
    });

        if (!response.ok()) {
            console.error("Error occurred while creating Wallet:", response.error);
      const isErrorHandled = handleCommonErrors(response);
      if (!isErrorHandled) {
        let errorMessage: string;
        if (response.error && 'response' in response.error) {
          errorMessage = (response.error as ApiError)?.response?.data?.errorMessage
            ?? t('Common:error.unknownError.message');
        } else {
          errorMessage = t('Common:error.unknownError.message');
        }
                setError(`${t('error.createWalletError')}: ${errorMessage}`);
            }
        } else {
            const createdWallet = response.data!;
            await unlockWallet(createdWallet.walletId, pin);
        }
    };

    const handleUnlockSuccess = () => {
    let redirectPath: string = ROUTES.USER_HOME;
        const storedRedirectPath = AppStorage.getItem(KEYS.REDIRECT_TO, true);
        if (storedRedirectPath) {
            redirectPath = storedRedirectPath!;
            AppStorage.removeItem(KEYS.REDIRECT_TO, true);
        }
        navigate(redirectPath);
  };

    const handleSubmit = async () => {
    setError(null);
        setLoading(true);

        if (isUserCreatingWallet()) {
            await createWallet();
        } else {
      const walletId = wallets ? wallets[0]?.walletId : undefined;
            const formattedPasscode = passcode.join('');

            if (formattedPasscode.length !== passcodeLength) {
                setError(t('error.passcodeLengthError'));
                setLoading(false);
                return;
            }

            await unlockWallet(walletId, formattedPasscode);
        }
        setLoading(false);
    };

    const isButtonDisabled =
        passcode.includes('') ||
        (isUserCreatingWallet() && (confirmPasscode.includes('') || passcode.join('') !== confirmPasscode.join('')));

    function isUserCreatingWallet() {
        return wallets?.length === 0;
    }

    useEffect(() => {
        if (isUserCreatingWallet()) {
            if (!passcode.includes('') && 
                !confirmPasscode.includes('') &&
                passcode.join('') !== confirmPasscode.join('')) {
                setError(t('error.passcodeMismatchError'));
            } 
            else if (passcode.includes('') || 
                     confirmPasscode.includes('') ||
                     passcode.join('') === confirmPasscode.join('')) {
                setError(null);
            }
        }
    }, [passcode, confirmPasscode, wallets, t]);

    const pageTitle = isUserCreatingWallet() ? t('setPasscode') : t('enterPasscode');
    const pageSubtitle = isUserCreatingWallet() ? t('setPasscodeDescription') : t('enterPasscodeDescription');

    function renderForgotPasscodeButton() {
        const handleForgotPasscode = () =>
            navigate(
                ROUTES.USER_RESET_PASSCODE,
                {
                    state: {
          walletId: wallets ? wallets[0]?.walletId : undefined 
        },
      });

    return ( <div className={PasscodePageStyles.forgotPasscodeContainer}>
            <TertiaryButton onClick={handleForgotPasscode} title={t('forgotPasscode') + "?"}
                            testId={"forgot-passcode"} className={PasscodePageStyles.forgotPasscodeButton}/>
      </div>
    );
    }

  function renderPasscodeInput(label: string, value: string[], onChange: (values: string[]) => void, testId: string){
    return (<PasscodeInput label={label} value={value} onChange={onChange}testId={testId}
        disabled={!canUnlockWallet}/>
      );
    }

  const renderContent = () => (
            <div className={PasscodePageStyles.contentContainer}>
      {wallets && (
                    <Fragment>
          <div className={PasscodePageStyles.inputWrapper}>
                            {renderPasscodeInput(t('enterPasscodeLabel'), passcode, setPasscode, "passcode")}
                            {isUserCreatingWallet() &&
            renderPasscodeInput(t('confirmPasscodeLabel'),confirmPasscode,setConfirmPasscode,"confirm-passcode")}
          </div>

          {!isUserCreatingWallet() && renderForgotPasscodeButton()}

          {/* ✅ Countdown display */}
          {!canUnlockWallet && remainingTime !== null && (
            <div className={PasscodePageStyles.lockCountdown}>
              {remainingTime > 0
                ? `Locked. Try again in ${Math.floor(remainingTime / 60)}:${(
                    remainingTime % 60
                  ).toString().padStart(2, '0')}`
                : "Lock expired, you can try again."}
                        </div>
          )}

                        <div className={PasscodePageStyles.buttonContainer}>
                            <SolidButton
                                fullWidth={true}
                                testId="btn-submit-passcode"
                                onClick={handleSubmit}
                                title={loading ? t('submitting') : t('submit')}
              disabled={isButtonDisabled || !canUnlockWallet}
                                className={isButtonDisabled ? PasscodePageStyles.disabledButton : ''}
                            />
                        </div>
                    </Fragment>
      )}
            </div>
        );

    return (
        <PasscodePageTemplate
            title={pageTitle}
            subtitle={pageSubtitle}
            error={error}
            onErrorClose={() => setError(null)}
            content={renderContent()}
            contentTestId={"passcode-inputs-container"}
            testId={`passcode${testIdSuffix}`}
        />
    );
};
