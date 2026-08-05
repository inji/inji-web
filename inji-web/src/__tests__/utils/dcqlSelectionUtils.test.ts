import {
    areRequiredQueryGroupsSatisfied,
    buildInitialDcqlSelection,
    flattenQueryGroupCredentials,
    formatQueryIdLabel,
    formatMissingClaimLabel,
    getSelectedCredentialIdsFlat,
    isDcqlCredentialsResponse,
    syncCredentialAcrossGroups,
    updateDcqlCredentialSelection,
} from "../../utils/dcqlSelectionUtils";
import { DcqlQueryGroup } from "../../types/dcql";
import { WalletCredential } from "../../types/data";

const makeCredential = (id: string): WalletCredential => ({
    credentialId: id,
    credentialTypeDisplayName: `Credential ${id}`,
    credentialTypeLogo: "",
    issuerDisplayName: "Issuer",
    issuerLogo: "",
    format: "ldp_vc",
});

const sharedCredential = makeCredential("shared-cred");

const queryGroups: DcqlQueryGroup[] = [
    {
        queryId: "government-identity",
        required: true,
        multiple: false,
        availableCredentials: [],
        missingClaims: ["$.type"],
    },
    {
        queryId: "age-proof",
        required: true,
        multiple: false,
        availableCredentials: [
            makeCredential("age-cred-1"),
            makeCredential("age-cred-2"),
        ],
        missingClaims: [],
    },
    {
        queryId: "optional-proof",
        required: false,
        multiple: true,
        availableCredentials: [makeCredential("optional-cred")],
        missingClaims: [],
    },
];

describe("dcqlSelectionUtils", () => {
    test("isDcqlCredentialsResponse detects queryGroups payload", () => {
        expect(isDcqlCredentialsResponse({ queryGroups: [] })).toBe(true);
        expect(isDcqlCredentialsResponse({ availableCredentials: [] })).toBe(false);
    });

    test("formatQueryIdLabel converts kebab-case query ids", () => {
        expect(formatQueryIdLabel("government-identity")).toBe(
            "Government Identity"
        );
    });

    test("formatMissingClaimLabel converts claim keys to readable labels", () => {
        expect(formatMissingClaimLabel("healthInsuranceId")).toBe(
            "Health Insurance Id"
        );
        expect(formatMissingClaimLabel("$.healthInsuranceId")).toBe(
            "Health Insurance Id"
        );
        expect(formatMissingClaimLabel("health_insurance_id")).toBe(
            "Health Insurance Id"
        );
        expect(formatMissingClaimLabel("prescriptionCode")).toBe(
            "Prescription Code"
        );
        expect(formatMissingClaimLabel("$.name")).toBe("Name");
        expect(formatMissingClaimLabel("$.age_above_18")).toBe("Age Above 18");
    });

    test("buildInitialDcqlSelection pre-selects required groups only", () => {
        const selection = buildInitialDcqlSelection(queryGroups);

        expect(selection["government-identity"]).toEqual([]);
        expect(selection["age-proof"]).toEqual(["age-cred-1"]);
        expect(selection["optional-proof"]).toEqual([]);
    });

    test("areRequiredQueryGroupsSatisfied requires every mandatory group", () => {
        const initial = buildInitialDcqlSelection(queryGroups);
        expect(areRequiredQueryGroupsSatisfied(queryGroups, initial)).toBe(false);

        const satisfied = {
            ...initial,
            "government-identity": ["gov-cred"],
        };
        expect(
            areRequiredQueryGroupsSatisfied(
                [
                    {
                        ...queryGroups[0],
                        availableCredentials: [makeCredential("gov-cred")],
                    },
                    queryGroups[1],
                ],
                satisfied
            )
        ).toBe(true);
    });

    test("syncCredentialAcrossGroups selects shared credential in all matching groups", () => {
        const groups: DcqlQueryGroup[] = [
            {
                queryId: "driver-license",
                required: true,
                multiple: false,
                availableCredentials: [sharedCredential],
                missingClaims: [],
            },
            {
                queryId: "age-above-18",
                required: true,
                multiple: false,
                availableCredentials: [
                    sharedCredential,
                    makeCredential("birth-cert"),
                ],
                missingClaims: [],
            },
        ];

        const synced = syncCredentialAcrossGroups(groups, {
            "driver-license": ["shared-cred"],
            "age-above-18": ["birth-cert"],
        });

        expect(synced["age-above-18"]).toEqual(["shared-cred"]);
    });

    test("updateDcqlCredentialSelection uses radio behavior when multiple is false", () => {
        const initial = buildInitialDcqlSelection(queryGroups);
        const updated = updateDcqlCredentialSelection(
            queryGroups,
            initial,
            "age-proof",
            "age-cred-2",
            true
        );

        expect(updated["age-proof"]).toEqual(["age-cred-2"]);
    });

    test("flattenQueryGroupCredentials returns unique credentials", () => {
        const groups: DcqlQueryGroup[] = [
            {
                queryId: "a",
                required: true,
                multiple: false,
                availableCredentials: [sharedCredential],
                missingClaims: [],
            },
            {
                queryId: "b",
                required: true,
                multiple: false,
                availableCredentials: [sharedCredential, makeCredential("other")],
                missingClaims: [],
            },
        ];

        expect(flattenQueryGroupCredentials(groups)).toHaveLength(2);
    });

    test("getSelectedCredentialIdsFlat deduplicates selected credentials", () => {
        const flat = getSelectedCredentialIdsFlat({
            a: ["cred-1"],
            b: ["cred-1", "cred-2"],
        });

        expect(flat).toEqual(["cred-1", "cred-2"]);
    });
});
