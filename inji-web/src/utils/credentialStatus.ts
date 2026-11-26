import {CredentialStatusCheck, WalletCredential} from "../types/data";

export type CredentialCardStatus = "valid" | "revoked" | "suspended" | "expired" | "pending";

/**
 * Maps status-list checks onto the card badge.
 * A failed revocation check is Revoked. A failed suspension check is Suspended.
 * An expired credential is Expired unless it is revoked or suspended.
 * No status list means Valid. A null lastCheckedAt means the status has not been checked yet, so it is Pending.
 */
export function resolveCredentialStatus(
    statusChecks?: CredentialStatusCheck[] | null,
    isExpired?: boolean | null,
    lastCheckedAt?: string | null
): CredentialCardStatus | null {
    const hasStatusFields = statusChecks !== undefined || lastCheckedAt !== undefined || isExpired !== undefined;
    if (!hasStatusFields) {
        return null;
    }

    const checks = statusChecks ?? [];

    const failedPurpose = (purpose: string) =>
        checks.some((check) => check.purpose === purpose && check.valid === false);

    if (failedPurpose("revocation")) {
        return "revoked";
    }

    if (failedPurpose("suspension")) {
        return "suspended";
    }

    if (isExpired === true) {
        return "expired";
    }

    if (lastCheckedAt === null) {
        return "pending";
    }

    if (checks.length === 0 || checks.every((check) => check.valid === true)) {
        return "valid";
    }

    return null;
}

export function hasCredentialStatus(
    credential: Pick<WalletCredential, "statusChecks" | "lastCheckedAt" | "isExpired">
): boolean {
    return credential.statusChecks !== undefined
        || credential.lastCheckedAt !== undefined
        || credential.isExpired !== undefined;
}
