import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import {api} from "./api";
import {apiInstance} from "../hooks/useApi";
import { CredentialRequestBody } from '../types/data';

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

export type IssuerAuthorizeRequest = {
    redirectUri: string;
    scope: string;
    responseType: string;
    uiLocales: string;
};

export const createAuthorizationUrl = async (
    issuerId: string,
    request: IssuerAuthorizeRequest
): Promise<{authorizationUrl: string; state: string}> => {
    const response = await apiInstance.request({
        url: api.authorizeIssuance.url(issuerId),
        method: "POST",
        headers: api.authorizeIssuance.headers(),
        data: request,
        withCredentials: true
    });
    const authorizationUrl = response.data?.authorizationUrl;
    const state = response.data?.state;
    if (typeof authorizationUrl !== "string" || !authorizationUrl || typeof state !== "string" || !state) {
        throw new Error(response.data?.errorMessage ?? "Authorize did not return an authorization URL and state");
    }
    return {authorizationUrl, state};
};

export const getCredentialRequestBody = (
    issuerId: string,
    credentialConfigurationId: string,
    vcStorageExpiryLimitInTimes: string,
    isLoggedIn: boolean,
    grant: {code: string}
): CredentialRequestBody => {
    if (isLoggedIn) {
        return {
            issuer: issuerId,
            credentialConfigurationId,
            code: grant.code
        };
    }
    return {
        issuer: issuerId,
        credential: credentialConfigurationId,
        vcStorageExpiryLimitInTimes,
        code: grant.code
    };
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

/** Aligned with mobile wallet `formatKeyLabel` for consistent claim/key display names. */
export const formatKeyLabel = (key: string): string => {
    return key
        .replace(/\[\d+\]/g, '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(/[_\s]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};