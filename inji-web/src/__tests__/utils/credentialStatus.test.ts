import {hasCredentialStatus, resolveCredentialStatus} from "../../utils/credentialStatus";

describe("resolveCredentialStatus", () => {
    it("returns valid when every status check passed", () => {
        expect(resolveCredentialStatus([{purpose: "status", valid: true}])).toBe("valid");
        expect(resolveCredentialStatus([{purpose: "valid", valid: true}])).toBe("valid");
        expect(resolveCredentialStatus([{purpose: "revocation", valid: true}])).toBe("valid");
    });

    it("returns revoked when a revocation check failed", () => {
        expect(resolveCredentialStatus([{purpose: "revocation", valid: false}])).toBe("revoked");
        expect(resolveCredentialStatus([
            {purpose: "suspension", valid: true},
            {purpose: "revocation", valid: false},
        ])).toBe("revoked");
    });

    it("shows status when there is no status list", () => {
        expect(hasCredentialStatus({
            statusChecks: [],
            lastCheckedAt: "2026-11-25T05:09:11.190114Z",
            isExpired: false,
        })).toBe(true);
        expect(resolveCredentialStatus([], false, "2026-11-25T05:09:11.190114Z")).toBe("valid");
        expect(resolveCredentialStatus(null, false, "2026-11-25T05:09:11.190114Z")).toBe("valid");
    });

    it("returns pending when lastCheckedAt is null", () => {
        expect(resolveCredentialStatus([], false, null)).toBe("pending");
        expect(resolveCredentialStatus(undefined, undefined, null)).toBe("pending");
    });

    it("returns suspended when a suspension check failed", () => {
        expect(resolveCredentialStatus([{purpose: "suspension", valid: false}])).toBe("suspended");
        expect(resolveCredentialStatus([
            {purpose: "revocation", valid: true},
            {purpose: "suspension", valid: false},
        ])).toBe("suspended");
        expect(resolveCredentialStatus([
            {purpose: "revocation", valid: false},
            {purpose: "suspension", valid: false},
        ])).toBe("revoked");
    });

    it("returns expired when isExpired is true unless the credential is revoked or suspended", () => {
        expect(resolveCredentialStatus([{purpose: "revocation", valid: true}], true)).toBe("expired");
        expect(resolveCredentialStatus([], true)).toBe("expired");
        expect(resolveCredentialStatus([{purpose: "revocation", valid: false}], true)).toBe("revoked");
        expect(resolveCredentialStatus([{purpose: "suspension", valid: false}], true)).toBe("suspended");
        expect(resolveCredentialStatus([{purpose: "revocation", valid: true}], false)).toBe("valid");
    });

    it("returns no status when the credential has no status fields", () => {
        expect(resolveCredentialStatus(undefined, undefined, undefined)).toBeNull();
        expect(hasCredentialStatus({})).toBe(false);
    });

    it("returns no status when a check is inconclusive", () => {
        expect(resolveCredentialStatus(
            [{purpose: "revocation", valid: null}],
            false,
            "2026-11-25T05:09:11.190114Z"
        )).toBeNull();
    });
});
