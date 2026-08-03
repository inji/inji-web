import {MethodType} from "../utils/api";
import React from "react";
import {RequestStatus} from "../utils/constants.ts";
import {AxiosError} from "axios";
// This file contains type definitions for various objects / models used in the application.

export type IssuerWellknownDisplayArrayObject = {
    name: string;
    language: string;
    locale: string;
    logo: LogoObject;
    title: string;
    description: string;
};

export type CredentialTypeDisplayArrayObject = {
    name: string;
    locale: string;
    logo: string;
};

type LogoObject = {
    url: string;
    alt_text: string;
};

export type IssuerConfigurationObject = {
    credentials_supported: CredentialConfigurationObject[];
    authorization_endpoint: string;
    grant_types_supported: string[];
};

export type CredentialConfigurationObject = {
    "name": string;
    "scope": string;
    "display": CredentialTypeDisplayArrayObject[];
};
export type CodeChallengeObject = {
    codeChallenge: string;
    codeVerifier: string;
};
export type IssuerObject = {
    name: string;
    desc: string;
    protocol: "OTP" | "OpenId4VCI";
    issuer_id: string;
    authorization_endpoint: string;
    credentials_endpoint: string;
    display: IssuerWellknownDisplayArrayObject[];
    client_id: string;
    redirect_uri: string;
    token_endpoint: string;
    proxy_token_endpoint: string;
    client_alias: string;
    ovp_qr_enabled: boolean;
    scopes_supported: string[];
};

export type ResponseTypeObject = {
    id?: string;
    version?: string;
    str?: string;
    responsetime?: string;
    metadata?: string;
    response?: any;
    errors?: ErrorType[];

    access_token?: string;
    expires_in?: number;
    token_type?: string;
};

export type ErrorType = {
    errorCode: string;
    errorMessage: string;
};

type DownloadSessionCredentialTypeObj = {
    type: string;
    displayObj: CredentialTypeDisplayArrayObject[];
}

export type SessionObject = {
    selectedIssuer?: IssuerObject;
    selectedCredentialType: DownloadSessionCredentialTypeObj;
    codeVerifier: string;
    vcStorageExpiryLimitInTimes: number;
    state: string;
};

export type ApiRequest = {
    url: (...args: string[]) => string;
    methodType: MethodType;
    headers: (...args: string[]) => any;
    credentials?: RequestCredentials;
    responseType?: "json" | "blob";
    includeXSRFToken?: boolean;
};

export type LanguageObject = {
    label: string;
    value: string;
    englishName?: string;
};

export type WalletCredential = {
    issuerDisplayName: string;
    issuerLogo: string;
    credentialTypeDisplayName: string;
    credentialTypeLogo: string;
    credentialId: string;
};

export type FAQAccordionItemType = {
    key: string;
    title: string;
    content: (string | { __html: string })[];
};

export type User = {
    displayName: string;
    profilePictureUrl: string;
    email: string;
    walletId?: string;
};

export type SidebarItemType = {
    icon: React.ReactNode;
    text: string;
    path: string;
    key: string;
};

export type DropdownItem = {
    label: string;
    onClick: () => void;
    textColor: string;
    key: string;
    icon?: React.ReactNode;
};

export type RouteValue = (typeof ROUTES)[keyof typeof ROUTES];

type LoggedInRequestBody = {
    grantType: 'authorization_code';
    code: string;
    redirectUri: string;
    codeVerifier: string;
    issuer: string;
    credentialConfigurationId: string;
}

type GuestRequestBody = {
    grant_type: 'authorization_code';
    code: string;
    redirect_uri: string;
    code_verifier: string;
    issuer: string;
    credential: string;
    vcStorageExpiryLimitInTimes: string;
}

export type TokenRequestBody = LoggedInRequestBody | GuestRequestBody;

export interface MenuItemType {
    label: string;
    onClick: () => void;
    id: string; // Unique identifier for the item
    icon?: React.ReactNode;
    color?: string;
}

export interface InstructionItem {
    id: string;
    content: React.ReactNode;
}

export interface Wallet {
    walletStatus: string;
    walletId: string;
    walletName: string;
}

export type ApiError = AxiosError<ErrorType | ResponseTypeObject>;

export interface ApiResult<T> {
    data: T | null;
    error: ApiError | Error | null;
    status: number | null;
    state: RequestStatus;
    headers: object;
    ok: () => boolean;
}

