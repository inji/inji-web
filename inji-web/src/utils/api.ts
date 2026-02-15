import { ApiRequest, CodeChallengeObject, CredentialConfigurationObject, IssuerObject } from "../types/data";
import i18n from "i18next";
import { KEYS, ROUTES } from "./constants";
import { AppStorage } from "./AppStorage";

export enum MethodType {
    GET,
    POST,
    PATCH,
    DELETE
}

export enum ContentTypes {
    JSON = "application/json",
    PDF = "application/pdf",
    FORM_URL_ENCODED = "application/x-www-form-urlencoded",
    SVG = "image/svg+xml",
}



export class api {
    static mimotoHost = window._env_.MIMOTO_URL;

    static authorizationRedirectionUrl = window.location.origin + ROUTES.REDIRECT;

    static fetchIssuers: ApiRequest = {
        url: () => api.mimotoHost + "/issuers",
        methodType: MethodType.GET,
        headers: () => {
            return {
                "Content-Type": ContentTypes.JSON
            };
        }
    };
    static fetchSpecificIssuer: ApiRequest = {
        url: (issuerId: string) => api.mimotoHost + `/issuers/${issuerId}`,
        methodType: MethodType.GET,
        headers: () => {
            return {
                "Content-Type": ContentTypes.JSON
            };
        }
    };
    static fetchIssuersConfiguration: ApiRequest = {
        url: (issuerId: string) =>
            api.mimotoHost + `/issuers/${issuerId}/configuration`,
        methodType: MethodType.GET,
        headers: () => {
            return {
                "Content-Type": ContentTypes.JSON
            };
        }
    };
    static fetchTokenAnddownloadVc: ApiRequest = {
        url: () => api.mimotoHost + `/credentials/download`,
        methodType: MethodType.POST,
        headers: () => {
            return {
                "accept": `${ContentTypes.SVG}, ${ContentTypes.PDF}`,
                "accept": `${ContentTypes.SVG}, ${ContentTypes.PDF}`,
                "Content-Type": ContentTypes.FORM_URL_ENCODED,
                "Cache-Control": "no-cache, no-store, must-revalidate"
            };
        },
        responseType: "blob"
    };
    static authorization = (
        currentIssuer: IssuerObject,
        filterCredentialWellknown: CredentialConfigurationObject,
        state: string,
        code_challenge: CodeChallengeObject,
        authorizationEndPoint: String
    ) => {
        return (
            `${authorizationEndPoint}` +
            `?response_type=code&` +
            `client_id=${currentIssuer.client_id}&` +
            `scope=${filterCredentialWellknown.scope}&` +
            `redirect_uri=${api.authorizationRedirectionUrl}&` +
            `state=${state}&` +
            `code_challenge=${code_challenge.codeChallenge}&` +
            `code_challenge_method=S256&` +
            `ui_locales=${i18n.language}`
        );
    };
    // method to fetch user profile
    static fetchUserProfile: ApiRequest = {
        url: () => api.mimotoHost + "/users/me",
        methodType: MethodType.GET,
        headers: () => {
            return {
                "Content-Type": ContentTypes.JSON
            };
        },
        credentials: "include"
    };

    static userLogout: ApiRequest = {
        url: () => api.mimotoHost + "/logout",
        methodType: MethodType.POST,
        headers: () => {
            return {
            };
        },
        credentials: "include"
    };

    // Fetch wallets API
    static fetchWallets: ApiRequest = {
        url: () => api.mimotoHost + "/wallets",
        methodType: MethodType.GET,
        headers: () => {
            return {
                "Content-Type": ContentTypes.JSON
            };
        },
        credentials: "include",
        includeXSRFToken: true
    };

    // Post wallet API with PIN
    static createWalletWithPin: ApiRequest = {
        url: () => api.mimotoHost + "/wallets",
        methodType: MethodType.POST,
        headers: () => {
            return {
                "Content-Type": ContentTypes.JSON
            };
        },
        credentials: "include",
        includeXSRFToken: true
    };

    static unlockWallet: ApiRequest = {
        url: (walletId: string) =>
            api.mimotoHost + `/wallets/${walletId}/unlock`,
        methodType: MethodType.POST,
        headers: () => {
            return {
                "Content-Type": ContentTypes.JSON
            };
        },
        credentials: "include",
        includeXSRFToken: true
    };

    static deleteWallet: ApiRequest = {
        url: (walletId: string) => api.mimotoHost + `/wallets/${walletId}`,
        methodType: MethodType.DELETE,
        headers: () => {
            return {
                "Content-Type": ContentTypes.JSON
            };
        },
        credentials: "include",
        includeXSRFToken: true
    };

