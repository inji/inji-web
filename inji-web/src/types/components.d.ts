import {IssuerObject} from "./data";
import React from "react";
import {RequestStatus} from "../utils/constants";

export type HomeFeatureItemProps = {
    itemno: number;
}

export type ItemBoxProps = {
    index: number;
    url: string;
    title: string;
    description?: string;
    onClick: () => void;
    testId: string;
}
export type NavBarProps = {
    title: string;
    link: string;
    search: boolean;
}

interface ErrorObj {
    code: string;
    message: string;
}

export type CredentialProps = {
    credentialId: string;
    credentialWellknown: CredentialConfigurationObject;
    index: number;
    setErrorObj: Dispatch<SetStateAction<ErrorObj>>;
};

export type FAQAccordionItemProps = {
    id: number;
    key: string;
    title: string;
    content: (string | { __html: string })[];
    open: number;
    setOpen: React.Dispatch<React.SetStateAction<number>>;
}
export type IssuerProps = {
    index: number;
    issuer: IssuerObject;
}

export type EmptyListContainerProps = {
    content: string;
    subContent?: string;
}

export type HeaderTileProps = {
    content: string;
    subContent: string;
}

export type IssuersListProps = {
    state: RequestStatus;
    showHeader?: boolean;
}
export type CTContentProps = {
    expiryTime: number;
    setExpiryTime: (expiry: number) => void;
}
export type CTHeaderProps = {
    title: string;
}
export type DSContentProps = {
    credentialName: string;
    credentialLogo: string;
    setIsCustomExpiryInTimesModalOpen: (isCustomExpiryInTimesModalOpen: boolean) => void;
}
export type DSDisclaimerProps = {
    content: string;
}
export type DSFooterProps = {
    successText: string;
    onSuccess: () => void;
    cancelText: string;
    onCancel: () => void;
    parent?: string;
}
export type DSHeaderProps = {
    title: string;
    subTitle: string;
}
export type CustomExpiryModalProps = {
    onCancel: () => void;
    onSuccess: () => void;
}
export type DataShareExpiryModalProps = {
    credentialName: string;
    credentialLogo: string;
    onSuccess: () => void;
    onCancel: () => void;
}
export type ModalWrapperProps = {
    header: React.ReactNode;
    content: React.ReactNode;
    footer: React.ReactNode;
    zIndex: number;
    size: string;
}

export type IconProps = {
    gradient?: boolean,
    style?: React.CSSProperties,
    testId: string
} & React.SVGProps<SVGSVGElement>;

// Presentation API types
export interface Verifier {
    id: string;
    name: string;
    logo: string | null;
    redirectUri: string | null;
    trusted: boolean;
    preregisteredWithWallet: boolean;
}
export interface PresentationCredential {
    credentialId: string;
    credentialTypeDisplayName: string;
    credentialTypeLogo: string;
    format: string;
}

export interface CredentialsResponse {
    availableCredentials?: PresentationCredential[];
    missingClaims?: any[];
    queryGroups?: import("./dcql").DcqlQueryGroup[];
    credentialSets?: import("./dcql").DcqlCredentialSet[];
}

export type CredentialShareSuccessViewProps = {
    verifierName: string;
    verifierLogo?: string | null;
    verifierTrusted?: boolean;
    credentials: PresentationCredential[];
    returnUrl: string;
    countdownStart?: number;
    onClose?: () => void;
}


export type PresentationCredentialListProps = {
    credentials?: PresentationCredential[];
    selectedCredentials?: string[];
    onCredentialToggle?: (credentialId: string) => void;
    state?: RequestStatus;
}