export const KEYS = {
    USER: 'user',
    WALLET_ID: 'walletId',
    REDIRECT_TO: 'redirectTo',
};

// This constant exposes the pages used in the application. This will be used only by the Router component.
export const Pages = {
    ROOT: "/",
    USER: "user",
    HOME: "home",
    ISSUERS: "issuers",
    ISSUER_TEMPLATE: "issuers/:issuerId",
    CREDENTIALS: "credentials",
    PROFILE: "profile",
    FAQ: "faq",
    REDIRECT: "redirect",
    RESET_PASSCODE: "reset-passcode",
    PASSCODE: "passcode",
    AUTHORIZE: "authorize"
}

// This constant exposes the routes of the application which can be used across the component to avoid hardcoded navigation urls
export const ROUTES = {
    ROOT: Pages.ROOT,
    USER: `/${Pages.USER}`,
    USER_PASSCODE: `/${Pages.USER}/${Pages.PASSCODE}`,
    USER_HOME: `/${Pages.USER}/${Pages.HOME}`,
    USER_ISSUERS: `/${Pages.USER}/${Pages.ISSUERS}`,
    ISSUERS: `/${Pages.ISSUERS}`,
    USER_ISSUER: (id: string) => `/${Pages.USER}/${Pages.ISSUERS}/${id}`,
    ISSUER: (id: string) => `/${Pages.ISSUERS}/${id}`,
    REDIRECT: `/${Pages.REDIRECT}`,
    USER_CREDENTIALS: `/${Pages.USER}/${Pages.CREDENTIALS}`,
    USER_PROFILE: `/${Pages.USER}/${Pages.PROFILE}`,
    FAQ: `/${Pages.FAQ}`,
    USER_FAQ: `/${Pages.USER}/${Pages.FAQ}`,
    USER_RESET_PASSCODE: `/${Pages.USER}/${Pages.RESET_PASSCODE}`,
    USER_AUTHORIZE: `/${Pages.USER}/${Pages.AUTHORIZE}`,
} as const;

export const HTTP_STATUS_CODES = {
    OK: 200,
    MULTIPLE_CHOICES: 300,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
    LOCKED: 423
}

export const NETWORK_ERROR_MESSAGE = "Network Error"

export enum RequestStatus {
    LOADING,
    DONE,
    ERROR
}

export const pdfWorkerSource = (pdfVersion : string) => `//unpkg.com/pdfjs-dist@${pdfVersion}/build/pdf.worker.min.mjs`;

export const passcodeLength = 6;

export const LANDING_VISITED = "landingVisited";

export const OPENID_VP_LOGIN = "openIdVpLogin";

export const OPENID4VP_AUTHORIZE_PREFIX = "openid4vp://authorize";