    static downloadVCInloginFlow: ApiRequest = {
        url: () => {
            const walletId = AppStorage.getItem(KEYS.WALLET_ID);
            return api.mimotoHost + `/wallets/${walletId}/credentials`;
        },
        methodType: MethodType.POST,
        headers: (locale: string) => {
            return {
                "accept": ContentTypes.JSON,
                "Content-Type": ContentTypes.JSON,
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Accept-Language": locale
            };
        },
        credentials: "include",
        includeXSRFToken: true
    };

    static fetchWalletVCs: ApiRequest = {
        url: () => {
            const walletId = AppStorage.getItem(KEYS.WALLET_ID);
            return (
                api.mimotoHost +
                `/wallets/${walletId}/credentials`
            );
        },
        methodType: MethodType.GET,
        headers: (locale: string) => {
            return {
                "Content-Type": ContentTypes.JSON,
                "Accept-Language": locale,
            };
        },
        credentials: "include"
    };

    static fetchWalletCredentialPreview: ApiRequest = {
        url: (credentialId: string) => {
            const walletId = AppStorage.getItem(KEYS.WALLET_ID);
            return (
                api.mimotoHost +
                `/wallets/${walletId}/credentials/${credentialId}?action=inline`
            );
        },
        methodType: MethodType.GET,
        headers: (locale: string) => {
            return {
                "Content-Type": ContentTypes.JSON,
                "Accept-Language": locale,
                "Accept": ContentTypes.PDF
            };
        },
        credentials: "include",
        responseType: "blob"
    };

    static downloadWalletCredentialPdf: ApiRequest = {
        url: (credentialId: string) => {
            const walletId = AppStorage.getItem(KEYS.WALLET_ID);
            return (
                api.mimotoHost +
                `/wallets/${walletId}/credentials/${credentialId}?action=download`
            );
        },
        methodType: MethodType.GET,
        headers: (locale: string) => {
            return {
                "Content-Type": ContentTypes.JSON,
                "Accept-Language": locale,
                "Accept": ContentTypes.PDF
            };
        },
        credentials: "include",
        responseType: "blob"
    };

    static deleteWalletCredential: ApiRequest = {
        url: (credentialId: string) => {
            const walletId = AppStorage.getItem(KEYS.WALLET_ID);
            return (
                api.mimotoHost +
                `/wallets/${walletId}/credentials/${credentialId}`
            );
        },
        methodType: MethodType.DELETE,
        headers: () => {
            return {
                "Content-Type": ContentTypes.JSON
            };
        },
        credentials: "include"
    }

    static validateVerifierRequest: ApiRequest = {
        url: () => {
            const walletId = AppStorage.getItem(KEYS.WALLET_ID);
            return `${api.mimotoHost}/wallets/${walletId}/presentations`;
        },
        methodType: MethodType.POST,
        headers: () => ({
            "Content-Type": ContentTypes.JSON,
            "Accept": ContentTypes.JSON,
        }),
        credentials: "include"
    };

    static addTrustedVerifier: ApiRequest = {
        url: () => {
            const walletId = AppStorage.getItem(KEYS.WALLET_ID);
            return `${api.mimotoHost}/wallets/${walletId}/trusted-verifiers`;
        },
        methodType: MethodType.POST,
        headers: () => ({
            "Content-Type": ContentTypes.JSON,
            "Accept": ContentTypes.JSON,
        }),
        credentials: "include"
    };

    static userRejectVerifier: ApiRequest = {
        url: (presentationId: string ) => {
            const walletId = AppStorage.getItem(KEYS.WALLET_ID);
            return `${api.mimotoHost}/wallets/${walletId}/presentations/${presentationId}`;
        },
        methodType: MethodType.PATCH,
        headers: () => ({
            "Content-Type": ContentTypes.JSON,
            "Accept": ContentTypes.JSON,
        }),
        credentials: "include"
    };

    static fetchPresentationCredentials: ApiRequest = {
        url: (presentationId: string) => {
            const walletId = AppStorage.getItem(KEYS.WALLET_ID);
            return api.mimotoHost + `/wallets/${walletId}/presentations/${presentationId}/credentials`;
        },
        methodType: MethodType.GET,
        headers: () => {
            return {
                "Content-Type": ContentTypes.JSON
            };
        },
        credentials: "include"
    };

    static submitPresentation: ApiRequest = {
        url: (presentationId: string) => {
            const walletId = AppStorage.getItem(KEYS.WALLET_ID);
            return `${api.mimotoHost}/wallets/${walletId}/presentations/${presentationId}`;
        },
        methodType: MethodType.PATCH,
        headers: () => ({
            "Content-Type": ContentTypes.JSON,
            "Accept": ContentTypes.JSON,
        }),
        credentials: "include"
    };
}