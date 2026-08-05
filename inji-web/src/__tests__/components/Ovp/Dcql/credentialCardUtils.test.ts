import { WalletCredential } from "../../../../types/data";
import {
    getCredentialActionVariant,
    isSdJwtCredential,
} from "../../../../components/Ovp/Dcql/credentialCardUtils";

const makeCredential = (format: string): WalletCredential => ({
    credentialId: "cred-1",
    credentialTypeDisplayName: "Test Credential",
    credentialTypeLogo: "",
    issuerDisplayName: "Issuer",
    issuerLogo: "",
    format,
});

describe("credentialCardUtils", () => {
    test("isSdJwtCredential returns true for SD-JWT format strings", () => {
        expect(isSdJwtCredential(makeCredential("dc+sd-jwt"))).toBe(true);
        expect(isSdJwtCredential(makeCredential("vc+sd-jwt"))).toBe(true);
    });

    test("isSdJwtCredential returns false for non SD-JWT formats", () => {
        expect(isSdJwtCredential(makeCredential("ldp_vc"))).toBe(false);
        expect(isSdJwtCredential(makeCredential("sd-jwt"))).toBe(false);
        expect(isSdJwtCredential({ format: undefined })).toBe(false);
    });

    test("returns shareableFields for SD-JWT credentials", () => {
        expect(
            getCredentialActionVariant(makeCredential("dc+sd-jwt"))
        ).toBe("shareableFields");
        expect(
            getCredentialActionVariant(makeCredential("vc+sd-jwt"))
        ).toBe("shareableFields");
    });

    test("returns viewCard for LDP-VC credentials", () => {
        expect(getCredentialActionVariant(makeCredential("ldp_vc"))).toBe(
            "viewCard"
        );
    });
});
