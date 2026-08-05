import { WalletCredential } from "./data";

export interface DcqlQueryGroup {
    queryId: string;
    required: boolean;
    multiple: boolean;
    availableCredentials: WalletCredential[];
    missingClaims: string[];
}

export interface DcqlCredentialSet {
    required: boolean;
    options: string[][];
}

export interface DcqlCredentialsResponse {
    queryGroups: DcqlQueryGroup[];
    credentialSets?: DcqlCredentialSet[];
}

/** queryId -> selected credential IDs for that group */
export type DcqlSelectionState = Record<string, string[]>;

/** optionIndex -> queryId -> selected credential IDs within one credential set */
export type DcqlOptionSelectionState = Record<number, Record<string, string[]>>;

/** credentialSetIndex -> per-option selection state */
export type DcqlCredentialSetSelectionState = Record<
    number,
    DcqlOptionSelectionState
>;
