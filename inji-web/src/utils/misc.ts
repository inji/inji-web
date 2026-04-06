import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import {api} from "./api";
import { IssuerObject,CredentialConfigurationObject,CodeChallengeObject, TokenRequestBody } from '../types/data';

export const generateCodeChallenge = (verifier = generateRandomString()) => {
    const hashedVerifier = sha256(verifier);
    const base64Verifier = Base64.stringify(hashedVerifier);
    return {
        codeChallenge: base64Verifier
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_'),
        codeVerifier: verifier
    };
}

export const generateRandomString = (length = 43, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~') => {
    const charsetLength = charset.length;
    const randomString = [];
    const maxValidSelector = Math.floor(0x100000000 / charsetLength) * charsetLength;
    
    while (randomString.length < length) {
        const array = new Uint32Array(1);
        const randomValue = crypto.getRandomValues(array)[0];

        // Reject values outside the max valid range to avoid bias
        if (randomValue < maxValidSelector) {
            const index = randomValue % charsetLength;
            randomString.push(charset[index]);
        }
    }

    return randomString.join('');
};

export const isObjectEmpty = (object: any) => {
    return object === null || object === undefined || Object.keys(object).length === 0;
}

export const buildAuthorizationUrl = (
    selectedIssuer: IssuerObject,
    filteredCredentialConfig: CredentialConfigurationObject,
    state: string,
    codeChallenge: CodeChallengeObject,
    authorizationEndpoint: string
  ): string => {
    return api.authorization(
      selectedIssuer,
      filteredCredentialConfig,
      state,
      codeChallenge,
      authorizationEndpoint
    );
  };
  
export const getTokenRequestBody = (code: string, codeVerifier: string, issuerId: string, credentialConfigurationId: string, vcStorageExpiryLimitInTimes: string, isLoggedIn = false) : TokenRequestBody => {
    // naming convention is handled separately for logged in and non logged in users as they use camelcase and snake case respectively
    if (isLoggedIn) {
        return {
            'grantType': 'authorization_code',
            'code': code,
            'redirectUri': api.authorizationRedirectionUrl,
            'codeVerifier': codeVerifier,
            'issuer': issuerId,
            'credentialConfigurationId': credentialConfigurationId,
        }
    }
    return {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': api.authorizationRedirectionUrl,
        'code_verifier': codeVerifier,
        'issuer': issuerId,
        'credential': credentialConfigurationId,
        'vcStorageExpiryLimitInTimes': vcStorageExpiryLimitInTimes
    }
}

export const downloadCredentialPDF = async (
    response: Blob,
    fileName: string
) => {
    const url = window.URL.createObjectURL(response);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const getErrorObject = (downloadResponse: any) => {
    const errorCode = downloadResponse?.errors ? downloadResponse?.errors[0]?.errorCode : "";
    if([
        "errMissingIssuanceDate",
        "errInvalidIssuanceDate",
        "errIssuanceDateIsFutureDate",
        "errInvalidExpirationDate",
        "errVcExpired",
        "errInvalidValidFrom",
        "errValidFromIsFutureDate",
        "errInvalidValidUntil"
    ].indexOf(errorCode) !== -1 ){
        return {
            code: `error.verification.${errorCode}.title`,
            message: `error.verification.${errorCode}.subTitle`
        }
    }
    return {
        code: "error.generic.title",
        message: "error.generic.subTitle"
    }
}
export const convertStringIntoPascalCase = (text: string | undefined) => {
    return (
        text?.toLocaleLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    );
};