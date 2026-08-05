import { WalletCredential } from "../../../types/data";
import { DcqlCredentialActionVariant } from "./DcqlCredentialOptionCard";

type CredentialWithFormat = Pick<WalletCredential, "format"> | { format?: string };

const SD_JWT_CREDENTIAL_FORMATS = new Set(["dc+sd-jwt", "vc+sd-jwt"]);

export function isSdJwtCredential(credential: CredentialWithFormat): boolean {
    const format = credential.format;
    return format !== undefined && SD_JWT_CREDENTIAL_FORMATS.has(format);
}

export function getCredentialActionVariant(
    credential: WalletCredential
): DcqlCredentialActionVariant {
    if (isSdJwtCredential(credential)) {
        return "shareableFields";
    }

    return "viewCard";
}