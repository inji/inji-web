import { WalletCredential } from "../../../../types/data";
import {
    buildDcqlSelectedSdClaims,
    buildMdocDefaultSdClaims,
    getCredentialActionVariant,
    isMdocCredential,
    isSdJwtCredential,
    isSelectivelyDisclosableCredential,
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

    test("isMdocCredential returns true only for mso_mdoc", () => {
        expect(isMdocCredential(makeCredential("mso_mdoc"))).toBe(true);
        expect(isMdocCredential(makeCredential("dc+sd-jwt"))).toBe(false);
        expect(isMdocCredential({ format: undefined })).toBe(false);
    });

    test("isSelectivelyDisclosableCredential covers SD-JWT and mdoc", () => {
        expect(isSelectivelyDisclosableCredential(makeCredential("dc+sd-jwt"))).toBe(true);
        expect(isSelectivelyDisclosableCredential(makeCredential("vc+sd-jwt"))).toBe(true);
        expect(isSelectivelyDisclosableCredential(makeCredential("mso_mdoc"))).toBe(true);
        expect(isSelectivelyDisclosableCredential(makeCredential("ldp_vc"))).toBe(false);
    });

    test("returns shareableFields for mdoc credentials", () => {
        expect(getCredentialActionVariant(makeCredential("mso_mdoc"))).toBe(
            "shareableFields"
        );
    });

    test("buildMdocDefaultSdClaims preselects requested claims of mdoc credentials only", () => {
        const mdoc = {
            ...makeCredential("mso_mdoc"),
            credentialId: "mdoc-1",
            sdClaims: ["$['org.iso.18013.5.1']['family_name']"],
        };
        const mdocWithoutClaims = { ...makeCredential("mso_mdoc"), credentialId: "mdoc-2", sdClaims: [] };
        const sdJwt = { ...makeCredential("dc+sd-jwt"), credentialId: "sd-1", sdClaims: ["$.name"] };

        expect(buildMdocDefaultSdClaims([mdoc, mdocWithoutClaims, sdJwt])).toEqual({
            "mdoc-1": ["$['org.iso.18013.5.1']['family_name']"],
        });
    });

    describe("buildDcqlSelectedSdClaims", () => {
        const dob = { ...makeCredential("dc+sd-jwt"), credentialId: "sd-1", sdClaims: ["dateOfBirth"] };
        const region = { ...makeCredential("dc+sd-jwt"), credentialId: "sd-1", sdClaims: ["region"] };
        const otherCard = { ...makeCredential("dc+sd-jwt"), credentialId: "sd-2", sdClaims: ["region"] };
        const queryGroups = [
            { queryId: "dob_q", required: true, multiple: false, availableCredentials: [dob], missingClaims: [] },
            { queryId: "region_q", required: true, multiple: false, availableCredentials: [region, otherCard], missingClaims: [] },
        ];

        test("sends the claims of every query a card is picked for", () => {
            expect(
                buildDcqlSelectedSdClaims(queryGroups, { dob_q: ["sd-1"], region_q: ["sd-1"] })
            ).toEqual({ "sd-1": ["dateOfBirth", "region"] });
        });

        test("follows the card picked for each query", () => {
            expect(
                buildDcqlSelectedSdClaims(queryGroups, { dob_q: ["sd-1"], region_q: ["sd-2"] })
            ).toEqual({ "sd-1": ["dateOfBirth"], "sd-2": ["region"] });
        });

        test("skips queries with no card picked and cards without selectable claims", () => {
            const ldp = { ...makeCredential("ldp_vc"), credentialId: "ldp-1", sdClaims: ["name"] };
            const groups = [
                ...queryGroups,
                { queryId: "ldp_q", required: false, multiple: false, availableCredentials: [ldp], missingClaims: [] },
            ];
            expect(buildDcqlSelectedSdClaims(groups, { dob_q: ["sd-1"], ldp_q: ["ldp-1"] })).toEqual({
                "sd-1": ["dateOfBirth"],
            });
        });
    });
});
